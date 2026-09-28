<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Models\StockAdjustment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockAdjustment>
 */
class StockAdjustmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'warehouse_id' => Warehouse::factory(),
            'adjustment_date' => fake()->date(),
            'reason' => fake()->randomElement(['Annual Physical Count', 'Quarterly Spot Check', 'Damaged Packaging', 'Cycle Count Variance']),
            'description' => fake()->sentence(),
            'status' => DocumentStatus::Draft,
            'created_by' => User::factory(),
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the adjustment is closed/approved.
     */
    public function closed(?User $approver = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DocumentStatus::Closed,
            'approved_by' => $approver ? $approver->id : User::factory(),
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the adjustment is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DocumentStatus::Cancelled,
        ]);
    }
}
