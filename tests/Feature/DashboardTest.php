<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit the dashboard', function () {
    $response = $this->get(route('products.index'));

    $response->assertOk();

    Assert::fromTestResponse($response)
        ->component('dashboard');
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get(route('products.index'));

    $response->assertOk();

    Assert::fromTestResponse($response)
        ->component('dashboard');
});
