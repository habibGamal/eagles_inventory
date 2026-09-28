<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Models\DispatchVoucher;
use App\Models\Employee;
use App\Models\Sector;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DispatchVoucher>
 */
class DispatchVoucherFactory extends Factory
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
            'sector_id' => Sector::factory(),
            'recipient_employee_id' => Employee::factory(),
            'recipient_name_snapshot' => fake()->name(),
            'issued_by' => User::factory(),
            'issue_date' => fake()->date(),
            'notes' => fake()->sentence(),
            'status' => DocumentStatus::Draft,
            'created_by' => User::factory(),
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the voucher is closed/posted.
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
     * Indicate that the voucher is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DocumentStatus::Cancelled,
        ]);
    }
}
