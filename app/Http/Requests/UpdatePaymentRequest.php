<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_paid'  => 'numeric|min:0',
            'type'         => 'in:rent,deposit,maintenance,other',
            'payment_date' => 'date',
            'notes'        => 'nullable|string|max:500',
            'status'       => 'in:pending,completed,failed',
        ];
    }
}
