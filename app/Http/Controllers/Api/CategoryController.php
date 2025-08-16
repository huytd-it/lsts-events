<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use App\Models\CategoryUser;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->whereNull('deleted_at');

        // Add events count and users count
        $query->withCount(['events' => function($q) {
            $q->whereNull('deleted_at');
        }]);

        $query->withCount(['categoryUsers' => function($q) {
            $q->whereNull('deleted_at');
        }]);

        // Search filter
        if ($request->has('search') && $request->search) {
            $query->where('category_name', 'like', '%' . $request->search . '%');
        }

        // Category user filter
        if ($request->has('category_user_email')) {
            $query->leftJoin('category_user as cu', function($join) use ($request) {
                $join->on('categories.category_id', '=', 'cu.category_id')
                     ->where('cu.user_email', $request->category_user_email)
                     ->whereNull('cu.deleted_at');
            })->select('categories.*', 'cu.category_user_id');
        }

        // User email filter (shows assigned categories or public ones)
        if ($request->has('user_email')) {
            $query->leftJoin('category_user as cu2', function($join) {
                $join->on('categories.category_id', '=', 'cu2.category_id')
                     ->whereNull('cu2.deleted_at');
            })
            ->where(function($q) use ($request) {
                $q->where('cu2.user_email', $request->user_email)
                  ->orWhere('categories.is_public', 1);
            })
            ->select('categories.*', 'cu2.category_user_id');
        }

        $categories = $query->orderBy('category_name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'total' => $categories->count()
        ]);
    }

    /**
     * Store a newly created category
     */
    public function store(CategoryRequest $request): JsonResponse
    {
        try {
            // Check if category name already exists
            $existing = Category::whereNull('deleted_at')
                ->where('category_name', 'like', $request->category_name)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Category name already exists'
                ], 400);
            }

            // Validate parent category if provided
            if ($request->parent_id) {
                $parent = Category::whereNull('deleted_at')
                    ->find($request->parent_id);
                
                if (!$parent) {
                    return response()->json([
                        'success' => false,
                        'msg' => 'Parent category not found'
                    ], 404);
                }
            }

            $category = Category::create([
                'category_name' => $request->category_name,
                'category_description' => $request->category_description,
                'is_public' => $request->is_public ? 1 : 0,
                'parent_id' => $request->parent_id,
                'create_by' => Auth::id() . ' - ' . Auth::user()->name ?? 'System'
            ]);

            return response()->json([
                'success' => true,
                'data' => $category,
                'msg' => 'Category created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error creating category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category
     */
    public function show($id): JsonResponse
    {
        $category = Category::whereNull('deleted_at')
            ->withCount(['events' => function($q) {
                $q->whereNull('deleted_at');
            }])
            ->withCount(['categoryUsers' => function($q) {
                $q->whereNull('deleted_at');
            }])
            ->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'msg' => 'Category not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified category
     */
    public function update(CategoryRequest $request, $id): JsonResponse
    {
        try {
            $category = Category::whereNull('deleted_at')->find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Category not found'
                ], 404);
            }

            // Check if category name already exists (excluding current category)
            $existing = Category::whereNull('deleted_at')
                ->where('category_name', 'like', $request->category_name)
                ->where('category_id', '!=', $id)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Category name already exists'
                ], 400);
            }

            $category->update([
                'category_name' => $request->category_name,
                'category_description' => $request->category_description,
                'is_public' => $request->is_public ? 1 : 0,
                'parent_id' => $request->parent_id,
                'update_by' => Auth::id() . ' - ' . Auth::user()->name ?? 'System'
            ]);

            return response()->json([
                'success' => true,
                'data' => $category->fresh(),
                'msg' => 'Category updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error updating category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category
     */
    public function destroy($id): JsonResponse
    {
        try {
            $category = Category::whereNull('deleted_at')->find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Category not found'
                ], 404);
            }

            // Soft delete
            $category->update(['deleted_at' => now()]);

            return response()->json([
                'success' => true,
                'msg' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error deleting category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $totalCategories = Category::whereNull('deleted_at')->count();
            $publicCategories = Category::whereNull('deleted_at')
                ->where('is_public', 1)->count();
            $privateCategories = $totalCategories - $publicCategories;
            $assignedUsers = CategoryUser::distinct('user_email')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_categories' => $totalCategories,
                    'public_categories' => $publicCategories,
                    'private_categories' => $privateCategories,
                    'assigned_users' => $assignedUsers
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error getting statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category tree structure
     */
    public function tree(Request $request): JsonResponse
    {
        try {
            $query = Category::whereNull('deleted_at');

            if ($request->has('exclude_id')) {
                $query->where('category_id', '!=', $request->exclude_id);
            }

            if ($request->has('search')) {
                $query->where('category_name', 'like', '%' . $request->search . '%');
            }

            $categories = $query->withCount(['events' => function($q) {
                    $q->whereNull('deleted_at');
                }])
                ->withCount(['categoryUsers' => function($q) {
                    $q->whereNull('deleted_at');
                }])
                ->orderBy('category_name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error loading categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign users to category
     */
    public function assignUsers(Request $request, $id): JsonResponse
    {
        try {
            $category = Category::whereNull('deleted_at')->find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Category not found'
                ], 404);
            }

            $request->validate([
                'user_emails' => 'required|array',
                'user_emails.*' => 'email'
            ]);

            DB::beginTransaction();

            // Soft delete existing assignments
            CategoryUser::where('category_id', $id)
                ->update(['deleted_at' => now()]);

            // Add new assignments
            foreach ($request->user_emails as $email) {
                $existing = CategoryUser::where('category_id', $id)
                    ->where('user_email', $email)
                    ->first();

                if ($existing) {
                    $existing->update(['deleted_at' => null]);
                } else {
                    CategoryUser::create([
                        'category_id' => $id,
                        'user_email' => $email
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'msg' => 'User assignments updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'msg' => 'Error updating user assignments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get assigned users for category
     */
    public function getAssignedUsers($id): JsonResponse
    {
        $users = CategoryUser::where('category_id', $id)
            ->whereNull('deleted_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Move category to different parent
     */
    public function move(Request $request, $id): JsonResponse
    {
        try {
            $category = Category::whereNull('deleted_at')->find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Category not found'
                ], 404);
            }

            if ($request->parent_id) {
                $parent = Category::whereNull('deleted_at')->find($request->parent_id);
                if (!$parent) {
                    return response()->json([
                        'success' => false,
                        'msg' => 'Parent category not found'
                    ], 404);
                }

                // Prevent circular reference
                if ($this->wouldCreateCircularReference($id, $request->parent_id)) {
                    return response()->json([
                        'success' => false,
                        'msg' => 'Cannot move category to itself or its descendants'
                    ], 400);
                }
            }

            $category->update([
                'parent_id' => $request->parent_id,
                'update_by' => Auth::id() . ' - ' . Auth::user()->name ?? 'System'
            ]);

            return response()->json([
                'success' => true,
                'msg' => 'Category moved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error moving category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for circular reference in category hierarchy
     */
    private function wouldCreateCircularReference($categoryId, $newParentId): bool
    {
        $descendants = $this->getCategoryDescendants($categoryId);
        return in_array($newParentId, $descendants);
    }

    /**
     * Get all descendants of a category
     */
    private function getCategoryDescendants($categoryId): array
    {
        $descendants = [];
        $children = Category::where('parent_id', $categoryId)
            ->whereNull('deleted_at')
            ->pluck('category_id')
            ->toArray();

        foreach ($children as $childId) {
            $descendants[] = $childId;
            $descendants = array_merge($descendants, $this->getCategoryDescendants($childId));
        }

        return $descendants;
    }
}
