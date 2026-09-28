<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = [
            [
                'name' => 'إبراهيم ناصر السعيد',
                'department' => 'قسم التكييف والتهوية',
                'is_active' => true,
            ],
            [
                'name' => 'سعود عبدالعزيز المالكي',
                'department' => 'قسم الأعمال الكهربائية والإنارة',
                'is_active' => true,
            ],
            [
                'name' => 'عبدالعزيز محمد الشهري',
                'department' => 'فندق إيجلز بالاس - الرياض',
                'is_active' => true,
            ],
            [
                'name' => 'ماجد عبدالله العنزي',
                'department' => 'مطبخ الإعاشة المركزي',
                'is_active' => true,
            ],
            [
                'name' => 'طارق حامد الزهراني',
                'department' => 'قسم النظافة والخدمات المساندة',
                'is_active' => true,
            ],
            [
                'name' => 'ياسر فهد البلوي',
                'department' => 'إدارة تقنية المعلومات والاتصالات',
                'is_active' => true,
            ],
            [
                'name' => 'عمر سالم باوزير',
                'department' => 'مطعم الديوان التراثي',
                'is_active' => true,
            ],
            [
                'name' => 'بدر ناصر العسيري',
                'department' => 'إدارة الأمن والسلامة المهنية',
                'is_active' => true,
            ],
            [
                'name' => 'هند سليمان التميمي',
                'department' => 'إدارة الموارد البشرية والشؤون الإدارية',
                'is_active' => true,
            ],
            [
                'name' => 'سلطان مبارك الخالدي',
                'department' => 'المستودع المركزي',
                'is_active' => false,
            ],
        ];

        foreach ($employees as $employee) {
            Employee::updateOrCreate(
                ['name' => $employee['name']],
                $employee
            );
        }
    }
}
