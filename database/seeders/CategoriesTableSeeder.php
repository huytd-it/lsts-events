<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'category_id' => 1,
                'category_name' => 'Technology',
                'category_description' => 'Tech events and conferences',
                'is_public' => true,
                'parent_id' => null,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 2,
                'category_name' => 'AI Conference',
                'category_description' => 'Artificial Intelligence conference',
                'is_public' => true,
                'parent_id' => 1,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 3,
                'category_name' => 'Web Development',
                'category_description' => 'Web development workshops',
                'is_public' => true,
                'parent_id' => 1,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 4,
                'category_name' => 'Arts & Culture',
                'category_description' => 'Art exhibitions and cultural events',
                'is_public' => true,
                'parent_id' => null,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 5,
                'category_name' => 'Music Festival',
                'category_description' => 'Annual music festival',
                'is_public' => true,
                'parent_id' => 4,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
