<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['rental_id','amount_paid','type','status','notes','payment_date','pesapal_tracking_id'];

    public function rental(){
        return $this->belongsTo(Rental::class);
    }
}
