<?php

namespace App\Models;

use Database\Factories\DispatchVoucherItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $dispatch_voucher_id
 * @property int $item_id
 * @property string $quantity
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['dispatch_voucher_id', 'item_id', 'quantity'])]
class DispatchVoucherItem extends Model
{
    /** @use HasFactory<DispatchVoucherItemFactory> */
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
     * Get the parent dispatch voucher.
     *
     * @return BelongsTo<DispatchVoucher, $this>
     */
    public function dispatchVoucher(): BelongsTo
    {
        return $this->belongsTo(DispatchVoucher::class);
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
