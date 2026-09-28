<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Enums\WasteReason;
use App\Models\DispatchVoucher;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\PurchaseInvoice;
use App\Models\StockAdjustment;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Models\WasteReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * Display a listing of inventory items.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $categoryId = $request->integer('category_id') ?: null;

        $query = Item::query()
            ->with(['category:id,name', 'unit:id,name,symbol'])
            ->withCount(['stockBalances', 'stockMovements'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->latest('id');

        $items = $query->paginate(10)->withQueryString();

        $categoryOptions = ItemCategory::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $unitOptions = Unit::query()
            ->select(['id', 'name', 'symbol'])
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => Item::count(),
            'active' => Item::where('is_active', true)->count(),
            'categories' => Item::distinct()->count('category_id'),
        ];

        return Inertia::render('items/index', [
            'items' => $items,
            'categoryOptions' => $categoryOptions,
            'unitOptions' => $unitOptions,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Display the specified item with stock movements and warehouse balances.
     */
    public function show(Request $request, Item $item): Response
    {
        $item->load([
            'category:id,name',
            'unit:id,name,symbol',
        ]);

        // 1. Fetch all warehouses to show stock in each warehouse
        $warehouses = Warehouse::query()
            ->orderBy('name')
            ->get(['id', 'name', 'is_active']);

        $balances = StockBalance::where('item_id', $item->id)
            ->get()
            ->keyBy('warehouse_id');

        $movementStatsPerWarehouse = StockMovement::where('item_id', $item->id)
            ->selectRaw('warehouse_id, count(*) as movements_count, max(movement_date) as last_movement_at')
            ->groupBy('warehouse_id')
            ->get()
            ->keyBy('warehouse_id');

        $totalStock = 0.0;
        foreach ($warehouses as $wh) {
            $bal = $balances->get($wh->id);
            $totalStock += $bal ? (float) $bal->quantity : 0.0;
        }

        $warehousesStock = $warehouses->map(function ($wh) use ($balances, $movementStatsPerWarehouse, $totalStock) {
            $bal = $balances->get($wh->id);
            $qty = $bal ? (float) $bal->quantity : 0.0;
            $stats = $movementStatsPerWarehouse->get($wh->id);
            $percentage = $totalStock > 0 ? round(($qty / $totalStock) * 100, 1) : 0;

            return [
                'warehouse_id' => $wh->id,
                'warehouse_name' => $wh->name,
                'is_active' => (bool) $wh->is_active,
                'quantity' => $qty,
                'percentage' => $percentage,
                'movements_count' => $stats ? (int) $stats->movements_count : 0,
                'last_movement_at' => $stats?->last_movement_at,
                'updated_at' => $bal?->updated_at?->toIso8601String(),
            ];
        });

        // 2. Summary stats for the item
        $inwardQty = (float) StockMovement::where('item_id', $item->id)
            ->whereIn('movement_type', [
                StockMovementType::PurchaseIn->value,
                StockMovementType::AdjustmentIn->value,
            ])
            ->sum('quantity');

        $outwardQty = (float) StockMovement::where('item_id', $item->id)
            ->whereIn('movement_type', [
                StockMovementType::DispatchOut->value,
                StockMovementType::WasteOut->value,
                StockMovementType::AdjustmentOut->value,
            ])
            ->sum('quantity');

        $totalMovementsCount = StockMovement::where('item_id', $item->id)->count();
        $lastMovement = StockMovement::where('item_id', $item->id)->latest('movement_date')->first();

        $warehousesWithStockCount = $warehousesStock->filter(fn ($ws) => $ws['quantity'] > 0)->count();

        $minStock = (float) $item->minimum_stock;
        $stockHealth = 'good';
        if ($totalStock <= 0) {
            $stockHealth = 'out_of_stock';
        } elseif ($totalStock < $minStock) {
            $stockHealth = 'critical';
        } elseif ($totalStock === $minStock) {
            $stockHealth = 'warning';
        }

        $summary = [
            'total_stock' => $totalStock,
            'minimum_stock' => $minStock,
            'stock_health' => $stockHealth,
            'warehouses_with_stock_count' => $warehousesWithStockCount,
            'total_warehouses_count' => $warehouses->count(),
            'total_inward' => $inwardQty,
            'total_outward' => $outwardQty,
            'total_movements_count' => $totalMovementsCount,
            'last_movement_date' => $lastMovement?->movement_date?->toIso8601String(),
        ];

        // 3. Paginated stock movements with filters
        $warehouseFilter = $request->integer('warehouse_id') ?: null;
        $movementTypeFilter = $request->string('movement_type')->trim()->value() ?: null;
        $dateFromFilter = $request->string('date_from')->trim()->value() ?: null;
        $dateToFilter = $request->string('date_to')->trim()->value() ?: null;

        $movementsQuery = StockMovement::query()
            ->where('item_id', $item->id)
            ->with([
                'warehouse:id,name',
                'createdBy:id,name',
                'reference',
            ])
            ->when($warehouseFilter, function ($q, $warehouseId) {
                $q->where('warehouse_id', $warehouseId);
            })
            ->when($movementTypeFilter, function ($q, $type) {
                $q->where('movement_type', $type);
            })
            ->when($dateFromFilter, function ($q, $dateFrom) {
                $q->whereDate('movement_date', '>=', $dateFrom);
            })
            ->when($dateToFilter, function ($q, $dateTo) {
                $q->whereDate('movement_date', '<=', $dateTo);
            })
            ->latest('movement_date')
            ->latest('id');

        $paginatedMovements = $movementsQuery->paginate(15)->withQueryString();

        $movements = $paginatedMovements->through(function (StockMovement $m) {
            $ref = $m->reference;
            $refData = [
                'type' => class_basename($m->reference_type),
                'id' => $m->reference_id,
                'label' => "مستند #{$m->reference_id}",
                'party' => '',
                'status' => null,
                'status_label' => null,
            ];

            if ($ref instanceof PurchaseInvoice) {
                $ref->loadMissing('supplier:id,name');
                $refData['label'] = "فاتورة مشتريات #{$ref->id}";
                $refData['party'] = $ref->supplier?->name ?? 'مورد غير محدد';
                $refData['status'] = $ref->status->value;
                $refData['status_label'] = match ($ref->status) {
                    DocumentStatus::Draft => 'مسودة',
                    DocumentStatus::Posted => 'مرحل ومعتمد',
                    DocumentStatus::Closed => 'مغلق',
                    DocumentStatus::Cancelled => 'ملغي',
                };
            } elseif ($ref instanceof DispatchVoucher) {
                $ref->loadMissing('sector:id,name');
                $refData['label'] = "إذن صرف #{$ref->id}";
                $party = $ref->sector?->name;
                if ($ref->recipient_name_snapshot) {
                    $party = $party ? "{$party} - {$ref->recipient_name_snapshot}" : $ref->recipient_name_snapshot;
                }
                $refData['party'] = $party ?? 'جهة غير محددة';
                $refData['status'] = $ref->status->value;
                $refData['status_label'] = match ($ref->status) {
                    DocumentStatus::Draft => 'مسودة',
                    DocumentStatus::Posted => 'مرحل ومعتمد',
                    DocumentStatus::Closed => 'مغلق',
                    DocumentStatus::Cancelled => 'ملغي',
                };
            } elseif ($ref instanceof WasteReport) {
                $refData['label'] = "تقرير هالك #{$ref->id}";
                $refData['party'] = match ($ref->reason) {
                    WasteReason::Expired => 'منتهي الصلاحية',
                    WasteReason::Damaged => 'تالف ومتهالك',
                    WasteReason::Broken => 'مكسور',
                    WasteReason::Lost => 'مفقود',
                    WasteReason::Spoiled => 'فاسد',
                    default => 'أسباب أخرى',
                };
                $refData['status'] = $ref->status->value;
                $refData['status_label'] = match ($ref->status) {
                    DocumentStatus::Draft => 'مسودة',
                    DocumentStatus::Posted => 'مرحل ومعتمد',
                    DocumentStatus::Closed => 'مغلق',
                    DocumentStatus::Cancelled => 'ملغي',
                };
            } elseif ($ref instanceof StockAdjustment) {
                $refData['label'] = "إذن تسوية #{$ref->id}";
                $refData['party'] = $ref->reason ?: 'تسوية جردية';
                $refData['status'] = $ref->status->value;
                $refData['status_label'] = match ($ref->status) {
                    DocumentStatus::Draft => 'مسودة',
                    DocumentStatus::Posted => 'مرحل ومعتمد',
                    DocumentStatus::Closed => 'مغلق',
                    DocumentStatus::Cancelled => 'ملغي',
                };
            }

            return [
                'id' => $m->id,
                'movement_date' => $m->movement_date->toIso8601String(),
                'movement_type' => $m->movement_type->value,
                'movement_type_label' => match ($m->movement_type) {
                    StockMovementType::PurchaseIn => 'توريد مشتريات (وارد)',
                    StockMovementType::DispatchOut => 'صرف مخزني (صادر)',
                    StockMovementType::WasteOut => 'هالك وتالف (صادر)',
                    StockMovementType::AdjustmentIn => 'تسوية جردية (بالزيادة)',
                    StockMovementType::AdjustmentOut => 'تسوية جردية (بالنقصان)',
                },
                'is_ingress' => $m->movement_type->isIngress(),
                'quantity' => (float) $m->quantity,
                'balance_after' => (float) $m->balance_after,
                'warehouse' => [
                    'id' => $m->warehouse?->id,
                    'name' => $m->warehouse?->name ?? 'غير محدد',
                ],
                'created_by' => [
                    'id' => $m->createdBy?->id,
                    'name' => $m->createdBy?->name ?? 'النظام',
                ],
                'reference' => $refData,
            ];
        });

        $filterOptions = [
            'warehouses' => $warehouses->map(fn ($w) => ['id' => $w->id, 'name' => $w->name]),
            'movement_types' => [
                ['value' => StockMovementType::PurchaseIn->value, 'label' => 'توريد مشتريات (وارد)'],
                ['value' => StockMovementType::DispatchOut->value, 'label' => 'صرف مخزني (صادر)'],
                ['value' => StockMovementType::WasteOut->value, 'label' => 'هالك وتالف (صادر)'],
                ['value' => StockMovementType::AdjustmentIn->value, 'label' => 'تسوية جردية (بالزيادة)'],
                ['value' => StockMovementType::AdjustmentOut->value, 'label' => 'تسوية جردية (بالنقصان)'],
            ],
        ];

        return Inertia::render('items/show', [
            'item' => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category ? ['id' => $item->category->id, 'name' => $item->category->name] : null,
                'unit' => $item->unit ? ['id' => $item->unit->id, 'name' => $item->unit->name, 'symbol' => $item->unit->symbol] : null,
                'description' => $item->description,
                'minimum_stock' => (float) $item->minimum_stock,
                'is_active' => (bool) $item->is_active,
                'created_at' => $item->created_at?->toIso8601String(),
            ],
            'warehousesStock' => $warehousesStock,
            'summary' => $summary,
            'movements' => $movements,
            'filterOptions' => $filterOptions,
            'filters' => [
                'warehouse_id' => $warehouseFilter,
                'movement_type' => $movementTypeFilter,
                'date_from' => $dateFromFilter,
                'date_to' => $dateToFilter,
            ],
        ]);
    }

    /**
     * Store a newly created item.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:item_categories,id'],
            'unit_id' => ['required', 'exists:units,id'],
            'description' => ['nullable', 'string'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Item::create([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'unit_id' => $validated['unit_id'],
            'description' => $validated['description'] ?? null,
            'minimum_stock' => $validated['minimum_stock'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('items.index')->with('success', 'تم إنشاء الصنف بنجاح');
    }

    /**
     * Update the specified item.
     */
    public function update(Request $request, Item $item): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:item_categories,id'],
            'unit_id' => ['required', 'exists:units,id'],
            'description' => ['nullable', 'string'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $item->update([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'unit_id' => $validated['unit_id'],
            'description' => $validated['description'] ?? null,
            'minimum_stock' => $validated['minimum_stock'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('items.index')->with('success', 'تم تحديث بيانات الصنف بنجاح');
    }

    /**
     * Remove the specified item.
     */
    public function destroy(Item $item): RedirectResponse
    {
        if ($item->stockBalances()->exists() || $item->stockMovements()->exists() || $item->purchaseInvoiceItems()->exists() || $item->dispatchVoucherItems()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف هذا الصنف لوجود حركات مخزنية أو فواتير أو أذون صرف مرتبطة به');
        }

        $item->delete();

        return redirect()->route('items.index')->with('success', 'تم حذف الصنف بنجاح');
    }
}
