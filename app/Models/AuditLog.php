<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'action', 'model_type', 'model_id', 'description', 'ip_address'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(string $action, string $description, ?Model $model = null): void
    {
        static::create([
            'user_id'    => Auth::id(),
            'action'     => $action,
            'model_type' => $model ? class_basename($model) : null,
            'model_id'   => $model?->getKey(),
            'description'=> $description,
            'ip_address' => Request::ip(),
        ]);
    }
}
