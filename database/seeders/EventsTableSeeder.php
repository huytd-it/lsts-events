<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('events')->insert([
            [
                'event_id' => 1,
                'category_id' => 2,
                'event_name' => 'AI Summit 2025',
                'event_date' => '2025-10-15',
                'description' => 'Annual AI summit with leading experts',
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'event_id' => 2,
                'category_id' => 2,
                'event_name' => 'Machine Learning Workshop',
                'event_date' => '2025-11-20',
                'description' => 'Hands-on ML workshop for beginners',
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'event_id' => 3,
                'category_id' => 3,
                'event_name' => 'React Development Masterclass',
                'event_date' => '2025-09-25',
                'description' => 'Advanced React development techniques',
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'event_id' => 4,
                'category_id' => 5,
                'event_name' => 'Summer Music Festival',
                'event_date' => '2025-07-10',
                'description' => '3-day music festival with top artists',
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
