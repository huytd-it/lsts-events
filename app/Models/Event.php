<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'category_id', 'path', 'event_name', 'event_date', 
        'description', 'update_by', 'create_by', 'order', 'is_big_event'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function media()
    {
        return $this->hasMany(EventMedia::class)->orderBy('order');
    }
}
