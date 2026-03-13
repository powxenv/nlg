<?php

namespace App\Http\Controllers;

use App\Data\ProductData;
use App\Data\ProductPayloadData;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display the product dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'products' => ProductData::collect(
                Product::query()->latest()->paginate(10)->withQueryString()
            ),
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        Product::query()->create($request->getData()->all());

        return to_route('products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Update the specified product.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->getData()->all());

        return to_route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return to_route('products.index')->with('success', 'Product deleted successfully.');
    }

    /**
     * Sync products from the external API into the local database.
     */
    public function sync(): RedirectResponse
    {
        $syncedProducts = collect(
            Http::get('https://fakestoreapi.com/products')->throw()->json()
        )
            ->map(fn (array $product): ProductPayloadData => ProductPayloadData::fromExternal($product))
            ->each(function (ProductPayloadData $product): void {
                Product::query()->updateOrCreate(
                    ['name' => $product->name],
                    $product->all(),
                );
            })
            ->count();

        return to_route('products.index')->with(
            'success',
            "{$syncedProducts} products synced successfully.",
        );
    }

    /**
     * Return the local products in JSON format.
     */
    public function apiIndex(): JsonResponse
    {
        return response()->json(
            ProductData::collect(Product::query()->latest()->get())
        );
    }
}
