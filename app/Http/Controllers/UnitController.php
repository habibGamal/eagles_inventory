<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    /**
     * Display a listing of measurement units.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = Unit::query()
            ->withCount('items')
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('symbol', 'like', "%{$search}%");
                });
            })
            ->latest('id');

        $units = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Unit::count(),
            'linked_items' => Unit::has('items')->count(),
        ];

        return Inertia::render('units/index', [
            'units' => $units,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'symbol' => ['required', 'string', 'max:20'],
        ]);

        Unit::create($validated);

        return redirect()->route('units.index')->with('success', 'تم إنشاء وحدة القياس بنجاح');
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'symbol' => ['required', 'string', 'max:20'],
        ]);

        $unit->update($validated);

        return redirect()->route('units.index')->with('success', 'تم تحديث بيانات وحدة القياس بنجاح');
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->items()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف وحدة القياس لوجود أصناف مخزنية مرتبطة بها');
        }

        $unit->delete();

        return redirect()->route('units.index')->with('success', 'تم حذف وحدة القياس بنجاح');
    }
}
