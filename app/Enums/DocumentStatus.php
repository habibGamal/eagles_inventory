<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case Draft = 'DRAFT';
    case Closed = 'CLOSED';
    case Cancelled = 'CANCELLED';
    case Posted = 'POSTED';

    /**
     * Get a human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Closed => 'Closed',
            self::Cancelled => 'Cancelled',
            self::Posted => 'Posted',
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
