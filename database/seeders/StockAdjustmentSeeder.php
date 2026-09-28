<?php

namespace Database\Seeders;

use App\Enums\DocumentStatus;
use App\Models\Item;
use App\Models\StockAdjustment;
use App\Models\User;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class StockAdjustmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Warehouse::count() === 0) {
            $this->call(WarehouseSeeder::class);
        }

        if (Item::count() === 0) {
            $this->call(ItemSeeder::class);
        }

        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }

        $auditor = User::where('email', 'n.dosari@eagles.sa')->first() ?? User::first();
        $manager = User::where('email', 's.subaie@eagles.sa')->first() ?? User::first();

        $mainWarehouse = Warehouse::where('name', 'like', '%المركزي%')->first() ?? Warehouse::first();
        $spareWarehouse = Warehouse::where('name', 'like', '%قطع الغيار%')->first() ?? Warehouse::first();

        $adjustmentsData = [
            [
                'warehouse_id' => $mainWarehouse->id,
                'adjustment_date' => Carbon::now()->subDays(6)->toDateString(),
                'reason' => 'تسوية فروقات الجرد الربع سنوي الفعلي لمستودع المواد التموينية',
                'description' => 'تم إجراء الجرد الفعلي الشامل بحضور لجنة الجرد والمطابقة، ونتج عنه فروقات طفيفة بين الرصيد الدفتري والفعلي',
                'status' => DocumentStatus::Posted,
                'created_by' => $auditor->id,
                'approved_by' => $manager->id,
                'approved_at' => Carbon::now()->subDays(6)->setTime(15, 00),
                'items' => [
                    [
                        'item_name' => 'أرز بسمتي هندي كلاسيك عنبر 40 كجم',
                        'system_quantity' => 35.000,
                        'physical_quantity' => 37.000,
                        'difference' => 2.000,
                        'notes' => 'زيادة فعلية ناتجة عن استرجاع شحنة غير مقيدة بالسجلات السابقة',
                    ],
                    [
                        'item_name' => 'زيت نباتي نقي للقلي والطهي 1.5 لتر',
                        'system_quantity' => 30.000,
                        'physical_quantity' => 29.000,
                        'difference' => -1.000,
                        'notes' => 'عجز وحدة واحدة ناتج عن خطأ في تسجيل عملية صرف سابقة',
                    ],
                ],
            ],
            [
                'warehouse_id' => $spareWarehouse->id,
                'adjustment_date' => Carbon::now()->toDateString(),
                'reason' => 'جرد دوري شهري لقواطع وكابلات الإنارة الكهربائية',
                'description' => 'مسودة تسوية جرد مطابقة الأصناف الكهربائية بانتظار التوقيع النهائي للمدير المالي',
                'status' => DocumentStatus::Draft,
                'created_by' => $auditor->id,
                'approved_by' => null,
                'approved_at' => null,
                'items' => [
                    [
                        'item_name' => 'سلك نحاس معزول 4 ملم لفة 100 متر أزرق',
                        'system_quantity' => 20.000,
                        'physical_quantity' => 19.500,
                        'difference' => -0.500,
                        'notes' => 'هالك قص أطراف البكرات أثناء أعمال التمديدات الكهربائية',
                    ],
                ],
            ],
        ];

        foreach ($adjustmentsData as $data) {
            $items = $data['items'];
            unset($data['items']);

            $adjustment = StockAdjustment::updateOrCreate(
                [
                    'warehouse_id' => $data['warehouse_id'],
                    'adjustment_date' => $data['adjustment_date'],
                    'reason' => $data['reason'],
                ],
                $data
            );

            $adjustment->items()->delete();
            foreach ($items as $itemData) {
                $item = Item::where('name', $itemData['item_name'])->first();
                if (! $item) {
                    continue;
                }

                $adjustment->items()->create([
                    'item_id' => $item->id,
                    'system_quantity' => $itemData['system_quantity'],
                    'physical_quantity' => $itemData['physical_quantity'],
                    'difference' => $itemData['difference'],
                    'notes' => $itemData['notes'],
                ]);
            }
        }
    }
}
