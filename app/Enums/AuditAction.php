<?php

namespace App\Enums;

enum AuditAction: string
{
    case Create = 'CREATE';
    case Close = 'CLOSE';
    case Approve = 'APPROVE';
    case Cancel = 'CANCEL';
    case Print = 'PRINT';
    case Reverse = 'REVERSE';

    /**
     * Get a human-readable label for the audit action.
     */
    public function label(): string
    {
        return match ($this) {
            self::Create => 'Create',
            self::Close => 'Close',
            self::Approve => 'Approve',
            self::Cancel => 'Cancel',
            self::Print => 'Print',
            self::Reverse => 'Reverse',
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
