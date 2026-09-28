<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees with statistics.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = Employee::query()
            ->withCount('dispatchVouchers')
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%");
                });
            })
            ->latest('id');

        $employees = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Employee::count(),
            'active' => Employee::where('is_active', true)->count(),
            'departments' => Employee::distinct()->whereNotNull('department')->count('department'),
        ];

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Employee::create([
            'name' => $validated['name'],
            'department' => $validated['department'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('employees.index')->with('success', 'تم إضافة الموظف بنجاح');
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $employee->update([
            'name' => $validated['name'],
            'department' => $validated['department'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('employees.index')->with('success', 'تم تحديث بيانات الموظف بنجاح');
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        if ($employee->dispatchVouchers()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف الموظف لوجود أذون صرف عهد أو مواد مرتبطة به');
        }

        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'تم حذف الموظف بنجاح');
    }
}
