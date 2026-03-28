<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone'               => 'nullable|string|max:20',
            'date_of_birth'       => 'nullable|date',
            'outstanding_balance' => 'numeric|min:0',
        ];
    }
}
