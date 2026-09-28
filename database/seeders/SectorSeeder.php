<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hierarchy = [
            [
                'name' => 'قطاع الضيافة والفنادق',
                'is_active' => true,
                'children' => [
                    ['name' => 'فندق إيجلز بالاس - الرياض', 'is_active' => true],
                    ['name' => 'فندق أجنحة النخيل - جدة', 'is_active' => true],
                    ['name' => 'منتجع شاطئ الغروب - الخبر', 'is_active' => true],
                ],
            ],
            [
                'name' => 'قطاع المطاعم والإعاشة',
                'is_active' => true,
                'children' => [
                    ['name' => 'مطبخ الإعاشة المركزي', 'is_active' => true],
                    ['name' => 'مطعم الديوان التراثي', 'is_active' => true],
                    ['name' => 'سلسلة مقاهي إيجلز كافيه', 'is_active' => true],
                ],
            ],
            [
                'name' => 'قطاع التشغيل والصيانة',
                'is_active' => true,
                'children' => [
                    ['name' => 'قسم التكييف والتهوية', 'is_active' => true],
                    ['name' => 'قسم الأعمال الكهربائية والإنارة', 'is_active' => true],
                    ['name' => 'قسم النظافة والخدمات المساندة', 'is_active' => true],
                ],
            ],
            [
                'name' => 'الإدارة العامة والخدمات المشتركة',
                'is_active' => true,
                'children' => [
                    ['name' => 'إدارة تقنية المعلومات والاتصالات', 'is_active' => true],
                    ['name' => 'إدارة الأمن والسلامة المهنية', 'is_active' => true],
                    ['name' => 'إدارة الموارد البشرية والشؤون الإدارية', 'is_active' => true],
                ],
            ],
            [
                'name' => 'مشروع توسعة المجمع الجنوبي (متوقف)',
                'is_active' => false,
                'children' => [],
            ],
        ];

        foreach ($hierarchy as $parentData) {
            $parent = Sector::updateOrCreate(
                ['name' => $parentData['name']],
                [
                    'parent_id' => null,
                    'is_active' => $parentData['is_active'],
                ]
            );

            foreach ($parentData['children'] as $childData) {
                Sector::updateOrCreate(
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
