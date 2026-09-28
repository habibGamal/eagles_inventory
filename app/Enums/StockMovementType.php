<?php

namespace App\Enums;

enum StockMovementType: string
{
    case PurchaseIn = 'PURCHASE_IN';
    case DispatchOut = 'DISPATCH_OUT';
    case WasteOut = 'WASTE_OUT';
    case AdjustmentIn = 'ADJUSTMENT_IN';
    case AdjustmentOut = 'ADJUSTMENT_OUT';

    /**
     * Get a human-readable label for the movement type.
     */
    public function label(): string
    {
        return match ($this) {
            self::PurchaseIn => 'Purchase In',
            self::DispatchOut => 'Dispatch Out',
            self::WasteOut => 'Waste Out',
            self::AdjustmentIn => 'Adjustment In',
            self::AdjustmentOut => 'Adjustment Out',
        };
    }

    /**
     * Determine if this movement increases inventory stock.
     */
    public function isIngress(): bool
    {
        return match ($this) {
            self::PurchaseIn, self::AdjustmentIn => true,
            self::DispatchOut, self::WasteOut, self::AdjustmentOut => false,
        };
    }

    /**
     * Determine if this movement decreases inventory stock.
     */
    public function isEgress(): bool
    {
        return ! $this->isIngress();
    }

    /**
     * Get all available values.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
