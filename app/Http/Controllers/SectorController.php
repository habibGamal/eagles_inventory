<?php

namespace App\Http\Controllers;

use App\Models\Sector;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SectorController extends Controller
{
    /**
     * Display a listing of sectors with hierarchy and statistics.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = Sector::query()
            ->with('parent:id,name')
            ->withCount(['children', 'dispatchVouchers'])
            ->when($search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest('id');

        $sectors = $query->paginate(10)->withQueryString();

        $parentOptions = Sector::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => Sector::count(),
            'active' => Sector::where('is_active', true)->count(),
            'main_sectors' => Sector::whereNull('parent_id')->count(),
        ];

        return Inertia::render('sectors/index', [
            'sectors' => $sectors,
            'parentOptions' => $parentOptions,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created sector.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:sectors,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Sector::create([
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('sectors.index')->with('success', 'تم إنشاء القسم/القطاع بنجاح');
    }

    /**
     * Update the specified sector.
     */
    public function update(Request $request, Sector $sector): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:sectors,id', 'not_in:'.$sector->id],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $sector->update([
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('sectors.index')->with('success', 'تم تحديث بيانات القسم بنجاح');
    }

    /**
     * Remove the specified sector.
     */
    public function destroy(Sector $sector): RedirectResponse
    {
        if ($sector->children()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف هذا القسم لأنه يحتوي على أقسام فرعية تابعة له');
        }

        if ($sector->dispatchVouchers()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف هذا القسم لوجود أذون صرف مسجلة عليه');
        }

        $sector->delete();

        return redirect()->route('sectors.index')->with('success', 'تم حذف القسم بنجاح');
    }
}
