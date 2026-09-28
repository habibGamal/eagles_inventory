<?php

namespace App\Models;

use Database\Factories\ItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property int $category_id
 * @property int $unit_id
 * @property string|null $description
 * @property string $minimum_stock
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'category_id', 'unit_id', 'description', 'minimum_stock', 'is_active'])]
class Item extends Model
{
    /** @use HasFactory<ItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'minimum_stock' => 'decimal:3',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the category that the item belongs to.
     *
     * @return BelongsTo<ItemCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }

    /**
     * Get the unit of measurement for the item.
     *
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Get current stock balances across warehouses for this item.
     *
     * @return HasMany<StockBalance, $this>
     */
    public function stockBalances(): HasMany
    {
        return $this->hasMany(StockBalance::class);
    }

    /**
     * Get all stock ledger movements for this item.
     *
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get purchase invoice line items for this item.
     *
     * @return HasMany<PurchaseInvoiceItem, $this>
     */
    public function purchaseInvoiceItems(): HasMany
    {
        return $this->hasMany(PurchaseInvoiceItem::class);
    }

    /**
     * Get dispatch voucher line items for this item.
     *
     * @return HasMany<DispatchVoucherItem, $this>
     */
    public function dispatchVoucherItems(): HasMany
    {
        return $this->hasMany(DispatchVoucherItem::class);
    }

    /**
     * Get waste report line items for this item.
     *
     * @return HasMany<WasteReportItem, $this>
     */
    public function wasteReportItems(): HasMany
    {
        return $this->hasMany(WasteReportItem::class);
    }

    /**
     * Get stock adjustment line items for this item.
     *
     * @return HasMany<StockAdjustmentItem, $this>
     */
    public function stockAdjustmentItems(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class);
    }
}
