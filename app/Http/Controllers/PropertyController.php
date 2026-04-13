<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\AuditLog;
use App\Models\Property;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $query = $user->role === 'owner'
            ? Property::with(['owner', 'rentals.tenant.user'])->where('owner_id', $user->id)
            : Property::with(['owner', 'rentals.tenant.user']);

        return $query->get()->map(function ($property) {
            $property->available = $property->isAvailable();
            $property->image_url = $property->image ? Storage::url($property->image) : null;
            return $property;
        });
    }

    public function store(StorePropertyRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('properties', 'public');
        }

        $property = Property::create($validated);
        $property->image_url = $property->image ? Storage::url($property->image) : null;

        AuditLog::record('created', "Property '{$property->name}' created", $property);

        return response()->json($property->load('owner'), 201);
    }

    public function show(Property $property)
    {
        $property->available = $property->isAvailable();
        $property->image_url = $property->image ? Storage::url($property->image) : null;
        return response()->json($property->load(['owner', 'rentals.tenant.user', 'units']));
    }

    public function update(UpdatePropertyRequest $request, Property $property)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($property->image) {
                Storage::disk('public')->delete($property->image);
            }
            $validated['image'] = $request->file('image')->store('properties', 'public');
        }

        $property->update($validated);
        $property->image_url = $property->image ? Storage::url($property->image) : null;

        AuditLog::record('updated', "Property '{$property->name}' updated", $property);

        return response()->json($property->load('owner'));
    }

    public function destroy(Property $property)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($property->image) {
            Storage::disk('public')->delete($property->image);
        }

        AuditLog::record('deleted', "Property '{$property->name}' deleted", $property);
        $property->delete();

        return response()->json(null, 204);
    }
}
