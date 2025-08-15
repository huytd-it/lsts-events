<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventMediaTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('event_media')->insert([
            [
                'media_id' => 1,
                'event_id' => 1,
                'media_name' => 'AI Summit Keynote',
                'file_path' => '/storage/events/ai_summit_keynote.jpg',
                'order' => 1,
                'is_show' => true,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'media_id' => 2,
                'event_id' => 1,
                'media_name' => 'AI Summit Group Photo',
                'file_path' => '/storage/events/ai_summit_group.jpg',
                'order' => 2,
                'is_show' => true,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'media_id' => 3,
                'event_id' => 4,
                'media_name' => 'Music Festival Stage',
                'file_path' => '/storage/events/music_festival_stage.jpg',
                'order' => 1,
                'is_show' => true,
                'create_by' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
