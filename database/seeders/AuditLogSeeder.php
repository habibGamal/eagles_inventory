<?php

namespace Database\Seeders;

use App\Enums\AuditAction;
use App\Models\AuditLog;
use App\Models\DispatchVoucher;
use App\Models\Item;
use App\Models\PurchaseInvoice;
use App\Models\StockAdjustment;
use App\Models\User;
use App\Models\WasteReport;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }

        if (PurchaseInvoice::count() === 0) {
            $this->call(PurchaseInvoiceSeeder::class);
        }

        if (DispatchVoucher::count() === 0) {
            $this->call(DispatchVoucherSeeder::class);
        }

        if (WasteReport::count() === 0) {
            $this->call(WasteReportSeeder::class);
        }

        if (StockAdjustment::count() === 0) {
            $this->call(StockAdjustmentSeeder::class);
        }

        $admin = User::where('email', 'admin@eagles.sa')->first() ?? User::first();
        $manager = User::where('email', 's.subaie@eagles.sa')->first() ?? User::first();
        $procurement = User::where('email', 'f.mansoor@eagles.sa')->first() ?? User::first();
        $auditor = User::where('email', 'n.dosari@eagles.sa')->first() ?? User::first();
        $dispatchUser = User::where('email', 'k.zahrani@eagles.sa')->first() ?? User::first();

        $invoice1 = PurchaseInvoice::first();
        $voucher1 = DispatchVoucher::first();
        $waste1 = WasteReport::first();
        $adj1 = StockAdjustment::first();
        $item1 = Item::first();

        AuditLog::query()->delete();

        $logs = [];

        if ($invoice1) {
            $logs[] = [
                'user_id' => $procurement->id,
                'action' => AuditAction::Create,
                'auditable_type' => PurchaseInvoice::class,
                'auditable_id' => $invoice1->id,
                'old_values' => null,
                'new_values' => [
                    'status' => 'DRAFT',
                    'supplier' => $invoice1->supplier?->name ?? 'مورد تجاري',
                    'total' => $invoice1->total,
                    'notes' => 'إنشاء مسودة فاتورة توريد مواد غذائية',
                ],
                'ip_address' => '192.168.1.15',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(15)->setTime(10, 15),
            ];

            $logs[] = [
                'user_id' => $manager->id,
                'action' => AuditAction::Approve,
                'auditable_type' => PurchaseInvoice::class,
                'auditable_id' => $invoice1->id,
                'old_values' => ['status' => 'DRAFT'],
                'new_values' => [
                    'status' => 'POSTED',
                    'approved_by' => $manager->name,
                    'notes' => 'اعتماد وترحيل فاتورة التوريد وتحديث الأرصدة المخزنية',
                ],
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(14)->setTime(11, 00),
            ];

            $logs[] = [
                'user_id' => $procurement->id,
                'action' => AuditAction::Print,
                'auditable_type' => PurchaseInvoice::class,
                'auditable_id' => $invoice1->id,
                'old_values' => null,
                'new_values' => ['action' => 'طباعة إشعار استلام بضاعة ومطابقة مستندية'],
                'ip_address' => '192.168.1.15',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(14)->setTime(11, 20),
            ];
        }

        if ($voucher1) {
            $logs[] = [
                'user_id' => $dispatchUser->id,
                'action' => AuditAction::Create,
                'auditable_type' => DispatchVoucher::class,
                'auditable_id' => $voucher1->id,
                'old_values' => null,
                'new_values' => [
                    'status' => 'DRAFT',
                    'sector' => $voucher1->sector?->name ?? 'القطاع المستفيد',
                    'recipient' => $voucher1->recipient_name_snapshot,
                    'notes' => 'إنشاء طلب وسند صرف مستودعي لمواد تموينية',
                ],
                'ip_address' => '192.168.1.22',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(12)->setTime(12, 10),
            ];

            $logs[] = [
                'user_id' => $manager->id,
                'action' => AuditAction::Approve,
                'auditable_type' => DispatchVoucher::class,
                'auditable_id' => $voucher1->id,
                'old_values' => ['status' => 'DRAFT'],
                'new_values' => [
                    'status' => 'POSTED',
                    'approved_by' => $manager->name,
                    'notes' => 'اعتماد صرف البنود وخصم الكميات من مستودع الرياض',
                ],
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(12)->setTime(13, 00),
            ];
        }

        if ($waste1) {
            $logs[] = [
                'user_id' => $auditor->id,
                'action' => AuditAction::Create,
                'auditable_type' => WasteReport::class,
                'auditable_id' => $waste1->id,
                'old_values' => null,
                'new_values' => [
                    'reason' => 'EXPIRED',
                    'description' => 'تسجيل محضر تلف وانتهاء صلاحية مواد غذائية',
                ],
                'ip_address' => '192.168.1.18',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(8)->setTime(13, 30),
            ];

            $logs[] = [
                'user_id' => $manager->id,
                'action' => AuditAction::Approve,
                'auditable_type' => WasteReport::class,
                'auditable_id' => $waste1->id,
                'old_values' => ['status' => 'DRAFT'],
                'new_values' => [
                    'status' => 'POSTED',
                    'notes' => 'اعتماد قرار الإتلاف وشطب الكميات التالفة دفترياً',
                ],
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(8)->setTime(14, 20),
            ];
        }

        if ($adj1) {
            $logs[] = [
                'user_id' => $auditor->id,
                'action' => AuditAction::Create,
                'auditable_type' => StockAdjustment::class,
                'auditable_id' => $adj1->id,
                'old_values' => null,
                'new_values' => [
                    'reason' => 'تسوية فروقات الجرد الفعلي الدوري',
                    'status' => 'DRAFT',
                ],
                'ip_address' => '192.168.1.18',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(6)->setTime(14, 00),
            ];

            $logs[] = [
                'user_id' => $manager->id,
                'action' => AuditAction::Approve,
                'auditable_type' => StockAdjustment::class,
                'auditable_id' => $adj1->id,
                'old_values' => ['status' => 'DRAFT'],
                'new_values' => [
                    'status' => 'POSTED',
                    'notes' => 'اعتماد نتائج الجرد الفعلي ومطابقة السجلات المحاسبية',
                ],
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(6)->setTime(15, 00),
            ];
        }

        if ($item1) {
            $logs[] = [
                'user_id' => $admin->id,
                'action' => AuditAction::Create,
                'auditable_type' => Item::class,
                'auditable_id' => $item1->id,
                'old_values' => null,
                'new_values' => [
                    'name' => $item1->name,
                    'minimum_stock' => $item1->minimum_stock,
                    'notes' => 'تعريف صنف جديد بدليل الأصناف المخزنية',
                ],
                'ip_address' => '192.168.1.5',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'created_at' => Carbon::now()->subDays(30)->setTime(9, 00),
            ];
        }

        foreach ($logs as $logData) {
            AuditLog::create($logData);
        }
    }
}
