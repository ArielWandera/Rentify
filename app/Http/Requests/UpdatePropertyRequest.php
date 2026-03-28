<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => 'string|max:255',
            'description'     => 'nullable|string',
            'address'         => 'string',
            'price_per_month' => 'numeric|min:0',
            'bedrooms'        => 'integer|min:1',
            'bathrooms'       => 'integer|min:1',
            'owner_id'        => 'exists:users,id',
            'image'           => 'nullable|image|max:2048',
        ];
    }
}
