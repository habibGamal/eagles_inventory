<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseInvoice>
 */
class PurchaseInvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'warehouse_id' => Warehouse::factory(),
            'invoice_date' => fake()->date(),
            'received_at' => now(),
            'subtotal' => 1000.00,
            'discount' => 50.00,
            'total' => 950.00,
            'status' => DocumentStatus::Draft,
            'notes' => fake()->sentence(),
            'created_by' => User::factory(),
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the invoice is closed/posted.
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
     * Indicate that the invoice is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => DocumentStatus::Cancelled,
        ]);
    }
}
