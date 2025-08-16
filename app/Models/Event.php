<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'event_id';
    
    protected $fillable = [
        'category_id', 'path', 'event_name', 'event_date', 'event_time',
        'location', 'description', 'update_by', 'create_by', 'order', 'is_big_event'
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_big_event' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $dates = ['deleted_at'];

    /**
     * Category relationship
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    /**
     * Event media relationship
     */
    public function media()
    {
        return $this->hasMany(EventMedia::class, 'event_id', 'event_id')
                   ->whereNull('deleted_at')
                   ->orderBy('order');
    }

    /**
     * Creator relationship
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'create_by');
    }

    /**
     * Scope for big events
     */
    public function scopeBigEvents($query)
    {
        return $query->where('is_big_event', true);
    }

    /**
     * Scope for upcoming events
     */
    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', today());
    }

    /**
     * Scope for events by category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }
}
