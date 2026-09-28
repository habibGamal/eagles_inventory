<?php

namespace Database\Seeders;

use App\Models\ItemCategory;
use Illuminate\Database\Seeder;

class ItemCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'المواد الغذائية والتموينية',
                'is_active' => true,
                'children' => [
                    ['name' => 'منتجات الألبان والأجبان', 'is_active' => true],
                    ['name' => 'الحبوب والزيوت والمواد الجافة', 'is_active' => true],
                    ['name' => 'اللحوم والدواجن والأسماك المجمدة', 'is_active' => true],
                    ['name' => 'المشروبات والعصائر والقهوة', 'is_active' => true],
                ],
            ],
            [
                'name' => 'أدوات النظافة ومواد التعقيم',
                'is_active' => true,
                'children' => [
                    ['name' => 'المنظفات الكيميائية والمطهرات', 'is_active' => true],
                    ['name' => 'الورقيات ومستهلكات النظافة', 'is_active' => true],
                    ['name' => 'أدوات ومعدات التنظيف', 'is_active' => true],
                ],
            ],
            [
                'name' => 'المعدات وقطع الغيار الكهربائية',
                'is_active' => true,
                'children' => [
                    ['name' => 'المفاتيح والقواطع الكهربائية', 'is_active' => true],
                    ['name' => 'وحدات الإنارة والكشافات', 'is_active' => true],
                    ['name' => 'الكابلات والأسلاك والتمديدات', 'is_active' => true],
                ],
            ],
            [
                'name' => 'الأدوات والمستلزمات المكتبية',
                'is_active' => true,
                'children' => [
                    ['name' => 'أوراق الطباعة والمطبوعات الرسمية', 'is_active' => true],
                    ['name' => 'الأحبار ومستلزمات الطابعات', 'is_active' => true],
                    ['name' => 'القرطاسية والملفات الإدارية', 'is_active' => true],
                ],
            ],
            [
                'name' => 'أصناف مشاريع سابقة (موقوفة)',
                'is_active' => false,
                'children' => [],
            ],
        ];

        foreach ($categories as $parentData) {
            $parent = ItemCategory::updateOrCreate(
                ['name' => $parentData['name']],
                [
                    'parent_id' => null,
                    'is_active' => $parentData['is_active'],
                ]
            );

            foreach ($parentData['children'] as $childData) {
                ItemCategory::updateOrCreate(
                    ['name' => $childData['name']],
                    [
                        'parent_id' => $parent->id,
                        'is_active' => $childData['is_active'],
                    ]
                );
            }
        }
    }
}
