<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockAdjustmentItem>
 */
class StockAdjustmentItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $systemQty = fake()->randomFloat(3, 10, 100);
        $physicalQty = fake()->randomFloat(3, 8, 102);

        return [
            'stock_adjustment_id' => StockAdjustment::factory(),
            'item_id' => Item::factory(),
            'system_quantity' => $systemQty,
            'physical_quantity' => $physicalQty,
            'difference' => round($physicalQty - $systemQty, 3),
            'notes' => fake()->sentence(),
        ];
    }
}
