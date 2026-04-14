<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = ['property_id', 'unit_number', 'floor', 'bedrooms', 'bathrooms', 'price_per_month'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function isOccupied(): bool
    {
        return $this->rentals()->where('status', 'active')->exists();
    }
}
