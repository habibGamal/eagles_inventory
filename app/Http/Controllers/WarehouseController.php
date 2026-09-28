<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    /**
     * Display a listing of warehouses with summary stats.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = Warehouse::query()
            ->withCount(['stockBalances', 'purchaseInvoices', 'dispatchVouchers'])
            ->when($search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest('id');

        $warehouses = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Warehouse::count(),
            'active' => Warehouse::where('is_active', true)->count(),
            'inactive' => Warehouse::where('is_active', false)->count(),
        ];

        return Inertia::render('warehouses/index', [
            'warehouses' => $warehouses,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Display the specified warehouse details and its items stock quantities.
     */
    public function show(Request $request, Warehouse $warehouse): Response
    {
        $search = $request->string('search')->trim()->value();
        $categoryId = $request->integer('category_id') ?: null;
        $stockStatus = $request->string('stock_status')->trim()->value();

        $balancesQuery = $warehouse->stockBalances()
            ->with([
                'item' => function ($q) {
                    $q->select(['id', 'name', 'category_id', 'unit_id', 'description', 'minimum_stock', 'is_active'])
                        ->with(['category:id,name', 'unit:id,name,symbol']);
                },
            ])
            ->whereHas('item', function ($q) use ($search, $categoryId) {
                if ($search) {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                }
                if ($categoryId) {
                    $q->where('category_id', $categoryId);
                }
            });

        if ($stockStatus === 'in_stock') {
            $balancesQuery->where('quantity', '>', 0);
        } elseif ($stockStatus === 'out_of_stock') {
            $balancesQuery->where('quantity', '<=', 0);
        } elseif ($stockStatus === 'low_stock') {
            $balancesQuery->where('quantity', '>', 0)
                ->whereExists(function ($sub) {
                    $sub->selectRaw(1)
                        ->from('items')
                        ->whereColumn('items.id', 'stock_balances.item_id')
                        ->whereColumn('stock_balances.quantity', '<=', 'items.minimum_stock');
                });
        }

        $stockBalances = $balancesQuery
            ->orderByDesc('quantity')
            ->paginate(15)
            ->withQueryString();

        // Calculate summary statistics for this warehouse
        $allBalances = $warehouse->stockBalances()->with('item:id,minimum_stock')->get();
        $totalItemsCount = $allBalances->count();
        $totalQuantity = round((float) $allBalances->sum('quantity'), 3);
        $inStockCount = 0;
        $lowStockCount = 0;
        $outOfStockCount = 0;

        foreach ($allBalances as $balance) {
            $qty = (float) $balance->quantity;
            $min = (float) ($balance->item->minimum_stock ?? 0);
            if ($qty <= 0) {
                $outOfStockCount++;
            } elseif ($qty <= $min) {
                $lowStockCount++;
                $inStockCount++;
            } else {
                $inStockCount++;
            }
        }

        $categoryOptions = ItemCategory::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $recentMovements = $warehouse->stockMovements()
            ->with([
                'item:id,name,unit_id',
                'item.unit:id,symbol',
                'creator:id,name',
            ])
            ->latest('id')
            ->limit(15)
            ->get();

        return Inertia::render('warehouses/show', [
            'warehouse' => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'is_active' => $warehouse->is_active,
                'created_at' => $warehouse->created_at?->toISOString() ?? (string) $warehouse->created_at,
                'updated_at' => $warehouse->updated_at?->toISOString() ?? (string) $warehouse->updated_at,
            ],
            'stockBalances' => $stockBalances,
            'categoryOptions' => $categoryOptions,
            'recentMovements' => $recentMovements,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'stock_status' => $stockStatus,
            ],
            'stats' => [
                'total_items' => $totalItemsCount,
                'total_quantity' => $totalQuantity,
                'in_stock' => $inStockCount,
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
                'movements_count' => $warehouse->stockMovements()->count(),
            ],
        ]);
    }

    /**
     * Store a newly created warehouse.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Warehouse::create([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('warehouses.index')->with('success', 'تم إنشاء المستودع بنجاح');
    }

    /**
     * Update the specified warehouse.
     */
    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $warehouse->update([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('warehouses.index')->with('success', 'تم تحديث بيانات المستودع بنجاح');
    }

    /**
     * Remove the specified warehouse.
     */
    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        if ($warehouse->stockBalances()->exists() || $warehouse->purchaseInvoices()->exists() || $warehouse->dispatchVouchers()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف هذا المستودع لوجود أرصدة مخزنية أو فواتير توريد أو أذون صرف مرتبطة به');
        }

        $warehouse->delete();

        return redirect()->route('warehouses.index')->with('success', 'تم حذف المستودع بنجاح');
    }
}
