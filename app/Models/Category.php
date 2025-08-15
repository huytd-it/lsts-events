<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Category extends Model
{
    use HasRoles;

    protected $fillable = [
        'category_name', 'category_description', 'is_public', 
        'parent_id', 'update_by', 'create_by'
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function users()
    {
        return $this->belongsToMany(
            User::class, 
            'category_user', 
            'category_id', 
            'user_email',
            'category_id',
            'email'
        );
    }
}
