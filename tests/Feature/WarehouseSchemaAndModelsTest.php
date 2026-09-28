<?php

use App\Enums\AuditAction;
use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Enums\WasteReason;
use App\Models\AuditLog;
use App\Models\DispatchVoucher;
use App\Models\DispatchVoucherItem;
use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\Sector;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WasteReport;
use App\Models\WasteReportItem;

test('master catalog models can be created and cast attributes correctly', function () {
    $warehouse = Warehouse::factory()->create();
    expect($warehouse->is_active)->toBeTrue();

    $parentSector = Sector::factory()->create(['name' => 'Hotels']);
    $sector = Sector::factory()->withParent($parentSector)->create(['name' => 'Hotel A']);
    expect($sector->parent)->not->toBeNull()
        ->and($sector->parent->id)->toBe($parentSector->id)
        ->and($parentSector->children)->toHaveCount(1);

    $employee = Employee::factory()->create(['department' => 'Maintenance']);
    expect($employee->department)->toBe('Maintenance')
        ->and($employee->is_active)->toBeTrue();

    $parentCategory = ItemCategory::factory()->create(['name' => 'Food & Beverage']);
    $category = ItemCategory::factory()->withParent($parentCategory)->create(['name' => 'Dairy']);
    expect($category->parent->id)->toBe($parentCategory->id);

    $unit = Unit::factory()->create(['name' => 'Kilogram', 'symbol' => 'kg']);
    expect($unit->symbol)->toBe('kg');

    $item = Item::factory()->create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'minimum_stock' => '15.500',
    ]);
    expect($item->category->id)->toBe($category->id)
        ->and($item->unit->id)->toBe($unit->id)
        ->and($item->minimum_stock)->toBe('15.500')
        ->and($item->is_active)->toBeTrue();

    $supplier = Supplier::factory()->create();
    expect($supplier->is_active)->toBeTrue();
});

test('purchase invoice lifecycle, enums, casts, and items work properly', function () {
    $creator = User::factory()->create();
    $approver = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $warehouse = Warehouse::factory()->create();

    $invoice = PurchaseInvoice::factory()->create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'created_by' => $creator->id,
        'approved_by' => $approver->id,
        'status' => DocumentStatus::Closed,
        'subtotal' => '100.50',
        'discount' => '10.00',
        'total' => '90.50',
    ]);

    expect($invoice->status)->toBe(DocumentStatus::Closed)
        ->and($invoice->status->value)->toBe('CLOSED')
        ->and($invoice->subtotal)->toBe('100.50')
        ->and($invoice->total)->toBe('90.50')
        ->and($invoice->supplier->id)->toBe($supplier->id)
        ->and($invoice->warehouse->id)->toBe($warehouse->id)
        ->and($invoice->createdBy->id)->toBe($creator->id)
        ->and($invoice->approvedBy->id)->toBe($approver->id);

    $item = Item::factory()->create();
    $invoiceItem = PurchaseInvoiceItem::factory()->create([
        'purchase_invoice_id' => $invoice->id,
        'item_id' => $item->id,
        'quantity' => '10.000',
        'unit_price' => '9.05',
        'total' => '90.50',
    ]);

    expect($invoice->items)->toHaveCount(1)
        ->and($invoiceItem->quantity)->toBe('10.000')
        ->and($invoiceItem->total)->toBe('90.50')
        ->and($invoiceItem->item->id)->toBe($item->id);
});

test('dispatch voucher lifecycle, enums, casts, and items work properly', function () {
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $employee = Employee::factory()->create();
    $user = User::factory()->create();

    $voucher = DispatchVoucher::factory()->create([
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'recipient_employee_id' => $employee->id,
        'issued_by' => $user->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
    ]);

    expect($voucher->status)->toBe(DocumentStatus::Draft)
        ->and($voucher->warehouse->id)->toBe($warehouse->id)
        ->and($voucher->sector->id)->toBe($sector->id)
        ->and($voucher->recipientEmployee->id)->toBe($employee->id)
        ->and($voucher->issuedBy->id)->toBe($user->id);

    $item = Item::factory()->create();
    $itemRow = DispatchVoucherItem::factory()->create([
        'dispatch_voucher_id' => $voucher->id,
        'item_id' => $item->id,
        'quantity' => '5.250',
    ]);

    expect($voucher->items)->toHaveCount(1)
        ->and($itemRow->quantity)->toBe('5.250');
});

test('waste report with enums and line items works properly', function () {
    $report = WasteReport::factory()->create([
        'reason' => WasteReason::Expired,
        'status' => DocumentStatus::Draft,
    ]);

    expect($report->reason)->toBe(WasteReason::Expired)
        ->and($report->status)->toBe(DocumentStatus::Draft)
        ->and($report->warehouse)->not->toBeNull();

    $item = Item::factory()->create();
    $wasteItem = WasteReportItem::factory()->create([
        'waste_report_id' => $report->id,
        'item_id' => $item->id,
        'quantity' => '2.500',
    ]);

    expect($report->items)->toHaveCount(1)
        ->and($wasteItem->quantity)->toBe('2.500');
});

test('stock adjustment with line items works properly', function () {
    $adjustment = StockAdjustment::factory()->create([
        'status' => DocumentStatus::Draft,
    ]);

    $item = Item::factory()->create();
    $adjustmentItem = StockAdjustmentItem::factory()->create([
        'stock_adjustment_id' => $adjustment->id,
        'item_id' => $item->id,
        'system_quantity' => '50.000',
        'physical_quantity' => '47.000',
        'difference' => '-3.000',
    ]);

    expect($adjustment->items)->toHaveCount(1)
        ->and($adjustmentItem->difference)->toBe('-3.000');
});

test('stock balance tracks quantity correctly with warehouse and item', function () {
    $warehouse = Warehouse::factory()->create();
    $item = Item::factory()->create();

    $balance = StockBalance::factory()->create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => '125.750',
    ]);

    expect($balance->quantity)->toBe('125.750')
        ->and($balance->warehouse->id)->toBe($warehouse->id)
        ->and($balance->item->id)->toBe($item->id);
});

test('stock movement ledger tracks polymorphic reference and signed movements', function () {
    $warehouse = Warehouse::factory()->create();
    $item = Item::factory()->create();
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create();

    $movement = StockMovement::factory()->create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'movement_type' => StockMovementType::PurchaseIn,
        'quantity' => '100.000',
        'balance_after' => '100.000',
        'reference_type' => PurchaseInvoice::class,
        'reference_id' => $invoice->id,
        'created_by' => $user->id,
    ]);

    expect($movement->movement_type)->toBe(StockMovementType::PurchaseIn)
        ->and($movement->movement_type->isIngress())->toBeTrue()
        ->and($movement->movement_type->isEgress())->toBeFalse()
        ->and($movement->reference)->toBeInstanceOf(PurchaseInvoice::class)
        ->and($movement->reference->id)->toBe($invoice->id);
});

test('audit logs track action enum, morph relation, and json payloads', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create();

    $log = AuditLog::factory()->create([
        'user_id' => $user->id,
        'action' => AuditAction::Approve,
        'auditable_type' => PurchaseInvoice::class,
        'auditable_id' => $invoice->id,
        'old_values' => ['status' => 'DRAFT'],
        'new_values' => ['status' => 'CLOSED'],
    ]);

    expect($log->action)->toBe(AuditAction::Approve)
        ->and($log->action->value)->toBe('APPROVE')
        ->and($log->auditable)->toBeInstanceOf(PurchaseInvoice::class)
        ->and($log->old_values)->toBe(['status' => 'DRAFT'])
        ->and($log->new_values)->toBe(['status' => 'CLOSED']);
});
