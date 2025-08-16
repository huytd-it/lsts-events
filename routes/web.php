<?php

use Illuminate\Support\Facades\Route;

// Redirect all authentication routes to React SPA
Route::any('/login', function () {
    return view('app');
})->name('login');

Route::any('/register', function () {
    return view('app');
});

Route::any('/forgot-password', function () {
    return view('app');
});

Route::any('/reset-password/{token?}', function () {
    return view('app');
});

Route::any('/verify-email', function () {
    return view('app');
});

Route::any('/dashboard', function () {
    return view('app');
});

// Catch-all route for React SPA - must be last
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
