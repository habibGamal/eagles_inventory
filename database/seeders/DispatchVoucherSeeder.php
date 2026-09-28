<?php

namespace Database\Seeders;

use App\Enums\DocumentStatus;
use App\Models\DispatchVoucher;
use App\Models\Employee;
use App\Models\Item;
use App\Models\Sector;
use App\Models\User;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DispatchVoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Warehouse::count() === 0) {
            $this->call(WarehouseSeeder::class);
        }

        if (Sector::count() === 0) {
            $this->call(SectorSeeder::class);
        }

        if (Employee::count() === 0) {
            $this->call(EmployeeSeeder::class);
        }

        if (Item::count() === 0) {
            $this->call(ItemSeeder::class);
        }

        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }

        $creator = User::where('email', 'k.zahrani@eagles.sa')->first() ?? User::first();
        $managerApprover = User::where('email', 's.subaie@eagles.sa')->first() ?? User::first();
        $riyadhIssuer = User::where('email', 'a.qahtani@eagles.sa')->first() ?? User::first();
        $jeddahIssuer = User::where('email', 'm.otaibi@eagles.sa')->first() ?? User::first();

        $mainWarehouse = Warehouse::where('name', 'like', '%المركزي%')->first() ?? Warehouse::first();
        $westWarehouse = Warehouse::where('name', 'like', '%الغربية%')->first() ?? Warehouse::first();
        $spareWarehouse = Warehouse::where('name', 'like', '%قطع الغيار%')->first() ?? Warehouse::first();

        $hotelSector = Sector::where('name', 'like', '%فندق إيجلز بالاس%')->first() ?? Sector::first();
        $electricSector = Sector::where('name', 'like', '%الكهربائية%')->first() ?? Sector::first();
        $restaurantSector = Sector::where('name', 'like', '%الديوان%')->first() ?? Sector::first();
        $itSector = Sector::where('name', 'like', '%تقنية المعلومات%')->first() ?? Sector::first();
        $hvacSector = Sector::where('name', 'like', '%التكييف%')->first() ?? Sector::first();

        $empShehri = Employee::where('name', 'like', '%الشهري%')->first();
        $empMalki = Employee::where('name', 'like', '%المالكي%')->first();
        $empBawazeer = Employee::where('name', 'like', '%باوزير%')->first();
        $empBalwi = Employee::where('name', 'like', '%البلوي%')->first();
        $empSaeed = Employee::where('name', 'like', '%السعيد%')->first();

        $vouchersData = [
            [
                'warehouse_id' => $mainWarehouse->id,
                'sector_id' => $hotelSector->id,
                'recipient_employee_id' => $empShehri?->id,
                'recipient_name_snapshot' => 'عبدالعزيز محمد الشهري - مشرف عهدة فندق إيجلز بالاس',
                'issued_by' => $riyadhIssuer->id,
                'issue_date' => Carbon::now()->subDays(12)->toDateString(),
                'status' => DocumentStatus::Posted,
                'notes' => 'صرف مخصص الإعاشة الأسبوعي لمطعم الفندق الرئيسي بناءً على طلب الاحتياج رقم 104',
                'created_by' => $creator->id,
                'approved_by' => $managerApprover->id,
                'approved_at' => Carbon::now()->subDays(12)->setTime(13, 00),
                'items' => [
                    [
                        'item_name' => 'أرز بسمتي هندي كلاسيك عنبر 40 كجم',
                        'quantity' => 15.000,
                    ],
                    [
                        'item_name' => 'زيت نباتي نقي للقلي والطهي 1.5 لتر',
                        'quantity' => 10.000,
                    ],
                    [
                        'item_name' => 'حليب طازج طويل الأجل كامل الدسم 1 لتر',
                        'quantity' => 20.000,
                    ],
                ],
            ],
            [
                'warehouse_id' => $spareWarehouse->id,
                'sector_id' => $electricSector->id,
                'recipient_employee_id' => $empMalki?->id,
                'recipient_name_snapshot' => 'سعود عبدالعزيز المالكي - فني أول أعمال كهربائية',
                'issued_by' => $riyadhIssuer->id,
                'issue_date' => Carbon::now()->subDays(7)->toDateString(),
                'status' => DocumentStatus::Posted,
                'notes' => 'صرف مواد لأعمال الصيانة الدورية وتجديد لوحات الإنارة في المبنى الرئيسي',
                'created_by' => $creator->id,
                'approved_by' => $managerApprover->id,
                'approved_at' => Carbon::now()->subDays(7)->setTime(11, 30),
                'items' => [
                    [
                        'item_name' => 'قاطع تيار كهربائي ثلاثي الأقطاب 63 أمبير Schneider',
                        'quantity' => 4.000,
                    ],
                    [
                        'item_name' => 'لمبة ليد كروية موفرة للطاقة 12 واط E27',
                        'quantity' => 50.000,
                    ],
                    [
                        'item_name' => 'سلك نحاس معزول 4 ملم لفة 100 متر أزرق',
                        'quantity' => 5.000,
                    ],
                ],
            ],
            [
                'warehouse_id' => $westWarehouse->id,
                'sector_id' => $restaurantSector->id,
                'recipient_employee_id' => $empBawazeer?->id,
                'recipient_name_snapshot' => 'عمر سالم باوزير - مدير تشغيل المطعم',
                'issued_by' => $jeddahIssuer->id,
                'issue_date' => Carbon::now()->subDays(15)->toDateString(),
                'status' => DocumentStatus::Closed,
                'notes' => 'صرف مستلزمات نظافة دورية للمطبخ وقاعات الضيافة بمطعم الديوان',
                'created_by' => $creator->id,
                'approved_by' => $jeddahIssuer->id,
                'approved_at' => Carbon::now()->subDays(15)->setTime(12, 15),
                'items' => [
                    [
                        'item_name' => 'سائل غسيل أطباق مركز برائحة الليمون 5 لتر',
                        'quantity' => 8.000,
                    ],
                    [
                        'item_name' => 'مطهر ومعقم أرضيات برائحة اللافندر 4 لتر',
                        'quantity' => 6.000,
                    ],
                    [
                        'item_name' => 'مناديل رول تنشيف يدوي وسحب فندقي',
                        'quantity' => 12.000,
                    ],
                ],
            ],
            [
                'warehouse_id' => $mainWarehouse->id,
                'sector_id' => $itSector->id,
                'recipient_employee_id' => $empBalwi?->id,
                'recipient_name_snapshot' => 'ياسر فهد البلوي - مهندس نظم وشبكات',
                'issued_by' => $riyadhIssuer->id,
                'issue_date' => Carbon::now()->toDateString(),
                'status' => DocumentStatus::Draft,
                'notes' => 'طلب صرف ورق لطباعة تقارير مركز البيانات والأنظمة بانتظار الاعتماد النهائي',
                'created_by' => $creator->id,
                'approved_by' => null,
                'approved_at' => null,
                'items' => [
                    [
                        'item_name' => 'ورق تصوير وطباعة ليزر A4 وزن 80 جم كرتون',
                        'quantity' => 5.000,
                    ],
                ],
            ],
            [
                'warehouse_id' => $mainWarehouse->id,
                'sector_id' => $hvacSector->id,
                'recipient_employee_id' => $empSaeed?->id,
                'recipient_name_snapshot' => 'إبراهيم ناصر السعيد - مسؤول صيانة التكييف',
                'issued_by' => $riyadhIssuer->id,
                'issue_date' => Carbon::now()->subDays(18)->toDateString(),
                'status' => DocumentStatus::Cancelled,
                'notes' => 'سند ملغي بناءً على طلب القسم نظراً لتوفر مواد بديلة في المستودع الفرعي',
                'created_by' => $creator->id,
                'approved_by' => null,
                'approved_at' => null,
                'items' => [
                    [
                        'item_name' => 'لمبة ليد كروية موفرة للطاقة 12 واط E27',
                        'quantity' => 20.000,
                    ],
                ],
            ],
        ];

        foreach ($vouchersData as $data) {
            $items = $data['items'];
            unset($data['items']);

            $voucher = DispatchVoucher::updateOrCreate(
                [
                    'warehouse_id' => $data['warehouse_id'],
                    'sector_id' => $data['sector_id'],
                    'issue_date' => $data['issue_date'],
                    'notes' => $data['notes'],
                ],
                $data
            );

            $voucher->items()->delete();
            foreach ($items as $itemData) {
                $item = Item::where('name', $itemData['item_name'])->first();
                if (! $item) {
                    continue;
                }

                $voucher->items()->create([
                    'item_id' => $item->id,
                    'quantity' => $itemData['quantity'],
                ]);
            }
        }
    }
}
