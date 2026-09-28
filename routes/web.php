<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DispatchVoucherController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\PurchaseInvoiceController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('warehouses', WarehouseController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::resource('sectors', SectorController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('employees', EmployeeController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('item-categories', ItemCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('units', UnitController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('items', ItemController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::resource('suppliers', SupplierController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('purchase-invoices', PurchaseInvoiceController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('purchase-invoices/{purchase_invoice}/post', [PurchaseInvoiceController::class, 'post'])->name('purchase-invoices.post');
    Route::resource('dispatch-vouchers', DispatchVoucherController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('dispatch-vouchers/{dispatch_voucher}/post', [DispatchVoucherController::class, 'post'])->name('dispatch-vouchers.post');
});

require __DIR__.'/settings.php';
