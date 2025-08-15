<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventMedia extends Model
{
    protected $fillable = [
        'order', 'media_name', 'file_path', 'event_id', 
        'is_show', 'update_by', 'create_by'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
