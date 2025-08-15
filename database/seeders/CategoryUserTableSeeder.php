<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryUserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, create a sample user if not exists
        $user = DB::table('users')->where('email', 'user@example.com')->first();
        if (!$user) {
            $userId = DB::table('users')->insertGetId([
                'name' => 'Sample User',
                'email' => 'user@example.com',
                'password' => bcrypt('password'),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            $userId = $user->id;
        }
        
        // Then, assign categories to the user
        DB::table('category_user')->insert([
            [
                'category_id' => 1,
                'user_email' => 'user@example.com'
            ],
            [
                'category_id' => 4,
                'user_email' => 'user@example.com'
            ]
        ]);
    }
}
