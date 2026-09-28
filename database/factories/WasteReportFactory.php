<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Enums\WasteReason;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WasteReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WasteReport>
 */
class WasteReportFactory extends Factory
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
            'reason' => fake()->randomElement(WasteReason::cases()),
            'description' => fake()->sentence(),
            'status' => DocumentStatus::Draft,
            'created_by' => User::factory(),
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the waste report is closed/approved.
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
     * Indicate that the waste report is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DocumentStatus::Cancelled,
        ]);
    }
}
