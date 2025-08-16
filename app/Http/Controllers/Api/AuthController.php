<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $credentials = $request->only('email', 'password');

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid username or password. Please try again.',
                    'errors' => [
                        'error' => 'Invalid credentials'
                    ]
                ], 401);
            }

            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            // Log successful login
            \Log::info("User logged in: {$user->email} at " . now());

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ],
                'redirect' => '/admin/events'
            ]);

        } catch (\Exception $e) {
            \Log::error("Login error: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'LOGIN ERROR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userEmail = $user->email ?? 'unknown';
            
            // Log logout
            \Log::info("User logging out: $userEmail at " . now());

            // Delete current access token
            if ($request->user() && $request->user()->currentAccessToken()) {
                $request->user()->currentAccessToken()->delete();
            }

            // Or revoke all tokens
            // $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
                'redirect' => '/login'
            ]);

        } catch (\Exception $e) {
            \Log::error("Logout error: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user info
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => $user,
                'user' => $user // For compatibility with frontend
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user info',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check session status
     */
    public function checkSession(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'logged_in' => false,
                    'message' => 'Not logged in',
                    'redirect' => '/logout'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'logged_in' => true,
                'user' => $user,
                'message' => 'Session is valid'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'logged_in' => false,
                'message' => 'Session check failed',
                'error' => $e->getMessage(),
                'redirect' => '/logout'
            ], 500);
        }
    }

    /**
     * Refresh session (keep alive)
     */
    public function refreshSession(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not logged in',
                    'redirect' => '/logout',
                    'expired' => true
                ], 401);
            }

            // Log refresh activity
            \Log::info("Session refreshed for user: {$user->email} at " . now());

            return response()->json([
                'success' => true,
                'message' => 'Session refreshed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh session',
                'error' => $e->getMessage(),
                'redirect' => '/logout'
            ], 500);
        }
    }

    /**
     * Get user permissions
     */
    public function getPermissions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No auth token found',
                    'redirect' => '/logout'
                ], 401);
            }

            // Get user permissions (implement based on your permission system)
            $permissions = $this->getUserPermissions($user);

            return response()->json([
                'success' => true,
                'data' => $permissions,
                'message' => 'Permissions retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users (admin only)
     */
    public function getUsers(Request $request): JsonResponse
    {
        try {
            // Check if user has admin permission
            if (!$this->hasPermission('User_Admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $query = User::query();

            // Add filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            $length = $request->get('length', 100);
            $users = $query->paginate($length);

            // Enhance user data with categories (if needed)
            foreach ($users->items() as $user) {
                try {
                    $user->categories = \DB::table('categories as C')
                        ->join('category_user as CU', 'C.category_id', '=', 'CU.category_id')
                        ->where('CU.user_email', $user->email)
                        ->whereNull('C.deleted_at')
                        ->whereNull('CU.deleted_at')
                        ->select('C.*')
                        ->get();
                } catch (\Exception $e) {
                    $user->categories = [];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'total' => $users->total(),
                'message' => 'Users retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user permissions (implement based on your permission system)
     */
    private function getUserPermissions($user): array
    {
        // This is a simple implementation
        // You should implement this based on your actual permission system
        
        $permissions = [];

        // Check if user is admin (example)
        if ($user->hasRole('admin') || $user->is_admin) {
            $permissions = ['Event_Admin', 'Category_Admin', 'User_Admin'];
        } else {
            // Regular user permissions
            $permissions = ['Event_View', 'Category_View'];
        }

        return $permissions;
    }

    /**
     * Check if user has permission
     */
    private function hasPermission($permission): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }

        // Implement your permission check logic here
        // This is a simple example
        if ($user->hasRole('admin') || $user->is_admin) {
            return true;
        }

        $permissions = $this->getUserPermissions($user);
        return in_array($permission, $permissions);
    }
}