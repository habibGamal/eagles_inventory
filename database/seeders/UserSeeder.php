<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'عبدالرحمن بن خالد (مدير النظام)',
                'email' => 'admin@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'سعود السبيعي (مدير إدارة المستودعات)',
                'email' => 's.subaie@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'فهد المنصور (مسؤول التوريد والمشتريات)',
                'email' => 'f.mansoor@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'عبدالله القحطاني (أمين مستودع الرياض)',
                'email' => 'a.qahtani@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'محمد العتيبي (أمين مستودع جدة)',
                'email' => 'm.otaibi@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'نورة الدوسري (مراقب جرد وتدقيق مخزني)',
                'email' => 'n.dosari@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'خالد الزهراني (مشرف صرف وتشغيل)',
                'email' => 'k.zahrani@eagles.sa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'مستخدم تجريبي للنظام',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}
