<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'address'         => 'required|string',
            'price_per_month' => 'required|numeric|min:0',
            'bedrooms'        => 'required|integer|min:1',
            'bathrooms'       => 'required|integer|min:1',
            'owner_id'        => ['required', Rule::exists('users', 'id')->where('role', 'owner')],
            'image'           => 'nullable|image|max:2048',
        ];
    }
}
