<?php

namespace App\Http\Controllers;

use App\Data\ProductData;
use App\Data\ProductPayloadData;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Client\ConnectionException;
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
        try {
            $response = Http::acceptJson()
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (compatible; nlg-test/1.0; +https://nlg-test.azurewebsites.net)',
                    'Accept-Language' => 'en-US,en;q=0.9',
                    'Referer' => config('app.url'),
                ])
                ->timeout(15)
                ->get('https://fakestoreapi.com/products');
        } catch (ConnectionException) {
            return to_route('products.index')->with(
                'error',
                'Product sync failed because the external API could not be reached.',
            );
        }

        if (! $response->successful()) {
            return to_route('products.index')->with(
                'error',
                'Product sync failed because the external API rejected the request.',
            );
        }

        $products = $response->json();

        if (! \is_array($products)) {
            return to_route('products.index')->with(
                'error',
                'Product sync failed because the external API returned invalid data.',
            );
        }

        $syncedProducts = collect($products)
            ->map(ProductPayloadData::fromExternal(...))
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
