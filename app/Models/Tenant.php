<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;
    protected $fillable = ['users','phone','date_of_birth'];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
