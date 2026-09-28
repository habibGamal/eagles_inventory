<?php

use App\Enums\StockMovementType;
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
use Database\Seeders\DatabaseSeeder;

test('database seeder seeds all 19 models with arabic data', function () {
    $this->seed(DatabaseSeeder::class);

    // 1. Users
    expect(User::count())->toBeGreaterThanOrEqual(8)
        ->and(User::where('email', 'admin@eagles.sa')->exists())->toBeTrue()
        ->and(User::where('name', 'like', '%مدير النظام%')->exists())->toBeTrue();

    // 2. Warehouses
    expect(Warehouse::count())->toBeGreaterThanOrEqual(6)
        ->and(Warehouse::where('name', 'like', '%المستودع المركزي%')->exists())->toBeTrue()
        ->and(Warehouse::where('is_active', false)->exists())->toBeTrue();

    // 3. Sectors (Hierarchy)
    expect(Sector::count())->toBeGreaterThanOrEqual(13)
        ->and(Sector::whereNull('parent_id')->count())->toBeGreaterThanOrEqual(4)
        ->and(Sector::whereNotNull('parent_id')->count())->toBeGreaterThanOrEqual(9)
        ->and(Sector::where('name', 'like', '%فندق إيجلز بالاس%')->exists())->toBeTrue();

    // 4. Employees
    expect(Employee::count())->toBeGreaterThanOrEqual(10)
        ->and(Employee::where('name', 'like', '%إبراهيم ناصر السعيد%')->exists())->toBeTrue()
        ->and(Employee::where('department', 'like', '%التكييف%')->exists())->toBeTrue();

    // 5. Item Categories (Hierarchy)
    expect(ItemCategory::count())->toBeGreaterThanOrEqual(15)
        ->and(ItemCategory::whereNull('parent_id')->count())->toBeGreaterThanOrEqual(4)
        ->and(ItemCategory::whereNotNull('parent_id')->count())->toBeGreaterThanOrEqual(10)
        ->and(ItemCategory::where('name', 'like', '%المواد الغذائية والتموينية%')->exists())->toBeTrue();

    // 6. Units
    expect(Unit::count())->toBeGreaterThanOrEqual(10)
        ->and(Unit::where('symbol', 'كرتون')->exists())->toBeTrue()
        ->and(Unit::where('symbol', 'كجم')->exists())->toBeTrue();

    // 7. Items
    expect(Item::count())->toBeGreaterThanOrEqual(18)
        ->and(Item::where('name', 'like', '%أرز بسمتي%')->exists())->toBeTrue()
        ->and(Item::where('name', 'like', '%قاطع تيار%')->exists())->toBeTrue()
        ->and(Item::where('is_active', false)->exists())->toBeTrue();

    // 8. Suppliers
    expect(Supplier::count())->toBeGreaterThanOrEqual(7)
        ->and(Supplier::where('name', 'like', '%التموين العربي%')->exists())->toBeTrue()
        ->and(Supplier::where('is_active', false)->exists())->toBeTrue();

    // 9. Purchase Invoices & Items
    expect(PurchaseInvoice::count())->toBeGreaterThanOrEqual(5)
        ->and(PurchaseInvoiceItem::count())->toBeGreaterThanOrEqual(12)
        ->and(PurchaseInvoice::where('notes', 'like', '%توريد%')->exists())->toBeTrue();

    // 10. Dispatch Vouchers & Items
    expect(DispatchVoucher::count())->toBeGreaterThanOrEqual(5)
        ->and(DispatchVoucherItem::count())->toBeGreaterThanOrEqual(8)
        ->and(DispatchVoucher::where('notes', 'like', '%صرف%')->exists())->toBeTrue();

    // 11. Waste Reports & Items
    expect(WasteReport::count())->toBeGreaterThanOrEqual(4)
        ->and(WasteReportItem::count())->toBeGreaterThanOrEqual(5)
        ->and(WasteReport::where('description', 'like', '%إتلاف%')->exists())->toBeTrue();

    // 12. Stock Adjustments & Items
    expect(StockAdjustment::count())->toBeGreaterThanOrEqual(2)
        ->and(StockAdjustmentItem::count())->toBeGreaterThanOrEqual(3)
        ->and(StockAdjustment::where('reason', 'like', '%تسوية%')->exists())->toBeTrue();

    // 13. Stock Movements (Ledger)
    expect(StockMovement::count())->toBeGreaterThanOrEqual(10)
        ->and(StockMovement::where('movement_type', StockMovementType::PurchaseIn)->exists())->toBeTrue()
        ->and(StockMovement::where('movement_type', StockMovementType::DispatchOut)->exists())->toBeTrue();

    // 14. Stock Balances
    expect(StockBalance::count())->toBeGreaterThanOrEqual(10)
        ->and(StockBalance::where('quantity', '>', 0)->count())->toBeGreaterThanOrEqual(10);

    // 15. Audit Logs
    expect(AuditLog::count())->toBeGreaterThanOrEqual(10)
        ->and(AuditLog::where('ip_address', 'like', '192.168.%')->exists())->toBeTrue();
});

test('seeder is idempotent and can be safely executed multiple times', function () {
    $this->seed(DatabaseSeeder::class);
    $initialUserCount = User::count();
    $initialItemCount = Item::count();
    $initialWarehouseCount = Warehouse::count();

    // Run again
    $this->seed(DatabaseSeeder::class);

    expect(User::count())->toBe($initialUserCount)
        ->and(Item::count())->toBe($initialItemCount)
        ->and(Warehouse::count())->toBe($initialWarehouseCount);
});
