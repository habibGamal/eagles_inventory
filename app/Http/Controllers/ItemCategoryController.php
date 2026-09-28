<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemCategoryController extends Controller
{
    /**
     * Display a listing of item categories.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = ItemCategory::query()
            ->with('parent:id,name')
            ->withCount(['children', 'items'])
            ->when($search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest('id');

        $categories = $query->paginate(10)->withQueryString();

        $parentOptions = ItemCategory::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => ItemCategory::count(),
            'active' => ItemCategory::where('is_active', true)->count(),
            'main_categories' => ItemCategory::whereNull('parent_id')->count(),
        ];

        return Inertia::render('item-categories/index', [
            'categories' => $categories,
            'parentOptions' => $parentOptions,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:item_categories,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        ItemCategory::create([
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('item-categories.index')->with('success', 'تم إنشاء التصنيف بنجاح');
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, ItemCategory $itemCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:item_categories,id', 'not_in:'.$itemCategory->id],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $itemCategory->update([
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('item-categories.index')->with('success', 'تم تحديث بيانات التصنيف بنجاح');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(ItemCategory $itemCategory): RedirectResponse
    {
        if ($itemCategory->children()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف هذا التصنيف لوجود تصنيفات فرعية تابعة له');
        }

        if ($itemCategory->items()->exists()) {
            return redirect()->back()->with('error', 'لا يمكن حذف هذا التصنيف لوجود أصناف مخزنية مسجلة تحته');
        }

        $itemCategory->delete();

        return redirect()->route('item-categories.index')->with('success', 'تم حذف التصنيف بنجاح');
    }
}
