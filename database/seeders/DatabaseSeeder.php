<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            WarehouseSeeder::class,
            SectorSeeder::class,
            EmployeeSeeder::class,
            ItemCategorySeeder::class,
            UnitSeeder::class,
            ItemSeeder::class,
            SupplierSeeder::class,
            PurchaseInvoiceSeeder::class,
            DispatchVoucherSeeder::class,
            WasteReportSeeder::class,
            StockAdjustmentSeeder::class,
            StockMovementSeeder::class,
            StockBalanceSeeder::class,
            AuditLogSeeder::class,
        ]);
    }
}
