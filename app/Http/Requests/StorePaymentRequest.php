<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_paid'  => 'required|numeric|min:0',
            'type'         => 'required|in:rent,deposit,maintenance,other',
            'payment_date' => 'required|date',
            'notes'        => 'nullable|string|max:500',
        ];
    }
}
