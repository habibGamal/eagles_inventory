<?php

namespace Database\Seeders;

use App\Enums\DocumentStatus;
use App\Models\Item;
use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PurchaseInvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Supplier::count() === 0) {
            $this->call(SupplierSeeder::class);
        }

        if (Warehouse::count() === 0) {
            $this->call(WarehouseSeeder::class);
        }

        if (Item::count() === 0) {
            $this->call(ItemSeeder::class);
        }

        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }

        $creator = User::where('email', 'f.mansoor@eagles.sa')->first() ?? User::first();
        $managerApprover = User::where('email', 's.subaie@eagles.sa')->first() ?? User::first();
        $jeddahApprover = User::where('email', 'm.otaibi@eagles.sa')->first() ?? User::first();

        $mainWarehouse = Warehouse::where('name', 'like', '%المركزي%')->first() ?? Warehouse::first();
        $westWarehouse = Warehouse::where('name', 'like', '%الغربية%')->first() ?? Warehouse::first();
        $spareWarehouse = Warehouse::where('name', 'like', '%قطع الغيار%')->first() ?? Warehouse::first();
        $coldWarehouse = Warehouse::where('name', 'like', '%التبريد%')->first() ?? Warehouse::first();

        $supplierFood = Supplier::where('name', 'like', '%التموين العربي%')->first() ?? Supplier::first();
        $supplierClean = Supplier::where('name', 'like', '%النقاء%')->first() ?? Supplier::first();
        $supplierElectric = Supplier::where('name', 'like', '%كهرباء وتقنية%')->first() ?? Supplier::first();
        $supplierPaper = Supplier::where('name', 'like', '%الورق الفاخر%')->first() ?? Supplier::first();
        $supplierMeat = Supplier::where('name', 'like', '%مزارع البركة%')->first() ?? Supplier::first();

        $invoicesData = [
            [
                'supplier_id' => $supplierFood->id,
                'warehouse_id' => $mainWarehouse->id,
                'invoice_date' => Carbon::now()->subDays(15)->toDateString(),
                'received_at' => Carbon::now()->subDays(14)->setTime(10, 30),
                'discount' => 380.00,
                'status' => DocumentStatus::Posted,
                'notes' => 'توريد الدفعة الدورية الأولى للمواد الغذائية والتموينية لشهر سبتمبر - مستودع الرياض المركزي',
                'created_by' => $creator->id,
                'approved_by' => $managerApprover->id,
                'approved_at' => Carbon::now()->subDays(14)->setTime(11, 00),
                'items' => [
                    [
                        'item_name' => 'أرز بسمتي هندي كلاسيك عنبر 40 كجم',
                        'quantity' => 50.000,
                        'unit_price' => 180.00,
                    ],
                    [
                        'item_name' => 'زيت نباتي نقي للقلي والطهي 1.5 لتر',
                        'quantity' => 40.000,
                        'unit_price' => 75.00,
                    ],
                    [
                        'item_name' => 'حليب طازج طويل الأجل كامل الدسم 1 لتر',
                        'quantity' => 60.000,
                        'unit_price' => 48.00,
                    ],
                ],
            ],
            [
                'supplier_id' => $supplierClean->id,
                'warehouse_id' => $westWarehouse->id,
                'invoice_date' => Carbon::now()->subDays(20)->toDateString(),
                'received_at' => Carbon::now()->subDays(19)->setTime(9, 15),
                'discount' => 220.00,
                'status' => DocumentStatus::Closed,
                'notes' => 'توريد مستلزمات نظافة وتعقيم خاصة بمرافق المنطقة الغربية والفنادق التابعة',
                'created_by' => $creator->id,
                'approved_by' => $jeddahApprover->id,
                'approved_at' => Carbon::now()->subDays(19)->setTime(10, 00),
                'items' => [
                    [
                        'item_name' => 'سائل غسيل أطباق مركز برائحة الليمون 5 لتر',
                        'quantity' => 30.000,
                        'unit_price' => 35.00,
                    ],
                    [
                        'item_name' => 'مطهر ومعقم أرضيات برائحة اللافندر 4 لتر',
                        'quantity' => 25.000,
                        'unit_price' => 40.00,
                    ],
                    [
                        'item_name' => 'مناديل رول تنشيف يدوي وسحب فندقي',
                        'quantity' => 50.000,
                        'unit_price' => 65.00,
                    ],
                    [
                        'item_name' => 'أكياس نفايات متينة سعة 50 جالون أسود',
                        'quantity' => 40.000,
                        'unit_price' => 28.00,
                    ],
                ],
            ],
            [
                'supplier_id' => $supplierElectric->id,
                'warehouse_id' => $spareWarehouse->id,
                'invoice_date' => Carbon::now()->subDays(10)->toDateString(),
                'received_at' => Carbon::now()->subDays(9)->setTime(14, 00),
                'discount' => 400.00,
                'status' => DocumentStatus::Posted,
                'notes' => 'توريد دفعة قطع غيار كهربائية ومستلزمات صيانة وقائية للمباني والمنشآت',
                'created_by' => $creator->id,
                'approved_by' => $managerApprover->id,
                'approved_at' => Carbon::now()->subDays(9)->setTime(15, 30),
                'items' => [
                    [
                        'item_name' => 'قاطع تيار كهربائي ثلاثي الأقطاب 63 أمبير Schneider',
                        'quantity' => 20.000,
                        'unit_price' => 145.00,
                    ],
                    [
                        'item_name' => 'لمبة ليد كروية موفرة للطاقة 12 واط E27',
                        'quantity' => 200.000,
                        'unit_price' => 8.50,
                    ],
                    [
                        'item_name' => 'كشاف ليد خارجي مقاوم للعوامل الجوية 100 واط IP66',
                        'quantity' => 15.000,
                        'unit_price' => 120.00,
                    ],
                    [
                        'item_name' => 'سلك نحاس معزول 4 ملم لفة 100 متر أزرق',
                        'quantity' => 25.000,
                        'unit_price' => 160.00,
                    ],
                ],
            ],
            [
                'supplier_id' => $supplierPaper->id,
                'warehouse_id' => $mainWarehouse->id,
                'invoice_date' => Carbon::now()->subDays(2)->toDateString(),
                'received_at' => null,
                'discount' => 100.00,
                'status' => DocumentStatus::Draft,
                'notes' => 'مسودة فاتورة توريد قرطاسية ومطبوعات قيد الفحص والاستلام الظاهري للشحنة',
                'created_by' => $creator->id,
                'approved_by' => null,
                'approved_at' => null,
                'items' => [
                    [
                        'item_name' => 'ورق تصوير وطباعة ليزر A4 وزن 80 جم كرتون',
                        'quantity' => 40.000,
                        'unit_price' => 95.00,
                    ],
                    [
                        'item_name' => 'حبر طابعة ليزر أسود HP LaserJet 85A أصلي',
                        'quantity' => 10.000,
                        'unit_price' => 210.00,
                    ],
                    [
                        'item_name' => 'ملف حفظ مستندات بلاستيكي عريض بوكس 7 سم أزرق',
                        'quantity' => 20.000,
                        'unit_price' => 45.00,
                    ],
                ],
            ],
            [
                'supplier_id' => $supplierMeat->id,
                'warehouse_id' => $coldWarehouse->id,
                'invoice_date' => Carbon::now()->subDays(25)->toDateString(),
                'received_at' => null,
                'discount' => 0.00,
                'status' => DocumentStatus::Cancelled,
                'notes' => 'فاتورة ملغاة لعدم التزام المورد بمواصفات درجة حرارة سيارة النقل المبردة عند الوصول',
                'created_by' => $creator->id,
                'approved_by' => null,
                'approved_at' => null,
                'items' => [
                    [
                        'item_name' => 'صدور دجاج طرية مجمدة بدون عظم 2 كجم',
                        'quantity' => 30.000,
                        'unit_price' => 110.00,
                    ],
                ],
            ],
        ];

        foreach ($invoicesData as $data) {
            $items = $data['items'];
            unset($data['items']);

            $subtotal = 0.0;
            $preparedItems = [];

            foreach ($items as $itemData) {
                $item = Item::where('name', $itemData['item_name'])->first();
                if (! $item) {
                    continue;
                }

                $lineTotal = round((float) $itemData['quantity'] * (float) $itemData['unit_price'], 2);
                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'item_id' => $item->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total' => $lineTotal,
                ];
            }

            $discount = (float) $data['discount'];
            $total = max(0.0, round($subtotal - $discount, 2));

            $data['subtotal'] = $subtotal;
            $data['total'] = $total;

            $invoice = PurchaseInvoice::updateOrCreate(
                [
                    'supplier_id' => $data['supplier_id'],
                    'warehouse_id' => $data['warehouse_id'],
                    'invoice_date' => $data['invoice_date'],
                    'notes' => $data['notes'],
                ],
                $data
            );

            // Recreate or ensure items
            $invoice->items()->delete();
            foreach ($preparedItems as $prepItem) {
                $invoice->items()->create($prepItem);
            }
        }
    }
}
