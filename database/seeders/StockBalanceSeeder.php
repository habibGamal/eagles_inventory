<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class StockBalanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (StockMovement::count() === 0) {
            $this->call(StockMovementSeeder::class);
        }

        // 1. Sync stock balances from the latest stock ledger movements
        $trackedPairs = StockMovement::query()
            ->select(['warehouse_id', 'item_id'])
            ->distinct()
            ->get();

        foreach ($trackedPairs as $pair) {
            $latestMovement = StockMovement::where('warehouse_id', $pair->warehouse_id)
                ->where('item_id', $pair->item_id)
                ->latest('id')
                ->first();

            if ($latestMovement) {
                StockBalance::updateOrCreate(
                    [
                        'warehouse_id' => $pair->warehouse_id,
                        'item_id' => $pair->item_id,
                    ],
                    [
                        'quantity' => $latestMovement->balance_after,
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // 2. Populate initial realistic stock balances for active items in main active warehouses
        $activeWarehouses = Warehouse::where('is_active', true)->get();
        $activeItems = Item::where('is_active', true)->get();

        foreach ($activeWarehouses as $warehouse) {
            foreach ($activeItems as $item) {
                $existing = StockBalance::where('warehouse_id', $warehouse->id)
                    ->where('item_id', $item->id)
                    ->first();

                if (! $existing) {
                    // Seed a reasonable opening balance above minimum stock
                    $minStock = (float) $item->minimum_stock;
                    $openingQty = $minStock > 0 ? round($minStock * 2.5, 3) : 25.000;

                    StockBalance::create([
                        'warehouse_id' => $warehouse->id,
                        'item_id' => $item->id,
                        'quantity' => $openingQty,
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
