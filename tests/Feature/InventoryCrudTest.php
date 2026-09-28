<?php

use App\Enums\StockMovementType;
use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\PurchaseInvoice;
use App\Models\Sector;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

/*
|--------------------------------------------------------------------------
| Warehouses CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list warehouses', function () {
    Warehouse::factory()->count(3)->create();

    $response = $this->get(route('warehouses.index'));

    $response->assertOk();
});

test('can create a warehouse', function () {
    $response = $this->post(route('warehouses.store'), [
        'name' => 'المستودع الرئيسي بالمنطقة الصناعية',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('warehouses.index'));
    $this->assertDatabaseHas('warehouses', [
        'name' => 'المستودع الرئيسي بالمنطقة الصناعية',
        'is_active' => true,
    ]);
});

test('can update a warehouse', function () {
    $warehouse = Warehouse::factory()->create(['name' => 'مستودع قديم']);

    $response = $this->put(route('warehouses.update', $warehouse), [
        'name' => 'مستودع محدث',
        'is_active' => false,
    ]);

    $response->assertRedirect(route('warehouses.index'));
    $warehouse->refresh();
    expect($warehouse->name)->toBe('مستودع محدث');
    expect($warehouse->is_active)->toBeFalse();
});

test('can delete a warehouse without relations', function () {
    $warehouse = Warehouse::factory()->create();

    $response = $this->delete(route('warehouses.destroy', $warehouse));

    $response->assertRedirect(route('warehouses.index'));
    $this->assertModelMissing($warehouse);
});

test('can view warehouse details and its items quantities', function () {
    $warehouse = Warehouse::factory()->create(['name' => 'مستودع الخامات المركزي']);
    $category = ItemCategory::factory()->create(['name' => 'قطع غيار']);
    $unit = Unit::factory()->create(['name' => 'حبة', 'symbol' => 'حبة']);

    $item1 = Item::factory()->create([
        'name' => 'فلتر هواء',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'minimum_stock' => 10,
    ]);

    $item2 = Item::factory()->create([
        'name' => 'زيت محرك',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'minimum_stock' => 5,
    ]);

    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item1->id,
        'quantity' => 25,
    ]);

    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item2->id,
        'quantity' => 3,
    ]);

    StockMovement::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item1->id,
        'movement_type' => StockMovementType::PurchaseIn,
        'quantity' => 25,
        'balance_after' => 25,
        'reference_type' => Warehouse::class,
        'reference_id' => $warehouse->id,
        'movement_date' => now(),
        'created_by' => $this->user->id,
    ]);

    $response = $this->get(route('warehouses.show', $warehouse));

    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('warehouses/show')
        ->has('warehouse')
        ->has('stockBalances')
        ->has('stats')
        ->has('categoryOptions')
        ->has('recentMovements')
        ->where('recentMovements.0.creator.name', $this->user->name)
        ->where('warehouse.name', 'مستودع الخامات المركزي')
        ->where('stats.total_items', 2)
        ->where('stats.total_quantity', 28)
        ->where('stats.low_stock', 1)
        ->where('stats.in_stock', 2)
    );
});

test('can filter warehouse items by search and category and status', function () {
    $warehouse = Warehouse::factory()->create();
    $catA = ItemCategory::factory()->create(['name' => 'إلكترونيات']);
    $catB = ItemCategory::factory()->create(['name' => 'ميكانيكا']);
    $unit = Unit::factory()->create();

    $itemA = Item::factory()->create(['name' => 'شاشة لمس', 'category_id' => $catA->id, 'unit_id' => $unit->id, 'minimum_stock' => 5]);
    $itemB = Item::factory()->create(['name' => 'موتور تروس', 'category_id' => $catB->id, 'unit_id' => $unit->id, 'minimum_stock' => 10]);

    StockBalance::create(['warehouse_id' => $warehouse->id, 'item_id' => $itemA->id, 'quantity' => 20]);
    StockBalance::create(['warehouse_id' => $warehouse->id, 'item_id' => $itemB->id, 'quantity' => 0]);

    // Search filter
    $responseSearch = $this->get(route('warehouses.show', ['warehouse' => $warehouse, 'search' => 'شاشة']));
    $responseSearch->assertOk();
    $responseSearch->assertInertia(fn (AssertableInertia $page) => $page
        ->component('warehouses/show')
        ->where('stockBalances.total', 1)
        ->where('stockBalances.data.0.item.name', 'شاشة لمس')
    );

    // Status filter out_of_stock
    $responseStatus = $this->get(route('warehouses.show', ['warehouse' => $warehouse, 'stock_status' => 'out_of_stock']));
    $responseStatus->assertOk();
    $responseStatus->assertInertia(fn (AssertableInertia $page) => $page
        ->component('warehouses/show')
        ->where('stockBalances.total', 1)
        ->where('stockBalances.data.0.item.name', 'موتور تروس')
    );
});

/*
|--------------------------------------------------------------------------
| Sectors CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list sectors', function () {
    Sector::factory()->count(2)->create();

    $response = $this->get(route('sectors.index'));

    $response->assertOk();
});

test('can create a sector with parent', function () {
    $parent = Sector::factory()->create(['name' => 'إدارة الهندسة']);

    $response = $this->post(route('sectors.store'), [
        'name' => 'قسم التوربينات',
        'parent_id' => $parent->id,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('sectors.index'));
    $this->assertDatabaseHas('sectors', [
        'name' => 'قسم التوربينات',
        'parent_id' => $parent->id,
    ]);
});

test('can update a sector', function () {
    $sector = Sector::factory()->create(['name' => 'قسم أولي']);

    $response = $this->put(route('sectors.update', $sector), [
        'name' => 'قسم معدل',
        'parent_id' => null,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('sectors.index'));
    $sector->refresh();
    expect($sector->name)->toBe('قسم معدل');
});

test('can delete a sector', function () {
    $sector = Sector::factory()->create();

    $response = $this->delete(route('sectors.destroy', $sector));

    $response->assertRedirect(route('sectors.index'));
    $this->assertModelMissing($sector);
});

/*
|--------------------------------------------------------------------------
| Employees CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list employees', function () {
    Employee::factory()->count(2)->create();

    $response = $this->get(route('employees.index'));

    $response->assertOk();
});

test('can create an employee', function () {
    $response = $this->post(route('employees.store'), [
        'name' => 'عمر عبد العزيز',
        'department' => 'العمليات اللوجستية',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('employees.index'));
    $this->assertDatabaseHas('employees', [
        'name' => 'عمر عبد العزيز',
        'department' => 'العمليات اللوجستية',
    ]);
});

test('can update an employee', function () {
    $employee = Employee::factory()->create(['name' => 'موظف تجريبي']);

    $response = $this->put(route('employees.update', $employee), [
        'name' => 'موظف معتمد',
        'department' => 'الصيانة العامة',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('employees.index'));
    $employee->refresh();
    expect($employee->name)->toBe('موظف معتمد');
    expect($employee->department)->toBe('الصيانة العامة');
});

test('can delete an employee', function () {
    $employee = Employee::factory()->create();

    $response = $this->delete(route('employees.destroy', $employee));

    $response->assertRedirect(route('employees.index'));
    $this->assertModelMissing($employee);
});

/*
|--------------------------------------------------------------------------
| Item Categories CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list item categories', function () {
    ItemCategory::factory()->count(2)->create();

    $response = $this->get(route('item-categories.index'));

    $response->assertOk();
});

test('can create an item category', function () {
    $response = $this->post(route('item-categories.store'), [
        'name' => 'مهمات السلامة المهنية',
        'parent_id' => null,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('item-categories.index'));
    $this->assertDatabaseHas('item_categories', [
        'name' => 'مهمات السلامة المهنية',
    ]);
});

test('can update an item category', function () {
    $category = ItemCategory::factory()->create(['name' => 'تصنيف قديم']);

    $response = $this->put(route('item-categories.update', $category), [
        'name' => 'تصنيف محدث',
        'parent_id' => null,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('item-categories.index'));
    $category->refresh();
    expect($category->name)->toBe('تصنيف محدث');
});

test('can delete an item category', function () {
    $category = ItemCategory::factory()->create();

    $response = $this->delete(route('item-categories.destroy', $category));

    $response->assertRedirect(route('item-categories.index'));
    $this->assertModelMissing($category);
});

/*
|--------------------------------------------------------------------------
| Units CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list units', function () {
    Unit::factory()->count(2)->create();

    $response = $this->get(route('units.index'));

    $response->assertOk();
});

test('can create a unit', function () {
    $response = $this->post(route('units.store'), [
        'name' => 'طن متري',
        'symbol' => 'طن',
    ]);

    $response->assertRedirect(route('units.index'));
    $this->assertDatabaseHas('units', [
        'name' => 'طن متري',
        'symbol' => 'طن',
    ]);
});

test('can update a unit', function () {
    $unit = Unit::factory()->create(['name' => 'متر مكعب', 'symbol' => 'م3']);

    $response = $this->put(route('units.update', $unit), [
        'name' => 'متر مكعب قياسي',
        'symbol' => 'م³',
    ]);

    $response->assertRedirect(route('units.index'));
    $unit->refresh();
    expect($unit->name)->toBe('متر مكعب قياسي');
    expect($unit->symbol)->toBe('م³');
});

test('can delete a unit', function () {
    $unit = Unit::factory()->create();

    $response = $this->delete(route('units.destroy', $unit));

    $response->assertRedirect(route('units.index'));
    $this->assertModelMissing($unit);
});

/*
|--------------------------------------------------------------------------
| Items CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list items', function () {
    Item::factory()->count(2)->create();

    $response = $this->get(route('items.index'));

    $response->assertOk();
});

test('can create an item', function () {
    $category = ItemCategory::factory()->create();
    $unit = Unit::factory()->create();

    $response = $this->post(route('items.store'), [
        'name' => 'حزام ناقل مقوى 10 متر',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'minimum_stock' => 5,
        'description' => 'مواصفات قياسية',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('items.index'));
    $this->assertDatabaseHas('items', [
        'name' => 'حزام ناقل مقوى 10 متر',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
    ]);
});

test('can update an item', function () {
    $item = Item::factory()->create(['name' => 'صنف أولي']);
    $newCategory = ItemCategory::factory()->create();

    $response = $this->put(route('items.update', $item), [
        'name' => 'صنف معدل بالكامل',
        'category_id' => $newCategory->id,
        'unit_id' => $item->unit_id,
        'minimum_stock' => 12,
        'description' => 'وصف معدل',
        'is_active' => false,
    ]);

    $response->assertRedirect(route('items.index'));
    $item->refresh();
    expect($item->name)->toBe('صنف معدل بالكامل');
    expect($item->category_id)->toBe($newCategory->id);
    expect($item->is_active)->toBeFalse();
});

test('can delete an item without movements', function () {
    $item = Item::factory()->create();

    $response = $this->delete(route('items.destroy', $item));

    $response->assertRedirect(route('items.index'));
    $this->assertModelMissing($item);
});

test('can view an item with warehouse balances and stock movements', function () {
    $item = Item::factory()->create(['name' => 'صمام ضغط عالي']);
    $warehouse = Warehouse::factory()->create(['name' => 'مستودع القطع']);
    StockBalance::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'quantity' => 25,
    ]);

    $invoice = PurchaseInvoice::factory()->create([
        'warehouse_id' => $warehouse->id,
    ]);

    StockMovement::create([
        'warehouse_id' => $warehouse->id,
        'item_id' => $item->id,
        'movement_type' => StockMovementType::PurchaseIn,
        'quantity' => 25,
        'balance_after' => 25,
        'reference_type' => PurchaseInvoice::class,
        'reference_id' => $invoice->id,
        'movement_date' => now(),
        'created_by' => $this->user->id,
    ]);

    $response = $this->get(route('items.show', $item));

    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('items/show')
        ->has('item')
        ->has('warehousesStock')
        ->has('summary')
        ->has('movements')
        ->where('item.name', 'صمام ضغط عالي')
        ->where('summary.total_stock', 25)
    );
});

/*
|--------------------------------------------------------------------------
| Suppliers CRUD Tests
|--------------------------------------------------------------------------
*/
test('can list suppliers', function () {
    Supplier::factory()->count(2)->create();

    $response = $this->get(route('suppliers.index'));

    $response->assertOk();
});

test('can create a supplier', function () {
    $response = $this->post(route('suppliers.store'), [
        'name' => 'شركة توريدات الموانئ والمعدات',
        'phone' => '0512345678',
        'notes' => 'مورد معتمد للفئة أ',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('suppliers.index'));
    $this->assertDatabaseHas('suppliers', [
        'name' => 'شركة توريدات الموانئ والمعدات',
        'phone' => '0512345678',
    ]);
});

test('can update a supplier', function () {
    $supplier = Supplier::factory()->create(['name' => 'مورد سابق']);

    $response = $this->put(route('suppliers.update', $supplier), [
        'name' => 'مورد حديث',
        'phone' => '0599999999',
        'notes' => 'شروط دفع 30 يوم',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('suppliers.index'));
    $supplier->refresh();
    expect($supplier->name)->toBe('مورد حديث');
    expect($supplier->phone)->toBe('0599999999');
});

test('can delete a supplier', function () {
    $supplier = Supplier::factory()->create();

    $response = $this->delete(route('suppliers.destroy', $supplier));

    $response->assertRedirect(route('suppliers.index'));
    $this->assertModelMissing($supplier);
});
