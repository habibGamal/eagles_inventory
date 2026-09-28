<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\DispatchVoucher;
use App\Models\Item;
use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main inventory dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'users_count' => User::count(),
            'warehouses_count' => Warehouse::count(),
            'items_count' => Item::count(),
            'suppliers_count' => Supplier::count(),
            'purchase_invoices_count' => PurchaseInvoice::count(),
            'dispatch_vouchers_count' => DispatchVoucher::count(),
        ];

        $recentUsers = User::query()
            ->latest('id')
            ->take(5)
            ->get(['id', 'name', 'email', 'email_verified_at', 'created_at']);

        $recentAuditLogs = AuditLog::query()
            ->with('user:id,name,email')
            ->latest('id')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentAuditLogs' => $recentAuditLogs,
        ]);
    }
}
