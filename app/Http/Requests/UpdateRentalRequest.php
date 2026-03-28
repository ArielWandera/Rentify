<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date'   => 'date',
            'end_date'     => 'nullable|date|after:start_date',
            'monthly_rent' => 'numeric|min:0',
            'deposit'      => 'numeric|min:0',
            'status'       => 'in:active,pending,terminated',
        ];
    }
}
