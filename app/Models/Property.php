<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['name','description','address','price_per_month','bedrooms','bathrooms','owner_id'];

    public function owner(){
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function rentals(){
        return $this->hasMany(Rental::class);
    }

    public function units(){
        return $this->hasMany(Unit::class);
    }

    public function isAvailable(): bool
    {
        // If property has units, available = at least one unit is unoccupied
        if ($this->units()->exists()) {
            return $this->units()->whereDoesntHave('rentals', fn($q) => $q->where('status', 'active'))->exists();
        }
        // Single-unit property: available = no active rental
        return !$this->rentals()->where('status', 'active')->exists();
    }
}
