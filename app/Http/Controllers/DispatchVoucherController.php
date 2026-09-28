<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Models\DispatchVoucher;
use App\Models\DispatchVoucherItem;
use App\Models\Employee;
use App\Models\Item;
use App\Models\Sector;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class DispatchVoucherController extends Controller
{
    /**
     * Display a listing of dispatch vouchers with metrics and filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();
        $warehouseId = $request->integer('warehouse_id') ?: null;
        $sectorId = $request->integer('sector_id') ?: null;
        $dateFrom = $request->string('date_from')->trim()->value();
        $dateTo = $request->string('date_to')->trim()->value();

        $query = DispatchVoucher::query()
            ->with([
                'warehouse:id,name',
                'sector:id,name',
                'recipientEmployee:id,name,department',
                'issuedBy:id,name',
                'createdBy:id,name',
                'approvedBy:id,name',
                'items.item:id,name,unit_id',
                'items.item.unit:id,name,symbol',
            ])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    if (is_numeric($search)) {
                        $sub->where('id', (int) $search);
                    }
                    $sub->orWhere('recipient_name_snapshot', 'like', "%{$search}%")
                        ->orWhere('notes', 'like', "%{$search}%")
                        ->orWhereHas('sector', function ($sectorQuery) use ($search) {
                            $sectorQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($warehouseId, function ($q, $warehouseId) {
                $q->where('warehouse_id', $warehouseId);
            })
            ->when($sectorId, function ($q, $sectorId) {
                $q->where('sector_id', $sectorId);
            })
            ->when($dateFrom, function ($q, $dateFrom) {
                $q->whereDate('issue_date', '>=', $dateFrom);
            })
            ->when($dateTo, function ($q, $dateTo) {
                $q->whereDate('issue_date', '<=', $dateTo);
            })
            ->latest('id');

        $vouchers = $query->paginate(10)->withQueryString();

        $stats = [
            'total_count' => DispatchVoucher::count(),
            'draft_count' => DispatchVoucher::where('status', DocumentStatus::Draft)->count(),
            'posted_count' => DispatchVoucher::whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed])->count(),
            'total_items_dispatched' => (float) DispatchVoucherItem::whereHas('dispatchVoucher', function ($q) {
                $q->whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed]);
            })->sum('quantity'),
        ];

        $warehouseOptions = Warehouse::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sectorOptions = Sector::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('dispatch-vouchers/index', [
            'vouchers' => $vouchers,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'warehouse_id' => $warehouseId,
                'sector_id' => $sectorId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'stats' => $stats,
            'warehouseOptions' => $warehouseOptions,
            'sectorOptions' => $sectorOptions,
        ]);
    }

    /**
     * Show the form for creating a new dispatch voucher.
     */
    public function create(): Response
    {
        $warehouseOptions = Warehouse::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sectorOptions = Sector::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $employeeOptions = Employee::query()
            ->select(['id', 'name', 'department'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $userOptions = User::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $itemOptions = Item::query()
            ->select(['id', 'name', 'unit_id'])
            ->with('unit:id,name,symbol')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('dispatch-vouchers/create', [
            'warehouseOptions' => $warehouseOptions,
            'sectorOptions' => $sectorOptions,
            'employeeOptions' => $employeeOptions,
            'userOptions' => $userOptions,
            'itemOptions' => $itemOptions,
        ]);
    }

    /**
     * Store a newly created dispatch voucher.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'sector_id' => ['required', 'exists:sectors,id'],
            'recipient_employee_id' => ['nullable', 'exists:employees,id'],
            'recipient_name_snapshot' => ['required_without:recipient_employee_id', 'nullable', 'string', 'max:255'],
            'issued_by' => ['required', 'exists:users,id'],
            'issue_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
        ]);

        $recipientName = $validated['recipient_name_snapshot'] ?? null;
        if (empty($recipientName) && ! empty($validated['recipient_employee_id'])) {
            $employee = Employee::find($validated['recipient_employee_id']);
            $recipientName = $employee?->name;
        }

        if (empty($recipientName)) {
            return redirect()->back()->withErrors(['recipient_name_snapshot' => 'اسم المستلم مطلوب']);
        }

        $shouldPostImmediately = $request->boolean('post_immediately', false);

        try {
            DB::transaction(function () use ($validated, $recipientName, $request, $shouldPostImmediately) {
                $voucher = DispatchVoucher::create([
                    'warehouse_id' => $validated['warehouse_id'],
                    'sector_id' => $validated['sector_id'],
                    'recipient_employee_id' => $validated['recipient_employee_id'] ?? null,
                    'recipient_name_snapshot' => $recipientName,
                    'issued_by' => $validated['issued_by'],
                    'issue_date' => $validated['issue_date'],
                    'notes' => $validated['notes'] ?? null,
                    'status' => DocumentStatus::Draft,
                    'created_by' => $request->user()->id,
                ]);

                foreach ($validated['items'] as $itemData) {
                    $voucher->items()->create([
                        'item_id' => $itemData['item_id'],
                        'quantity' => $itemData['quantity'],
                    ]);
                }

                if ($shouldPostImmediately) {
                    $this->executePosting($voucher, $request->user()->id);
                }
            });
        } catch (RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        $message = $shouldPostImmediately
            ? 'تم إنشاء واعتماد إذن الصرف وخصم الكميات من المخزون بنجاح'
            : 'تم إنشاء مسودة إذن الصرف بنجاح';

        return redirect()->route('dispatch-vouchers.index')->with('success', $message);
    }

    /**
     * Show the form for editing the specified dispatch voucher.
     */
    public function edit(DispatchVoucher $dispatchVoucher): Response|RedirectResponse
    {
        if ($dispatchVoucher->status !== DocumentStatus::Draft) {
            return redirect()->route('dispatch-vouchers.index')->with('error', 'لا يمكن تعديل إذن صرف معتمد أو ملغي');
        }

        $dispatchVoucher->load([
            'warehouse:id,name',
            'sector:id,name',
            'recipientEmployee:id,name,department',
            'items.item:id,name,unit_id',
            'items.item.unit:id,name,symbol',
        ]);

        $warehouseOptions = Warehouse::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $sectorOptions = Sector::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $employeeOptions = Employee::query()
            ->select(['id', 'name', 'department'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $userOptions = User::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $itemOptions = Item::query()
            ->select(['id', 'name', 'unit_id'])
            ->with('unit:id,name,symbol')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('dispatch-vouchers/edit', [
            'voucher' => $dispatchVoucher,
            'warehouseOptions' => $warehouseOptions,
            'sectorOptions' => $sectorOptions,
            'employeeOptions' => $employeeOptions,
            'userOptions' => $userOptions,
            'itemOptions' => $itemOptions,
        ]);
    }

    /**
     * Update the specified dispatch voucher (only drafts).
     */
    public function update(Request $request, DispatchVoucher $dispatchVoucher): RedirectResponse
    {
        if ($dispatchVoucher->status !== DocumentStatus::Draft) {
            return redirect()->back()->with('error', 'لا يمكن تعديل إذن صرف معتمد أو ملغي');
        }

        $validated = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'sector_id' => ['required', 'exists:sectors,id'],
            'recipient_employee_id' => ['nullable', 'exists:employees,id'],
            'recipient_name_snapshot' => ['required_without:recipient_employee_id', 'nullable', 'string', 'max:255'],
            'issued_by' => ['required', 'exists:users,id'],
            'issue_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
        ]);

        $recipientName = $validated['recipient_name_snapshot'] ?? null;
        if (empty($recipientName) && ! empty($validated['recipient_employee_id'])) {
            $employee = Employee::find($validated['recipient_employee_id']);
            $recipientName = $employee?->name;
        }

        if (empty($recipientName)) {
            return redirect()->back()->withErrors(['recipient_name_snapshot' => 'اسم المستلم مطلوب']);
        }

        DB::transaction(function () use ($validated, $recipientName, $dispatchVoucher) {
            $dispatchVoucher->update([
                'warehouse_id' => $validated['warehouse_id'],
                'sector_id' => $validated['sector_id'],
                'recipient_employee_id' => $validated['recipient_employee_id'] ?? null,
                'recipient_name_snapshot' => $recipientName,
                'issued_by' => $validated['issued_by'],
                'issue_date' => $validated['issue_date'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $dispatchVoucher->items()->delete();

            foreach ($validated['items'] as $itemData) {
                $dispatchVoucher->items()->create([
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                ]);
            }
        });

        return redirect()->route('dispatch-vouchers.index')->with('success', 'تم تحديث بيانات إذن الصرف بنجاح');
    }

    /**
     * Post/Approve the draft dispatch voucher and decrement stock balances.
     */
    public function post(Request $request, DispatchVoucher $dispatchVoucher): RedirectResponse
    {
        if ($dispatchVoucher->status !== DocumentStatus::Draft) {
            return redirect()->back()->with('error', 'هذا الإذن تم اعتماده أو إلغاؤه مسبقاً');
        }

        try {
            DB::transaction(function () use ($dispatchVoucher, $request) {
                $this->executePosting($dispatchVoucher, $request->user()->id);
            });
        } catch (RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->route('dispatch-vouchers.index')->with('success', 'تم اعتماد وصرف إذن الصرف وخصم الكميات من المخزون بنجاح');
    }

    /**
     * Remove the specified dispatch voucher (only drafts).
     */
    public function destroy(DispatchVoucher $dispatchVoucher): RedirectResponse
    {
        if ($dispatchVoucher->status !== DocumentStatus::Draft) {
            return redirect()->back()->with('error', 'لا يمكن حذف إذن صرف معتمد أو مرحّل حفاظاً على سلامة حركة المخزون');
        }

        if ($dispatchVoucher->stockMovements()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف إذن صرف مسجل له حركات في سجل المخزون');
        }

        DB::transaction(function () use ($dispatchVoucher) {
            $dispatchVoucher->items()->delete();
            $dispatchVoucher->delete();
        });

        return redirect()->route('dispatch-vouchers.index')->with('success', 'تم حذف مسودة إذن الصرف بنجاح');
    }

    /**
     * Helper to execute voucher posting, decrement stock balances, and insert stock movements.
     */
    protected function executePosting(DispatchVoucher $voucher, int $userId): void
    {
        $voucher->loadMissing(['items.item', 'warehouse']);

        // 1. Verify balances first to prevent negative stock
        foreach ($voucher->items as $item) {
            $balance = StockBalance::where('warehouse_id', $voucher->warehouse_id)
                ->where('item_id', $item->item_id)
                ->first();

            $currentQty = $balance ? (float) $balance->quantity : 0.0;
            $requiredQty = (float) $item->quantity;

            if ($currentQty < $requiredQty) {
                $itemName = $item->item?->name ?? "صنف #{$item->item_id}";
                throw new RuntimeException("الرصيد المتوفر في المستودع غير كافٍ للصنف [{$itemName}]. المتوفر: {$currentQty}، المطلوب صرفه: {$requiredQty}");
            }
        }

        // 2. Decrement balances and log egress ledger movements
        foreach ($voucher->items as $item) {
            $balance = StockBalance::where('warehouse_id', $voucher->warehouse_id)
                ->where('item_id', $item->item_id)
                ->first();

            $newQuantity = round((float) $balance->quantity - (float) $item->quantity, 3);
            $balance->update(['quantity' => $newQuantity]);

            StockMovement::create([
                'warehouse_id' => $voucher->warehouse_id,
                'item_id' => $item->item_id,
                'movement_type' => StockMovementType::DispatchOut,
                'quantity' => $item->quantity,
                'balance_after' => $newQuantity,
                'reference_type' => DispatchVoucher::class,
                'reference_id' => $voucher->id,
                'movement_date' => $voucher->issue_date ?? now(),
                'created_by' => $userId,
            ]);
        }

        // 3. Mark voucher as posted/approved
        $voucher->update([
            'status' => DocumentStatus::Posted,
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }
}
