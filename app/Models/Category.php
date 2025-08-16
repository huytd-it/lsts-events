<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class Category extends Model
{
    use HasRoles, SoftDeletes;

    protected $primaryKey = 'category_id';
    
    protected $fillable = [
        'category_name', 
        'category_description', 
        'is_public', 
        'parent_id', 
        'update_by', 
        'create_by'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $dates = ['deleted_at'];

    /**
     * Parent category relationship
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id', 'category_id')
                   ->whereNull('deleted_at');
    }

    /**
     * Children categories relationship
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id', 'category_id')
                   ->whereNull('deleted_at');
    }

    /**
     * Events relationship
     */
    public function events()
    {
        return $this->hasMany(Event::class, 'category_id', 'category_id')
                   ->whereNull('deleted_at');
    }

    /**
     * Category users relationship (pivot table)
     */
    public function categoryUsers()
    {
        return $this->hasMany(CategoryUser::class, 'category_id', 'category_id')
                   ->whereNull('deleted_at');
    }

    /**
     * Users relationship through pivot table
     */
    public function users()
    {
        return $this->belongsToMany(
            User::class, 
            'category_user', 
            'category_id', 
            'user_email',
            'category_id',
            'email'
        )->whereNull('category_user.deleted_at');
    }

    /**
     * Scope for public categories
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for private categories
     */
    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    /**
     * Scope for root categories (no parent)
     */
    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get all descendants of this category
     */
    public function descendants()
    {
        $descendants = collect();
        
        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants());
        }
        
        return $descendants;
    }

    /**
     * Get all ancestors of this category
     */
    public function ancestors()
    {
        $ancestors = collect();
        $parent = $this->parent;
        
        while ($parent) {
            $ancestors->push($parent);
            $parent = $parent->parent;
        }
        
        return $ancestors;
    }

    /**
     * Check if this category is a descendant of given category
     */
    public function isDescendantOf(Category $category): bool
    {
        return $this->ancestors()->contains('category_id', $category->category_id);
    }

    /**
     * Check if this category is an ancestor of given category
     */
    public function isAncestorOf(Category $category): bool
    {
        return $this->descendants()->contains('category_id', $category->category_id);
    }

    /**
     * Get the full path of the category (breadcrumb style)
     */
    public function getFullPathAttribute(): string
    {
        $path = collect([$this->category_name]);
        $parent = $this->parent;
        
        while ($parent) {
            $path->prepend($parent->category_name);
            $parent = $parent->parent;
        }
        
        return $path->implode(' > ');
    }

    /**
     * Get the depth level of this category
     */
    public function getDepthAttribute(): int
    {
        return $this->ancestors()->count();
    }
}
