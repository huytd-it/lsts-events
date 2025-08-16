<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Public endpoints
Route::get('public/categories', [CategoryController::class, 'index']);

// Protected routes with Sanctum authentication
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::get('check-session', [AuthController::class, 'checkSession']);
        Route::post('refresh-session', [AuthController::class, 'refreshSession']);
        Route::get('permissions', [AuthController::class, 'getPermissions']);
        Route::get('users', [AuthController::class, 'getUsers']);
    });

    // User info endpoint (Laravel convention)
    Route::get('user', [AuthController::class, 'user']);

    // Categories API - special routes first to avoid conflicts with resource routes
    Route::prefix('categories')->group(function () {
        Route::get('statistics', [CategoryController::class, 'statistics']);
        Route::get('tree', [CategoryController::class, 'tree']);
        Route::get('validate-tree', [CategoryController::class, 'validateTree']);
        Route::post('{id}/assign-users', [CategoryController::class, 'assignUsers']);
        Route::get('{id}/users', [CategoryController::class, 'getAssignedUsers']);
        Route::put('{id}/move', [CategoryController::class, 'move']);
    });
    Route::apiResource('categories', CategoryController::class);

    // Events API - special routes first to avoid conflicts with resource routes
    Route::prefix('events')->group(function () {
        Route::post('upload', [EventController::class, 'upload']);
        Route::get('years', [EventController::class, 'getYears']);
        Route::get('statistics', [EventController::class, 'statistics']);
        Route::post('import', [EventController::class, 'import']);
        Route::get('export', [EventController::class, 'export']);
        Route::get('{id}/media', [EventController::class, 'getEventMedia']);
    });
    Route::apiResource('events', EventController::class);

    // Event Media API - Commented out until EventMediaController is created
    // Route::prefix('event-media')->group(function () {
    //     Route::get('slides', [EventMediaController::class, 'getSlides']);
    //     Route::post('import', [EventMediaController::class, 'import']);
    //     Route::delete('{id}', [EventMediaController::class, 'delete']);
    //     Route::put('{id}/visibility', [EventMediaController::class, 'setVisibility']);
    //     Route::put('{id}/order', [EventMediaController::class, 'updateOrder']);
    //     Route::put('bulk-update', [EventMediaController::class, 'bulkUpdate']);
    // });
});

// Fallback route for API
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found'
    ], 404);
});
