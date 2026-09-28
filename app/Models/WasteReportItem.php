<?php

namespace App\Models;

use Database\Factories\WasteReportItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $waste_report_id
 * @property int $item_id
 * @property string $quantity
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['waste_report_id', 'item_id', 'quantity', 'notes'])]
class WasteReportItem extends Model
{
    /** @use HasFactory<WasteReportItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
        ];
    }

    /**
     * Get the parent waste report.
     *
     * @return BelongsTo<WasteReport, $this>
     */
    public function wasteReport(): BelongsTo
    {
        return $this->belongsTo(WasteReport::class);
    }

    /**
     * Get the inventory item.
     *
     * @return BelongsTo<Item, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
