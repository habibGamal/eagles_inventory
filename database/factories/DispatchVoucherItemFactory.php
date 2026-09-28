<?php

namespace Database\Factories;

use App\Models\DispatchVoucher;
use App\Models\DispatchVoucherItem;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DispatchVoucherItem>
 */
class DispatchVoucherItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dispatch_voucher_id' => DispatchVoucher::factory(),
            'item_id' => Item::factory(),
            'quantity' => fake()->randomFloat(3, 1, 50),
        ];
    }
}
