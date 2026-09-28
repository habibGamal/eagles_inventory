<?php

use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Models\DispatchVoucher;
use App\Models\DispatchVoucherItem;
use App\Models\Employee;
use App\Models\Item;
use App\Models\Sector;
use App\Models\StockBalance;
use App\Models\User;
use App\Models\Warehouse;

test('guests are redirected from dispatch vouchers page to login', function () {
    $response = $this->get(route('dispatch-vouchers.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can view dispatch vouchers list and stats', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();

    DispatchVoucher::factory()->count(3)->create([
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'created_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dispatch-vouchers.index'));

    $response->assertOk();
});

test('authenticated user can filter dispatch vouchers by search, status, and warehouse', function () {
    $user = User::factory()->create();
    $warehouseA = Warehouse::factory()->create(['name' => 'المستودع الرئيسي']);
    $warehouseB = Warehouse::factory()->create(['name' => 'مستودع الصيانة']);
    $sector = Sector::factory()->create(['name' => 'قطاع العمليات']);

    $voucherA = DispatchVoucher::factory()->create([
        'warehouse_id' => $warehouseA->id,
        'sector_id' => $sector->id,
        'recipient_name_snapshot' => 'خالد المهندس',
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
    ]);

    $voucherB = DispatchVoucher::factory()->create([
        'warehouse_id' => $warehouseB->id,
        'sector_id' => $sector->id,
        'recipient_name_snapshot' => 'أحمد الفني',
        'created_by' => $user->id,
        'status' => DocumentStatus::Posted,
    ]);

    // Filter by search recipient
    $responseSearch = $this->actingAs($user)->get(route('dispatch-vouchers.index', [
        'search' => 'خالد',
    ]));
    $responseSearch->assertOk();

    // Filter by status
    $responseStatus = $this->actingAs($user)->get(route('dispatch-vouchers.index', [
        'status' => 'POSTED',
    ]));
    $responseStatus->assertOk();

    // Filter by warehouse
    $responseWarehouse = $this->actingAs($user)->get(route('dispatch-vouchers.index', [
        'warehouse_id' => $warehouseA->id,
    ]));
    $responseWarehouse->assertOk();
});

test('authenticated user can view dispatch vouchers create page', function () {
    $user = User::factory()->create();
    Warehouse::factory()->count(2)->create();
    Sector::factory()->count(2)->create();
    Employee::factory()->count(2)->create();
    Item::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('dispatch-vouchers.create'));

    $response->assertOk();
});

test('authenticated user can create a dispatch voucher in draft status with multiple items', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $employee = Employee::factory()->create(['name' => 'أحمد المحمود']);
    $item1 = Item::factory()->create();
    $item2 = Item::factory()->create();

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.store'), [
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'recipient_employee_id' => $employee->id,
        'recipient_name_snapshot' => 'أحمد المحمود',
        'issued_by' => $user->id,
        'issue_date' => now()->toDateString(),
        'notes' => 'صرف أدوات ومعدات صيانة',
        'items' => [
            [
                'item_id' => $item1->id,
                'quantity' => 5,
            ],
            [
                'item_id' => $item2->id,
                'quantity' => 12,
            ],
        ],
    ]);

    $response->assertRedirect(route('dispatch-vouchers.index'));

    $this->assertDatabaseHas('dispatch_vouchers', [
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'recipient_employee_id' => $employee->id,
        'recipient_name_snapshot' => 'أحمد المحمود',
        'status' => DocumentStatus::Draft->value,
        'created_by' => $user->id,
    ]);

    $voucher = DispatchVoucher::where('warehouse_id', $warehouse->id)->latest('id')->first();
    expect($voucher->items)->toHaveCount(2);

    // Stock balances should not change for drafts
    $this->assertDatabaseMissing('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item1->id,
    ]);
});

test('recipient_name_snapshot is automatically populated from employee when empty', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $employee = Employee::factory()->create(['name' => 'سعيد الغامدي']);
    $item = Item::factory()->create();

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.store'), [
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'recipient_employee_id' => $employee->id,
        'recipient_name_snapshot' => '',
        'issued_by' => $user->id,
        'issue_date' => now()->toDateString(),
        'items' => [
            [
                'item_id' => $item->id,
                'quantity' => 2,
            ],
        ],
    ]);

    $response->assertRedirect(route('dispatch-vouchers.index'));

    $this->assertDatabaseHas('dispatch_vouchers', [
        'warehouse_id' => $warehouse->id,
        'recipient_name_snapshot' => 'سعيد الغامدي',
    ]);
});

test('creating dispatch voucher requires warehouse, sector, recipient name, and items', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.store'), [
        'warehouse_id' => 99999,
        'sector_id' => 99999,
        'recipient_employee_id' => null,
        'recipient_name_snapshot' => '',
        'issued_by' => 99999,
        'issue_date' => 'invalid-date',
        'items' => [],
    ]);

    $response->assertSessionHasErrors(['warehouse_id', 'sector_id', 'recipient_name_snapshot', 'issued_by', 'issue_date', 'items']);
});

test('authenticated user can create and immediately post a dispatch voucher if stock is sufficient', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $item = Item::factory()->create();

    // Create sufficient stock balance
    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 50,
    ]);

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.store'), [
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'recipient_name_snapshot' => 'مستلم فوري',
        'issued_by' => $user->id,
        'issue_date' => now()->toDateString(),
        'post_immediately' => true,
        'items' => [
            [
                'item_id' => $item->id,
                'quantity' => 15,
            ],
        ],
    ]);

    $response->assertRedirect(route('dispatch-vouchers.index'));

    $voucher = DispatchVoucher::where('warehouse_id', $warehouse->id)->latest('id')->first();
    expect($voucher->status)->toBe(DocumentStatus::Posted)
        ->and($voucher->approved_by)->toBe($user->id)
        ->and($voucher->approved_at)->not->toBeNull();

    // Decremented from 50 to 35
    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 35.000,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'movement_type' => StockMovementType::DispatchOut->value,
        'quantity' => 15.000,
        'balance_after' => 35.000,
        'reference_type' => DispatchVoucher::class,
        'reference_id' => $voucher->id,
    ]);
});

test('creating and posting immediately is rejected if stock is insufficient', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $item = Item::factory()->create();

    // Insufficient stock balance
    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 5,
    ]);

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.store'), [
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'recipient_name_snapshot' => 'مستلم كمية زائدة',
        'issued_by' => $user->id,
        'issue_date' => now()->toDateString(),
        'post_immediately' => true,
        'items' => [
            [
                'item_id' => $item->id,
                'quantity' => 10,
            ],
        ],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');

    // Balance untouched
    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 5.000,
    ]);

    // No posted voucher
    $this->assertDatabaseMissing('dispatch_vouchers', [
        'recipient_name_snapshot' => 'مستلم كمية زائدة',
    ]);
});

test('authenticated user can view dispatch vouchers edit page for draft voucher', function () {
    $user = User::factory()->create();
    $voucher = DispatchVoucher::factory()->create([
        'status' => DocumentStatus::Draft,
        'created_by' => $user->id,
    ]);

    DispatchVoucherItem::factory()->create([
        'dispatch_voucher_id' => $voucher->id,
    ]);

    $response = $this->actingAs($user)->get(route('dispatch-vouchers.edit', $voucher));

    $response->assertOk();
});

test('authenticated user cannot view edit page for non-draft voucher and is redirected', function () {
    $user = User::factory()->create();
    $voucher = DispatchVoucher::factory()->create([
        'status' => DocumentStatus::Posted,
        'created_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dispatch-vouchers.edit', $voucher));

    $response->assertRedirect(route('dispatch-vouchers.index'));
    $response->assertSessionHas('error');
});

test('authenticated user can update a draft dispatch voucher and sync items', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector1 = Sector::factory()->create();
    $sector2 = Sector::factory()->create();
    $item1 = Item::factory()->create();
    $item2 = Item::factory()->create();

    $voucher = DispatchVoucher::factory()->create([
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector1->id,
        'recipient_name_snapshot' => 'مستلم قديم',
        'issued_by' => $user->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
    ]);

    DispatchVoucherItem::factory()->create([
        'dispatch_voucher_id' => $voucher->id,
        'item_id' => $item1->id,
        'quantity' => 10,
    ]);

    $response = $this->actingAs($user)->put(route('dispatch-vouchers.update', $voucher), [
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector2->id,
        'recipient_employee_id' => null,
        'recipient_name_snapshot' => 'مستلم جديد ومعدل',
        'issued_by' => $user->id,
        'issue_date' => now()->toDateString(),
        'notes' => 'تم تعديل إذن الصرف',
        'items' => [
            [
                'item_id' => $item2->id,
                'quantity' => 8,
            ],
        ],
    ]);

    $response->assertRedirect(route('dispatch-vouchers.index'));

    $voucher->refresh();
    expect($voucher->sector_id)->toBe($sector2->id)
        ->and($voucher->recipient_name_snapshot)->toBe('مستلم جديد ومعدل')
        ->and($voucher->notes)->toBe('تم تعديل إذن الصرف')
        ->and($voucher->items)->toHaveCount(1)
        ->and($voucher->items->first()->item_id)->toBe($item2->id)
        ->and((float) $voucher->items->first()->quantity)->toBe(8.0);
});

test('authenticated user cannot update an already posted dispatch voucher', function () {
    $user = User::factory()->create();
    $voucher = DispatchVoucher::factory()->create([
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->put(route('dispatch-vouchers.update', $voucher), [
        'warehouse_id' => $voucher->warehouse_id,
        'sector_id' => $voucher->sector_id,
        'recipient_name_snapshot' => 'محاولة تعديل',
        'issued_by' => $voucher->issued_by,
        'issue_date' => now()->toDateString(),
        'items' => [
            [
                'item_id' => Item::factory()->create()->id,
                'quantity' => 1,
            ],
        ],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('authenticated user can post a draft dispatch voucher when stock is sufficient', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $item = Item::factory()->create();

    $voucher = DispatchVoucher::factory()->create([
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
    ]);

    DispatchVoucherItem::factory()->create([
        'dispatch_voucher_id' => $voucher->id,
        'item_id' => $item->id,
        'quantity' => 12,
    ]);

    // Initial stock
    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 30,
    ]);

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.post', $voucher));

    $response->assertRedirect(route('dispatch-vouchers.index'));

    $voucher->refresh();
    expect($voucher->status)->toBe(DocumentStatus::Posted)
        ->and($voucher->approved_by)->toBe($user->id)
        ->and($voucher->approved_at)->not->toBeNull();

    // Check decremented balance: 30 - 12 = 18
    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 18.000,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'movement_type' => StockMovementType::DispatchOut->value,
        'quantity' => 12.000,
        'balance_after' => 18.000,
        'reference_type' => DispatchVoucher::class,
        'reference_id' => $voucher->id,
    ]);
});

test('posting draft dispatch voucher fails when warehouse stock is insufficient', function () {
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $sector = Sector::factory()->create();
    $item = Item::factory()->create();

    $voucher = DispatchVoucher::factory()->create([
        'warehouse_id' => $warehouse->id,
        'sector_id' => $sector->id,
        'created_by' => $user->id,
        'status' => DocumentStatus::Draft,
    ]);

    DispatchVoucherItem::factory()->create([
        'dispatch_voucher_id' => $voucher->id,
        'item_id' => $item->id,
        'quantity' => 25,
    ]);

    // Balance only has 10
    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 10,
    ]);

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.post', $voucher));

    $response->assertRedirect();
    $response->assertSessionHas('error');

    $voucher->refresh();
    expect($voucher->status)->toBe(DocumentStatus::Draft);

    // Balance still 10
    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 10.000,
    ]);

    // No movement created
    $this->assertDatabaseMissing('stock_movements', [
        'reference_type' => DispatchVoucher::class,
        'reference_id' => $voucher->id,
    ]);
});

test('authenticated user cannot post an already posted dispatch voucher', function () {
    $user = User::factory()->create();
    $voucher = DispatchVoucher::factory()->create([
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->post(route('dispatch-vouchers.post', $voucher));

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('authenticated user can delete a draft dispatch voucher', function () {
    $user = User::factory()->create();
    $voucher = DispatchVoucher::factory()->create([
        'status' => DocumentStatus::Draft,
    ]);

    DispatchVoucherItem::factory()->create([
        'dispatch_voucher_id' => $voucher->id,
    ]);

    $response = $this->actingAs($user)->delete(route('dispatch-vouchers.destroy', $voucher));

    $response->assertRedirect(route('dispatch-vouchers.index'));
    $this->assertModelMissing($voucher);
});

test('authenticated user cannot delete a posted dispatch voucher', function () {
    $user = User::factory()->create();
    $voucher = DispatchVoucher::factory()->create([
        'status' => DocumentStatus::Posted,
    ]);

    $response = $this->actingAs($user)->delete(route('dispatch-vouchers.destroy', $voucher));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertModelExists($voucher);
});
