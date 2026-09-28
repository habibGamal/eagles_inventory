<?php

namespace Database\Seeders;

use App\Enums\DocumentStatus;
use App\Enums\WasteReason;
use App\Models\Item;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WasteReport;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class WasteReportSeeder extends Seeder
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
        $riyadhKeeper = User::where('email', 'a.qahtani@eagles.sa')->first() ?? User::first();
        $jeddahKeeper = User::where('email', 'm.otaibi@eagles.sa')->first() ?? User::first();

        $mainWarehouse = Warehouse::where('name', 'like', '%المركزي%')->first() ?? Warehouse::first();
        $westWarehouse = Warehouse::where('name', 'like', '%الغربية%')->first() ?? Warehouse::first();
        $spareWarehouse = Warehouse::where('name', 'like', '%قطع الغيار%')->first() ?? Warehouse::first();

        $reportsData = [
            [
                'warehouse_id' => $mainWarehouse->id,
                'reason' => WasteReason::Expired,
                'description' => 'محضر إتلاف بضاعة غذائية منتهية الصلاحية بموجب تقرير فحص الجودة ومحضر لجنة الإتلاف المشتركة',
                'status' => DocumentStatus::Posted,
                'created_by' => $auditor->id,
                'approved_by' => $manager->id,
                'approved_at' => Carbon::now()->subDays(8)->setTime(14, 20),
                'items' => [
                    [
                        'item_name' => 'حليب طازج طويل الأجل كامل الدسم 1 لتر',
                        'quantity' => 2.000,
                        'notes' => 'عبوات تالفة تجاوزت فترة الصلاحية المحددة للاستهلاك الفندقي',
                    ],
                ],
            ],
            [
                'warehouse_id' => $spareWarehouse->id,
                'reason' => WasteReason::Broken,
                'description' => 'محضر إتلاف كشافات ومصابيح تعرضت للكسر العرضي أثناء مناولة الرافعة الشوكية داخل ممرات المستودع',
                'status' => DocumentStatus::Posted,
                'created_by' => $riyadhKeeper->id,
                'approved_by' => $manager->id,
                'approved_at' => Carbon::now()->subDays(5)->setTime(16, 00),
                'items' => [
                    [
                        'item_name' => 'لمبة ليد كروية موفرة للطاقة 12 واط E27',
                        'quantity' => 10.000,
                        'notes' => 'كسر في الغطاء الزجاجي والقاعدة نتيجة سقوط الصندوق',
                    ],
                    [
                        'item_name' => 'كشاف ليد خارجي مقاوم للعوامل الجوية 100 واط IP66',
                        'quantity' => 1.000,
                        'notes' => 'كسر شاشة الحماية الأمامية',
                    ],
                ],
            ],
            [
                'warehouse_id' => $westWarehouse->id,
                'reason' => WasteReason::Damaged,
                'description' => 'محضر تخريد عبوات منظفات تعرضت للثقب والتسريب أثناء عملية تفريغ الشاحنة بمستودع جدة',
                'status' => DocumentStatus::Closed,
                'created_by' => $jeddahKeeper->id,
                'approved_by' => $jeddahKeeper->id,
                'approved_at' => Carbon::now()->subDays(14)->setTime(11, 45),
                'items' => [
                    [
                        'item_name' => 'سائل غسيل أطباق مركز برائحة الليمون 5 لتر',
                        'quantity' => 2.000,
                        'notes' => 'ثقب في الجالون وتسرب المادة المنظفة',
                    ],
                ],
            ],
            [
                'warehouse_id' => $mainWarehouse->id,
                'reason' => WasteReason::Spoiled,
                'description' => 'مسودة محضر فحص مواد استهلاكية مشتبه بفسادها بسبب عطل مؤقت في وحدة التبريد الفرعية',
                'status' => DocumentStatus::Draft,
                'created_by' => $auditor->id,
                'approved_by' => null,
                'approved_at' => null,
                'items' => [
                    [
                        'item_name' => 'زيت نباتي نقي للقلي والطهي 1.5 لتر',
                        'quantity' => 1.000,
                        'notes' => 'عبوة متضررة قيد معاينة مندوب التأمين',
                    ],
                ],
            ],
        ];

        foreach ($reportsData as $data) {
            $items = $data['items'];
            unset($data['items']);

            $report = WasteReport::updateOrCreate(
                [
                    'warehouse_id' => $data['warehouse_id'],
                    'reason' => $data['reason'],
                    'description' => $data['description'],
                ],
                $data
            );

            $report->items()->delete();
            foreach ($items as $itemData) {
                $item = Item::where('name', $itemData['item_name'])->first();
                if (! $item) {
                    continue;
                }

                $report->items()->create([
                    'item_id' => $item->id,
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'],
                ]);
            }
        }
    }
}
