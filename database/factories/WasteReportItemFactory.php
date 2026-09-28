<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\WasteReport;
use App\Models\WasteReportItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WasteReportItem>
 */
class WasteReportItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'waste_report_id' => WasteReport::factory(),
            'item_id' => Item::factory(),
            'quantity' => fake()->randomFloat(3, 1, 20),
            'notes' => fake()->sentence(),
        ];
    }
}
