<?php

namespace Database\Seeders;

use App\Enums\DocumentStatus;
use App\Enums\StockMovementType;
use App\Models\DispatchVoucher;
use App\Models\PurchaseInvoice;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use App\Models\WasteReport;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class StockMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        // Collect all transactions that affect stock movements
        $events = [];

        // 1. Purchase Invoices (Posted or Closed)
        $invoices = PurchaseInvoice::with('items')
            ->whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed])
            ->get();

        foreach ($invoices as $invoice) {
            $date = $invoice->received_at ?? Carbon::parse($invoice->invoice_date)->setTime(10, 0);
            foreach ($invoice->items as $item) {
                $events[] = [
                    'warehouse_id' => $invoice->warehouse_id,
                    'item_id' => $item->item_id,
                    'movement_type' => StockMovementType::PurchaseIn,
                    'quantity' => (float) $item->quantity,
                    'reference_type' => PurchaseInvoice::class,
                    'reference_id' => $invoice->id,
                    'movement_date' => $date,
                    'created_by' => $invoice->approved_by ?? $invoice->created_by,
                ];
            }
        }

        // 2. Dispatch Vouchers (Posted or Closed)
        $vouchers = DispatchVoucher::with('items')
            ->whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed])
            ->get();

        foreach ($vouchers as $voucher) {
            $date = $voucher->approved_at ?? Carbon::parse($voucher->issue_date)->setTime(12, 0);
            foreach ($voucher->items as $item) {
                $events[] = [
                    'warehouse_id' => $voucher->warehouse_id,
                    'item_id' => $item->item_id,
                    'movement_type' => StockMovementType::DispatchOut,
                    'quantity' => (float) $item->quantity,
                    'reference_type' => DispatchVoucher::class,
                    'reference_id' => $voucher->id,
                    'movement_date' => $date,
                    'created_by' => $voucher->issued_by ?? $voucher->created_by,
                ];
            }
        }

        // 3. Waste Reports (Posted or Closed)
        $wasteReports = WasteReport::with('items')
            ->whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed])
            ->get();

        foreach ($wasteReports as $report) {
            $date = $report->approved_at ?? $report->created_at ?? Carbon::now()->subDays(5);
            foreach ($report->items as $item) {
                $events[] = [
                    'warehouse_id' => $report->warehouse_id,
                    'item_id' => $item->item_id,
                    'movement_type' => StockMovementType::WasteOut,
                    'quantity' => (float) $item->quantity,
                    'reference_type' => WasteReport::class,
                    'reference_id' => $report->id,
                    'movement_date' => $date,
                    'created_by' => $report->approved_by ?? $report->created_by,
                ];
            }
        }

        // 4. Stock Adjustments (Posted or Closed)
        $adjustments = StockAdjustment::with('items')
            ->whereIn('status', [DocumentStatus::Posted, DocumentStatus::Closed])
            ->get();

        foreach ($adjustments as $adj) {
            $date = $adj->approved_at ?? Carbon::parse($adj->adjustment_date)->setTime(15, 0);
            foreach ($adj->items as $item) {
                $diff = (float) $item->difference;
                if ($diff === 0.0) {
                    continue;
                }

                $events[] = [
                    'warehouse_id' => $adj->warehouse_id,
                    'item_id' => $item->item_id,
                    'movement_type' => $diff > 0 ? StockMovementType::AdjustmentIn : StockMovementType::AdjustmentOut,
                    'quantity' => abs($diff),
                    'reference_type' => StockAdjustment::class,
                    'reference_id' => $adj->id,
                    'movement_date' => $date,
                    'created_by' => $adj->approved_by ?? $adj->created_by,
                ];
            }
        }

        // Sort events chronologically
        usort($events, function ($a, $b) {
            return Carbon::parse($a['movement_date'])->getTimestamp() <=> Carbon::parse($b['movement_date'])->getTimestamp();
        });

        // Clear existing movements for seeded documents to maintain exact consistency
        StockMovement::whereIn('reference_type', [
            PurchaseInvoice::class,
            DispatchVoucher::class,
            WasteReport::class,
            StockAdjustment::class,
        ])->delete();

        // Track running balances per warehouse and item
        $runningBalances = [];

        foreach ($events as $event) {
            $key = $event['warehouse_id'].'_'.$event['item_id'];
            $current = $runningBalances[$key] ?? 0.0;

            if ($event['movement_type']->isIngress()) {
                $newBalance = round($current + $event['quantity'], 3);
            } else {
                $newBalance = round($current - $event['quantity'], 3);
            }

            $runningBalances[$key] = $newBalance;

            StockMovement::create([
                'warehouse_id' => $event['warehouse_id'],
                'item_id' => $event['item_id'],
                'movement_type' => $event['movement_type'],
                'quantity' => $event['quantity'],
                'balance_after' => $newBalance,
                'reference_type' => $event['reference_type'],
                'reference_id' => $event['reference_id'],
                'movement_date' => $event['movement_date'],
                'created_by' => $event['created_by'],
                'created_at' => $event['movement_date'],
            ]);
        }
    }
}
