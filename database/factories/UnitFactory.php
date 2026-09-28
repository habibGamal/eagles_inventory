<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $units = [
            ['name' => 'Piece', 'symbol' => 'pcs'],
            ['name' => 'Kilogram', 'symbol' => 'kg'],
            ['name' => 'Liter', 'symbol' => 'L'],
            ['name' => 'Box', 'symbol' => 'box'],
            ['name' => 'Meter', 'symbol' => 'm'],
        ];

        $unit = fake()->randomElement($units);

        return [
            'name' => $unit['name'],
            'symbol' => $unit['symbol'],
        ];
    }
}
