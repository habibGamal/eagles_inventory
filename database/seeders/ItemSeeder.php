<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (ItemCategory::count() === 0) {
            $this->call(ItemCategorySeeder::class);
        }

        if (Unit::count() === 0) {
            $this->call(UnitSeeder::class);
        }

        $items = [
            [
                'name' => 'أرز بسمتي هندي كلاسيك عنبر 40 كجم',
                'category_name' => 'الحبوب والزيوت والمواد الجافة',
                'unit_symbol' => 'كرتون',
                'description' => 'أرز أبيض بسمتي حبة طويلة ممتاز مخصص للاستخدام الفندقي والمطاعم',
                'minimum_stock' => 20.000,
                'is_active' => true,
            ],
            [
                'name' => 'زيت نباتي نقي للقلي والطهي 1.5 لتر',
                'category_name' => 'الحبوب والزيوت والمواد الجافة',
                'unit_symbol' => 'كرتون',
                'description' => 'كرتون يحتوي على 6 عبوات سعة 1.5 لتر زيت ذرة نقي عالي الجودة',
                'minimum_stock' => 35.000,
                'is_active' => true,
            ],
            [
                'name' => 'حليب طازج طويل الأجل كامل الدسم 1 لتر',
                'category_name' => 'منتجات الألبان والأجبان',
                'unit_symbol' => 'كرتون',
                'description' => 'كرتون يحتوي على 12 عبوة حليب معقم بدرجة حرارة فائقة UHT',
                'minimum_stock' => 50.000,
                'is_active' => true,
            ],
            [
                'name' => 'جبن موزاريلا مبشور إيطالي 2 كجم',
                'category_name' => 'منتجات الألبان والأجبان',
                'unit_symbol' => 'كجم',
                'description' => 'جبن موزاريلا طبيعي 100% مبشور للبيتزا والمخبوزات الساخنة',
                'minimum_stock' => 30.000,
                'is_active' => true,
            ],
            [
                'name' => 'صدور دجاج طرية مجمدة بدون عظم 2 كجم',
                'category_name' => 'اللحوم والدواجن والأسماك المجمدة',
                'unit_symbol' => 'كرتون',
                'description' => 'كرتون 6 أكياس زنة 2 كجم صدور دجاج مجمدة فرز أول معتمدة',
                'minimum_stock' => 25.000,
                'is_active' => true,
            ],
            [
                'name' => 'بن قهوة عربي هرري درجة أولى 5 كجم',
                'category_name' => 'المشروبات والعصائر والقهوة',
                'unit_symbol' => 'كجم',
                'description' => 'حبوب بن أخضر هرري منتقى بعناية ومحمص للضيافة الرسمية',
                'minimum_stock' => 15.000,
                'is_active' => true,
            ],
            [
                'name' => 'سائل غسيل أطباق مركز برائحة الليمون 5 لتر',
                'category_name' => 'المنظفات الكيميائية والمطهرات',
                'unit_symbol' => 'جالون',
                'description' => 'منظف دهون قوي التركيز لغسيل الأواني والمعدات في المطابخ المركزية',
                'minimum_stock' => 15.000,
                'is_active' => true,
            ],
            [
                'name' => 'مطهر ومعقم أرضيات برائحة اللافندر 4 لتر',
                'category_name' => 'المنظفات الكيميائية والمطهرات',
                'unit_symbol' => 'جالون',
                'description' => 'مطهر كيميائي عالي التركيز للأرضيات والأسطح والمرافق الصحية',
                'minimum_stock' => 20.000,
                'is_active' => true,
            ],
            [
                'name' => 'مناديل رول تنشيف يدوي وسحب فندقي',
                'category_name' => 'الورقيات ومستهلكات النظافة',
                'unit_symbol' => 'كرتون',
                'description' => 'كرتون 6 رولات ورقية سميكة ثنائية الطبقات للمطابخ ودورات المياه',
                'minimum_stock' => 40.000,
                'is_active' => true,
            ],
            [
                'name' => 'أكياس نفايات متينة سعة 50 جالون أسود',
                'category_name' => 'الورقيات ومستهلكات النظافة',
                'unit_symbol' => 'طرد',
                'description' => 'طرد 50 كيس نفايات عالي الكثافة ومقاوم للتمزق والتسرب',
                'minimum_stock' => 30.000,
                'is_active' => true,
            ],
            [
                'name' => 'قاطع تيار كهربائي ثلاثي الأقطاب 63 أمبير Schneider',
                'category_name' => 'المفاتيح والقواطع الكهربائية',
                'unit_symbol' => 'حبة',
                'description' => 'قاطع أوتوماتيكي ثلاثي الطور لحماية اللوحات الكهربائية الرئيسية',
                'minimum_stock' => 10.000,
                'is_active' => true,
            ],
            [
                'name' => 'لمبة ليد كروية موفرة للطاقة 12 واط E27',
                'category_name' => 'وحدات الإنارة والكشافات',
                'unit_symbol' => 'حبة',
                'description' => 'إضاءة ليد فندقية دافئة 3000 كلفن وقاعدة E27 بعمر 25000 ساعة',
                'minimum_stock' => 100.000,
                'is_active' => true,
            ],
            [
                'name' => 'كشاف ليد خارجي مقاوم للعوامل الجوية 100 واط IP66',
                'category_name' => 'وحدات الإنارة والكشافات',
                'unit_symbol' => 'حبة',
                'description' => 'كشاف إضاءة غاطس ومقاوم للأتربة والأمطار للواجهات والمواقف',
                'minimum_stock' => 12.000,
                'is_active' => true,
            ],
            [
                'name' => 'سلك نحاس معزول 4 ملم لفة 100 متر أزرق',
                'category_name' => 'الكابلات والأسلاك والتمديدات',
                'unit_symbol' => 'لفة',
                'description' => 'أسلاك نحاسية نقية 100% معتمدة للمباني السكنية والخدمية',
                'minimum_stock' => 15.000,
                'is_active' => true,
            ],
            [
                'name' => 'ورق تصوير وطباعة ليزر A4 وزن 80 جم كرتون',
                'category_name' => 'أوراق الطباعة والمطبوعات الرسمية',
                'unit_symbol' => 'كرتون',
                'description' => 'كرتون 5 رزم (2500 ورقة) أبيض ناصع عالي الجودة للطباعة والتصوير',
                'minimum_stock' => 30.000,
                'is_active' => true,
            ],
            [
                'name' => 'حبر طابعة ليزر أسود HP LaserJet 85A أصلي',
                'category_name' => 'الأحبار ومستلزمات الطابعات',
                'unit_symbol' => 'حبة',
                'description' => 'خرطوشة حبر ليزر أصلية سعة 1600 صفحة للطابعات الإدارية',
                'minimum_stock' => 8.000,
                'is_active' => true,
            ],
            [
                'name' => 'ملف حفظ مستندات بلاستيكي عريض بوكس 7 سم أزرق',
                'category_name' => 'القرطاسية والملفات الإدارية',
                'unit_symbol' => 'درزن',
                'description' => 'ملفات أرشيفية متينة بحلقات معدنية رافعة لحفظ المستندات والسجلات',
                'minimum_stock' => 15.000,
                'is_active' => true,
            ],
            [
                'name' => 'صنف خراطيش حبر طابعات نفاثة قديمة (موقوف)',
                'category_name' => 'الأحبار ومستلزمات الطابعات',
                'unit_symbol' => 'حبة',
                'description' => 'صنف موقوف تم استبداله بطابعات ليزر حديثة',
                'minimum_stock' => 0.000,
                'is_active' => false,
            ],
        ];

        foreach ($items as $itemData) {
            $category = ItemCategory::where('name', $itemData['category_name'])->first();
            $unit = Unit::where('symbol', $itemData['unit_symbol'])->first();

            if (! $category || ! $unit) {
                continue;
            }

            Item::updateOrCreate(
                ['name' => $itemData['name']],
                [
                    'category_id' => $category->id,
                    'unit_id' => $unit->id,
                    'description' => $itemData['description'],
                    'minimum_stock' => $itemData['minimum_stock'],
                    'is_active' => $itemData['is_active'],
                ]
            );
        }
    }
}
