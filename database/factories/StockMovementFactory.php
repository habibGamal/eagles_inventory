<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\Item;
use App\Models\PurchaseInvoice;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $invoice = PurchaseInvoice::factory();

        return [
            'warehouse_id' => Warehouse::factory(),
            'item_id' => Item::factory(),
            'movement_type' => StockMovementType::PurchaseIn,
            'quantity' => 10.000,
            'balance_after' => 10.000,
            'reference_type' => PurchaseInvoice::class,
            'reference_id' => $invoice,
            'movement_date' => now(),
            'created_by' => User::factory(),
            'created_at' => now(),
        ];
    }
}
