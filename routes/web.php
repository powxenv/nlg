<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/products')->name('home');
Route::resource('products', ProductController::class)->only([
    'index',
    'store',
    'update',
    'destroy',
]);
Route::post('products/sync', [ProductController::class, 'sync'])->name('products.sync');
