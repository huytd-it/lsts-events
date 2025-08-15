<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('events')
            ->whereNull('deleted_at')
            ->where('is_public', 1)
            ->whereNull('parent_id')
            ->with(['children' => function($query) {
                $query->withCount('events')
                      ->where('is_public', 1)
                      ->with('children');
            }])
            ->get();

        return CategoryResource::collection($categories);
    }

    public function show(Category $category)
    {
        $category->loadCount('events');
        return new CategoryResource($category);
    }
}
