<?php

namespace App\Data;

use Spatie\LaravelData\Resource;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ProductData extends Resource
{
    public function __construct(
        public int $id,
        public string $name,
        public float $price,
        public int $stock,
        public ?string $description,
    ) {}
}
