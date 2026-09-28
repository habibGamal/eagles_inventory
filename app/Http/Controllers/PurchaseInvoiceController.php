<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Models\Item;
use App\Models\PurchaseInvoice;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseInvoiceController extends Controller
{
    /**
     * Display a listing of purchase invoices with metrics and filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();
        $supplierId = $request->integer('supplier_id') ?: null;
        $warehouseId = $request->integer('warehouse_id') ?: null;
        $dateFrom = $request->string('date_from')->trim()->value();
        $dateTo = $request->string('date_to')->trim()->value();

        $query = PurchaseInvoice::query()
            ->with([
                'supplier:id,name,phone',
                'warehouse:id,name',
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
                    $sub->orWhere('notes', 'like', "%{$search}%")
                        ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                            $supplierQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($supplierId, function ($q, $supplierId) {
                $q->where('supplier_id', $supplierId);
            })
            ->when($warehouseId, function ($q, $warehouseId) {
                $q->where('warehouse_id', $warehouseId);
            })
            ->when($dateFrom, function ($q, $dateFrom) {
                $q->whereDate('invoice_date', '>=', $dateFrom);
            })
            ->when($dateTo, function ($q, $dateTo) {
                $q->whereDate('invoice_date', '<=', $dateTo);
            })
            ->latest('id');

        $invoices = $query->paginate(10)->withQueryString();

        $stats = [
            'total_count' => PurchaseInvoice::count(),
            'draft_count' => PurchaseInvoice::where('status', DocumentStatus::Draft)->count(),
            'posted_count' => PurchaseInvoice::whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed])->count(),
            'total_amount' => (float) PurchaseInvoice::where('status', '!=', DocumentStatus::Cancelled)->sum('total'),
        ];

        $supplierOptions = Supplier::query()
            ->select(['id', 'name', 'phone'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $warehouseOptions = Warehouse::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $itemOptions = Item::query()
            ->select(['id', 'name', 'unit_id'])
            ->with('unit:id,name,symbol')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('purchase-invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'supplier_id' => $supplierId,
                'warehouse_id' => $warehouseId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'stats' => $stats,
            'supplierOptions' => $supplierOptions,
            'warehouseOptions' => $warehouseOptions,
        ]);
    }

    /**
     * Show the form for creating a new purchase invoice.
     */
    public function create(): Response
    {
        $supplierOptions = Supplier::query()
            ->select(['id', 'name', 'phone'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $warehouseOptions = Warehouse::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $itemOptions = Item::query()
            ->select(['id', 'name', 'unit_id'])
            ->with('unit:id,name,symbol')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('purchase-invoices/create', [
            'supplierOptions' => $supplierOptions,
            'warehouseOptions' => $warehouseOptions,
            'itemOptions' => $itemOptions,
        ]);
    }

    /**
     * Store a newly created purchase invoice.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'invoice_date' => ['required', 'date'],
            'received_at' => ['nullable', 'date'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $shouldPostImmediately = $request->boolean('post_immediately', false);

        DB::transaction(function () use ($validated, $request, $shouldPostImmediately) {
            $discount = isset($validated['discount']) ? (float) $validated['discount'] : 0.0;
            $subtotal = 0.0;

            foreach ($validated['items'] as $itemData) {
                $subtotal += round((float) $itemData['quantity'] * (float) $itemData['unit_price'], 2);
            }

            $total = max(0.0, round($subtotal - $discount, 2));

            $invoice = PurchaseInvoice::create([
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'invoice_date' => $validated['invoice_date'],
                'received_at' => $validated['received_at'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'status' => DocumentStatus::Draft,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $lineTotal = round((float) $itemData['quantity'] * (float) $itemData['unit_price'], 2);
                $invoice->items()->create([
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total' => $lineTotal,
                ]);
            }

            if ($shouldPostImmediately) {
                $this->executePosting($invoice, $request->user()->id);
            }
        });

        $message = $shouldPostImmediately
            ? 'تم إنشاء واعتماد فاتورة التوريد وتحديث المخزون بنجاح'
            : 'تم إنشاء مسودة فاتورة التوريد بنجاح';

        return redirect()->route('purchase-invoices.index')->with('success', $message);
    }

    /**
     * Show the form for editing the specified purchase invoice.
     */
    public function edit(PurchaseInvoice $purchaseInvoice): Response|RedirectResponse
    {
        if ($purchaseInvoice->status !== DocumentStatus::Draft) {
            return redirect()->route('purchase-invoices.index')->with('error', 'لا يمكن تعديل فاتورة معتمدة أو ملغاة');
        }

        $purchaseInvoice->load([
            'supplier:id,name,phone',
            'warehouse:id,name',
            'items.item:id,name,unit_id',
            'items.item.unit:id,name,symbol',
        ]);

        $supplierOptions = Supplier::query()
            ->select(['id', 'name', 'phone'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $warehouseOptions = Warehouse::query()
            ->select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $itemOptions = Item::query()
            ->select(['id', 'name', 'unit_id'])
            ->with('unit:id,name,symbol')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('purchase-invoices/edit', [
            'invoice' => $purchaseInvoice,
            'supplierOptions' => $supplierOptions,
            'warehouseOptions' => $warehouseOptions,
            'itemOptions' => $itemOptions,
        ]);
    }

    /**
     * Update the specified purchase invoice (only drafts).
     */
    public function update(Request $request, PurchaseInvoice $purchaseInvoice): RedirectResponse
    {
        if ($purchaseInvoice->status !== DocumentStatus::Draft) {
            return redirect()->back()->with('error', 'لا يمكن تعديل فاتورة معتمدة أو ملغاة');
        }

        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'invoice_date' => ['required', 'date'],
            'received_at' => ['nullable', 'date'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $purchaseInvoice) {
            $discount = isset($validated['discount']) ? (float) $validated['discount'] : 0.0;
            $subtotal = 0.0;

            foreach ($validated['items'] as $itemData) {
                $subtotal += round((float) $itemData['quantity'] * (float) $itemData['unit_price'], 2);
            }

            $total = max(0.0, round($subtotal - $discount, 2));

            $purchaseInvoice->update([
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'invoice_date' => $validated['invoice_date'],
                'received_at' => $validated['received_at'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
            ]);

            $purchaseInvoice->items()->delete();

            foreach ($validated['items'] as $itemData) {
                $lineTotal = round((float) $itemData['quantity'] * (float) $itemData['unit_price'], 2);
                $purchaseInvoice->items()->create([
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total' => $lineTotal,
                ]);
            }
        });

        return redirect()->route('purchase-invoices.index')->with('success', 'تم تحديث بيانات فاتورة التوريد بنجاح');
    }

    /**
     * Post/Approve the draft purchase invoice and update stock ledger.
     */
    public function post(Request $request, PurchaseInvoice $purchaseInvoice): RedirectResponse
    {
        if ($purchaseInvoice->status !== DocumentStatus::Draft) {
            return redirect()->back()->with('error', 'هذه الفاتورة تم ترحيلها أو إلغاؤها مسبقاً');
        }

        DB::transaction(function () use ($purchaseInvoice, $request) {
            $this->executePosting($purchaseInvoice, $request->user()->id);
        });

        return redirect()->route('purchase-invoices.index')->with('success', 'تم اعتماد وترحيل فاتورة التوريد وتحديث الأرصدة المخزنية بنجاح');
    }

    /**
     * Remove the specified purchase invoice (only drafts).
     */
    public function destroy(PurchaseInvoice $purchaseInvoice): RedirectResponse
    {
        if ($purchaseInvoice->status !== DocumentStatus::Draft) {
            return redirect()->back()->with('error', 'لا يمكن حذف فاتورة معتمدة أو مرحّلة حفاظاً على سلامة حركة المخزون');
        }

        if ($purchaseInvoice->stockMovements()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف فاتورة مرتبطة بحركات مخزنية مسجلة');
        }

        DB::transaction(function () use ($purchaseInvoice) {
            $purchaseInvoice->items()->delete();
            $purchaseInvoice->delete();
        });

        return redirect()->route('purchase-invoices.index')->with('success', 'تم حذف فاتورة التوريد بنجاح');
    }

    /**
     * Helper to execute invoice posting, update stock balances, and insert stock movements.
     */
    protected function executePosting(PurchaseInvoice $invoice, int $userId): void
    {
        $invoice->update([
            'status' => DocumentStatus::Posted,
            'approved_by' => $userId,
            'approved_at' => now(),
            'received_at' => $invoice->received_at ?? now(),
        ]);

        $invoice->loadMissing('items');

        foreach ($invoice->items as $item) {
            $balance = StockBalance::firstOrCreate(
                [
                    'warehouse_id' => $invoice->warehouse_id,
                    'item_id' => $item->item_id,
                ],
                [
                    'quantity' => 0,
                ]
            );

            $newQuantity = round((float) $balance->quantity + (float) $item->quantity, 3);
            $balance->update(['quantity' => $newQuantity]);

            StockMovement::create([
                'warehouse_id' => $invoice->warehouse_id,
                'item_id' => $item->item_id,
                'movement_type' => StockMovementType::PurchaseIn,
                'quantity' => $item->quantity,
                'balance_after' => $newQuantity,
                'reference_type' => PurchaseInvoice::class,
                'reference_id' => $invoice->id,
                'movement_date' => $invoice->received_at ?? now(),
                'created_by' => $userId,
            ]);
        }
    }
}
