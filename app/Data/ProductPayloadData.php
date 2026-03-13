<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ProductPayloadData extends Data
{
    public function __construct(
        public string $name,
        public float $price,
        public int $stock,
        public ?string $description,
    ) {}

    /**
     * Create a payload from the fake store API response.
     *
     * @param  array<string, mixed>  $product
     */
    public static function fromExternal(array $product): self
    {
        $description = data_get($product, 'description');

        return new self(
            name: trim((string) data_get($product, 'title')),
            price: round((float) data_get($product, 'price', 0), 2),
            stock: max((int) data_get($product, 'rating.count', 0), 0),
            description: blank($description) ? null : (string) $description,
        );
    }
}
