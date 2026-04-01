<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rental extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable =['property_id','tenant_id','start_date','end_date','monthly_rent','deposit','status','lease_path'];

    public function property(){
        return $this->belongsTo(Property::class);
    }

    public function tenant(){
        return $this->belongsTo(Tenant::class);
    }

    public function payments(){
        return $this->hasMany(Payment::class);
    }
}
