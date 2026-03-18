<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;
    protected $fillable = ['rental_id','amount_paid','type','status','notes','payment_date'];

    public function rental(){
        return $this->belongsTo(Rental::class);
    }
}
