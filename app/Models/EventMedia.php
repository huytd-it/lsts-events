<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventMedia extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'media_id';
    
    protected $fillable = [
        'order', 'media_name', 'file_path', 'event_id', 
        'is_show', 'update_by', 'create_by'
    ];

    protected $casts = [
        'is_show' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $dates = ['deleted_at'];

    /**
     * Event relationship
     */
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    /**
     * Scope for visible media
     */
    public function scopeVisible($query)
    {
        return $query->where('is_show', true);
    }

    /**
     * Scope for hidden media
     */
    public function scopeHidden($query)
    {
        return $query->where('is_show', false);
    }
}
