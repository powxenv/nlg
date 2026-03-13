<?php

namespace App\Http\Requests;

use App\Data\ProductPayloadData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Spatie\LaravelData\WithData;

class ProductRequest extends FormRequest
{
    use WithData;

    protected string $dataClass = ProductPayloadData::class;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom validation messages for the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter a product name.',
            'price.required' => 'Please enter a product price.',
            'price.numeric' => 'The product price must be a valid number.',
            'price.min' => 'The product price must be at least 0.',
            'stock.required' => 'Please enter the available stock.',
            'stock.integer' => 'The stock must be a whole number.',
            'stock.min' => 'The stock must be at least 0.',
            'description.string' => 'The description must be plain text.',
        ];
    }
}
