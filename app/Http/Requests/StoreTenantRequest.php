<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                => 'required|string|max:255',
            'email'               => 'required|email|unique:users,email',
            'password'            => 'nullable|string|min:8',
            'phone'               => 'nullable|string|max:20',
            'date_of_birth'       => 'nullable|date',
            'outstanding_balance' => 'numeric|min:0',
        ];
    }
}
