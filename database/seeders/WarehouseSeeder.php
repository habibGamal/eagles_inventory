<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = [
            [
                'name' => 'المستودع المركزي الرئيسي - الرياض',
                'is_active' => true,
            ],
            [
                'name' => 'مستودع المنطقة الغربية - جدة',
                'is_active' => true,
            ],
            [
                'name' => 'مستودع المنطقة الشرقية - الدمام',
                'is_active' => true,
            ],
            [
                'name' => 'مستودع التبريد والتجميد الغذائي - الرياض',
                'is_active' => true,
            ],
            [
                'name' => 'مستودع الصيانة وقطع الغيار - الرياض',
                'is_active' => true,
            ],
            [
                'name' => 'مستودع المواد الإنشائية القديم (معطل)',
                'is_active' => false,
            ],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::updateOrCreate(
                ['name' => $warehouse['name']],
                $warehouse
            );
        }
    }
}
