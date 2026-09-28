<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dispatch_vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses');
            $table->foreignId('sector_id')->constrained('sectors');
            $table->foreignId('recipient_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('recipient_name_snapshot');
            $table->foreignId('issued_by')->constrained('users');
            $table->date('issue_date');
            $table->text('notes')->nullable();
            $table->string('status', 30)->default('DRAFT')->index();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['sector_id', 'issue_date']);
            $table->index('issue_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_vouchers');
    }
};
