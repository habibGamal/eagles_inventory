<?php

use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Models\Item;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\StockBalance;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;

test('guests are redirected from purchase invoices page to login', function () {
    $response = $this->get(route('purchase-invoices.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can view purchase invoices list and stats', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $warehouse = Warehouse::factory()->create();

    PurchaseInvoice::factory()->count(3)->create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('purchase-invoices.index'));

    $response->assertOk();
});

test('authenticated user can filter purchase invoices by search or status', function () {
    $user = User::factory()->create();
    $supplierA = Supplier::factory()->create(['name' => 'شركة النسر للتجارة']);
    $supplierB = Supplier::factory()->create(['name' => 'مؤسسة الهلال']);
    $warehouse = Warehouse::factory()->create();

    $invoiceA = PurchaseInvoice::factory()->create([
        'supplier_id' => $supplierA->id,
        'warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
    ]);

    $invoiceB = PurchaseInvoice::factory()->create([
        'supplier_id' => $supplierB->id,
        'warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->get(route('purchase-invoices.index', [
        'search' => 'النسر',
    ]));

    $response->assertOk();

    $responseStatus = $this->actingAs($user)->get(route('purchase-invoices.index', [
        'status' => 'POSTED',
    ]));

    $responseStatus->assertOk();
});

test('authenticated user can create a purchase invoice in draft status with multiple items', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $item1 = Item::factory()->create();
    $item2 = Item::factory()->create();

    $response = $this->actingAs($user)->post(route('purchase-invoices.store'), [
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'invoice_date' => now()->toDateString(),
        'received_at' => now()->toDateTimeString(),
        'discount' => 50,
        'notes' => 'توريد شحنة بضاعة رقم 104',
        'items' => [
            [
                'item_id' => $item1->id,
                'quantity' => 10,
                'unit_price' => 25.50,
            ],
            [
                'item_id' => $item2->id,
                'quantity' => 5,
                'unit_price' => 100,
            ],
        ],
    ]);

    $response->assertRedirect(route('purchase-invoices.index'));

    $this->assertDatabaseHas('purchase_invoices', [
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'status' => DocumentStatus::Draft->value,
        'subtotal' => 755.00, // 10*25.5 + 5*100 = 255 + 500 = 755
        'discount' => 50.00,
        'total' => 705.00, // 755 - 50 = 705
        'created_by' => $user->id,
    ]);

    $invoice = PurchaseInvoice::where('supplier_id', $supplier->id)->latest('id')->first();
    expect($invoice->items)->toHaveCount(2);

    // Stock balances should not change for drafts
    $this->assertDatabaseMissing('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item1->id,
    ]);
});

test('creating purchase invoice requires valid supplier, warehouse, date, and items', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('purchase-invoices.store'), [
        'supplier_id' => 99999,
        'warehouse_id' => 99999,
        'invoice_date' => 'invalid-date',
        'items' => [],
    ]);

    $response->assertSessionHasErrors(['supplier_id', 'warehouse_id', 'invoice_date', 'items']);
});

test('authenticated user can create and immediately post a purchase invoice updating stock balances', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $item = Item::factory()->create();

    $response = $this->actingAs($user)->post(route('purchase-invoices.store'), [
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'invoice_date' => now()->toDateString(),
        'post_immediately' => true,
        'discount' => 0,
        'items' => [
            [
                'item_id' => $item->id,
                'quantity' => 20,
                'unit_price' => 50,
            ],
        ],
    ]);

    $response->assertRedirect(route('purchase-invoices.index'));

    $invoice = PurchaseInvoice::where('supplier_id', $supplier->id)->latest('id')->first();
    expect($invoice->status)->toBe(DocumentStatus::Posted)
        ->and($invoice->approved_by)->toBe($user->id)
        ->and($invoice->approved_at)->not->toBeNull();

    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 20.000,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'movement_type' => StockMovementType::PurchaseIn->value,
        'quantity' => 20.000,
        'balance_after' => 20.000,
        'reference_type' => PurchaseInvoice::class,
        'reference_id' => $invoice->id,
    ]);
});

test('authenticated user can update a draft purchase invoice and sync items', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $item1 = Item::factory()->create();
    $item2 = Item::factory()->create();

    $invoice = PurchaseInvoice::factory()->create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
        'subtotal' => 100,
        'discount' => 0,
        'total' => 100,
    ]);

    PurchaseInvoiceItem::factory()->create([
        'purchase_invoice_id' => $invoice->id,
        'item_id' => $item1->id,
        'quantity' => 2,
        'unit_price' => 50,
        'total' => 100,
    ]);

    $response = $this->actingAs($user)->put(route('purchase-invoices.update', $invoice), [
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'invoice_date' => now()->toDateString(),
        'discount' => 10,
        'notes' => 'تعديل بنود الفاتورة',
        'items' => [
            [
                'item_id' => $item2->id,
                'quantity' => 4,
                'unit_price' => 75,
            ],
        ],
    ]);

    $response->assertRedirect(route('purchase-invoices.index'));

    $invoice->refresh();
    expect($invoice->subtotal)->toBe('300.00') // 4 * 75 = 300
        ->and($invoice->discount)->toBe('10.00')
        ->and($invoice->total)->toBe('290.00')
        ->and($invoice->notes)->toBe('تعديل بنود الفاتورة')
        ->and($invoice->items)->toHaveCount(1)
        ->and($invoice->items->first()->item_id)->toBe($item2->id);
});

test('authenticated user cannot update an already posted purchase invoice', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create([
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->put(route('purchase-invoices.update', $invoice), [
        'supplier_id' => $invoice->supplier_id,
        'warehouse_id' => $invoice->warehouse_id,
        'invoice_date' => now()->toDateString(),
        'items' => [
            [
                'item_id' => Item::factory()->create()->id,
                'quantity' => 1,
                'unit_price' => 10,
            ],
        ],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('authenticated user can post a draft invoice and create stock movements', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $item = Item::factory()->create();

    $invoice = PurchaseInvoice::factory()->create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
        'subtotal' => 500,
        'discount' => 0,
        'total' => 500,
    ]);

    PurchaseInvoiceItem::factory()->create([
        'purchase_invoice_id' => $invoice->id,
        'item_id' => $item->id,
        'quantity' => 15,
        'unit_price' => 33.33,
        'total' => 500,
    ]);

    // Initial stock balance exists
    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 10,
    ]);

    $response = $this->actingAs($user)->post(route('purchase-invoices.post', $invoice));

    $response->assertRedirect(route('purchase-invoices.index'));

    $invoice->refresh();
    expect($invoice->status)->toBe(DocumentStatus::Posted)
        ->and($invoice->approved_by)->toBe($user->id)
        ->and($invoice->approved_at)->not->toBeNull();

    // Check incremented balance: 10 + 15 = 25
    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 25.000,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'movement_type' => StockMovementType::PurchaseIn->value,
        'quantity' => 15.000,
        'balance_after' => 25.000,
        'reference_type' => PurchaseInvoice::class,
        'reference_id' => $invoice->id,
    ]);
});

test('authenticated user cannot post an already posted invoice', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create([
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->post(route('purchase-invoices.post', $invoice));

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('authenticated user can delete a draft purchase invoice', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create([
        'status' => DocumentStatus::Draft,
    ]);

    PurchaseInvoiceItem::factory()->create([
        'purchase_invoice_id' => $invoice->id,
    ]);

    $response = $this->actingAs($user)->delete(route('purchase-invoices.destroy', $invoice));

    $response->assertRedirect(route('purchase-invoices.index'));
    $this->assertModelMissing($invoice);
});

test('authenticated user cannot delete a posted purchase invoice', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create([
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->delete(route('purchase-invoices.destroy', $invoice));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertModelExists($invoice);
});

test('authenticated user can view purchase invoices create page', function () {
    $user = User::factory()->create();
    Supplier::factory()->count(2)->create();
    Warehouse::factory()->count(2)->create();
    Item::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('purchase-invoices.create'));

    $response->assertOk();
});

test('authenticated user can view purchase invoices edit page for draft invoice', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create([
        'status' => DocumentStatus::Draft,
        'created_by' => $user->id,
    ]);

    PurchaseInvoiceItem::factory()->create([
        'purchase_invoice_id' => $invoice->id,
    ]);

    $response = $this->actingAs($user)->get(route('purchase-invoices.edit', $invoice));

    $response->assertOk();
});

test('authenticated user cannot view edit page for non-draft invoice and is redirected', function () {
    $user = User::factory()->create();
    $invoice = PurchaseInvoice::factory()->create([
        'status' => DocumentStatus::Posted,
        'created_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('purchase-invoices.edit', $invoice));

    $response->assertRedirect(route('purchase-invoices.index'));
    $response->assertSessionHas('error');
});
