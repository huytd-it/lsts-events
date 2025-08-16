<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Jetstream\HasTeams;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasRoles;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use HasTeams;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'role',
        'status'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean'
        ];
    }

    /**
     * Categories relationship through pivot table
     */
    public function categories()
    {
        return $this->belongsToMany(
            Category::class, 
            'category_user', 
            'user_email', 
            'category_id',
            'email',
            'category_id'
        )->whereNull('category_user.deleted_at');
    }

    /**
     * Events created by this user
     */
    public function createdEvents()
    {
        return $this->hasMany(Event::class, 'create_by')
                   ->whereNull('deleted_at');
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission($permission): bool
    {
        // Check if user is admin
        if ($this->is_admin || $this->hasRole('admin')) {
            return true;
        }

        // Check specific permissions
        return $this->hasPermissionTo($permission);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->hasRole('admin');
    }

    /**
     * Get user's permissions as array
     */
    public function getPermissionsList(): array
    {
        if ($this->isAdmin()) {
            return ['Event_Admin', 'Category_Admin', 'User_Admin'];
        }

        return $this->permissions->pluck('name')->toArray();
    }
}
