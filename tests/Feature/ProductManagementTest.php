<?php

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('the dashboard shows paginated local products', function () {
    Product::factory()->count(12)->create();

    $response = $this->get(route('products.index'));

    $response->assertOk();

    Assert::fromTestResponse($response)
        ->component('dashboard')
        ->has('products.data', 10)
        ->where('products.total', 12)
        ->where('products.current_page', 1)
        ->where('products.last_page', 2);
});

test('a product can be created', function () {
    $response = $this->post(route('products.store'), [
        'name' => 'Desk Lamp',
        'price' => 29.99,
        'stock' => 12,
        'description' => 'Soft light for evening work.',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'name' => 'Desk Lamp',
        'stock' => 12,
    ]);
});

test('product validation errors are returned when required fields are missing', function () {
    $response = $this->from(route('products.index'))
        ->post(route('products.store'), []);

    $response
        ->assertRedirect(route('products.index'))
        ->assertSessionHasErrors(['name', 'price', 'stock']);
});

test('a product can be updated', function () {
    $product = Product::factory()->create();

    $response = $this->put(route('products.update', $product), [
        'name' => 'Updated Product',
        'price' => 99.5,
        'stock' => 3,
        'description' => 'Updated description',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Product',
        'stock' => 3,
    ]);
});

test('a product can be deleted', function () {
    $product = Product::factory()->create();

    $this->delete(route('products.destroy', $product))
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseMissing('products', [
        'id' => $product->id,
    ]);
});

test('products can be synced from the fake store api', function () {
    Http::fake([
        'https://fakestoreapi.com/products' => Http::response([
            [
                'title' => 'Faux Jacket',
                'price' => 120.45,
                'description' => 'Warm and durable.',
                'rating' => ['count' => 9],
            ],
            [
                'title' => 'Canvas Bag',
                'price' => 44.10,
                'description' => 'Simple daily carry.',
                'rating' => ['count' => 14],
            ],
        ], 200),
    ]);

    $this->post(route('products.sync'))
        ->assertRedirect(route('products.index'))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('products', [
        'name' => 'Faux Jacket',
        'stock' => 9,
    ]);

    $this->assertDatabaseHas('products', [
        'name' => 'Canvas Bag',
        'stock' => 14,
    ]);
});

test('sync failure returns an error message instead of throwing', function () {
    Http::fake([
        'https://fakestoreapi.com/products' => Http::response(
            '<title>Just a moment...</title>',
            403,
            ['Content-Type' => 'text/html'],
        ),
    ]);

    $this->post(route('products.sync'))
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('error', 'Product sync failed because the external API rejected the request.');

    expect(Product::query()->count())->toBe(0);
});

test('the internal api returns local products as json', function () {
    $product = Product::factory()->create([
        'name' => 'API Product',
    ]);

    $this->getJson('/api/products')
        ->assertSuccessful()
        ->assertJsonCount(1)
        ->assertJsonFragment([
            'id' => $product->id,
            'name' => 'API Product',
        ]);
});
