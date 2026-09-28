<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['name' => 'قطعة / حبة', 'symbol' => 'حبة'],
            ['name' => 'كرتون', 'symbol' => 'كرتون'],
            ['name' => 'كيلو جرام', 'symbol' => 'كجم'],
            ['name' => 'لتر', 'symbol' => 'لتر'],
            ['name' => 'متر طولي', 'symbol' => 'م'],
            ['name' => 'طرد / شدة', 'symbol' => 'طرد'],
            ['name' => 'درزن (12 حبة)', 'symbol' => 'درزن'],
            ['name' => 'جالون (4 لتر)', 'symbol' => 'جالون'],
            ['name' => 'صندوق خشبي', 'symbol' => 'صندوق'],
            ['name' => 'بكرة / لفة', 'symbol' => 'لفة'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(
                ['symbol' => $unit['symbol']],
                $unit
            );
        }
    }
}
