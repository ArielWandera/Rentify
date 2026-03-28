<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id'  => 'required|exists:properties,id',
            'tenant_id'    => 'required|exists:tenants,id',
            'start_date'   => 'required|date',
            'end_date'     => 'nullable|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit'      => 'numeric|min:0',
            'status'       => 'required|in:active,pending,terminated',
        ];
    }
}
