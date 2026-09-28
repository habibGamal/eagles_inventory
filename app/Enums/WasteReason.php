<?php

namespace App\Enums;

enum WasteReason: string
{
    case Expired = 'EXPIRED';
    case Damaged = 'DAMAGED';
    case Broken = 'BROKEN';
    case Lost = 'LOST';
    case Spoiled = 'SPOILED';
    case Other = 'OTHER';

    /**
     * Get a human-readable label for the reason.
     */
    public function label(): string
    {
        return match ($this) {
            self::Expired => 'Expired',
            self::Damaged => 'Damaged',
            self::Broken => 'Broken',
            self::Lost => 'Lost',
            self::Spoiled => 'Spoiled',
            self::Other => 'Other',
        };
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
