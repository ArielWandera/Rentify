<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'address'         => 'required|string',
            'price_per_month' => 'required|numeric|min:0',
            'bedrooms'        => 'required|integer|min:1',
            'bathrooms'       => 'required|integer|min:1',
            'owner_id'        => 'required|exists:users,id',
            'image'           => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('properties', 'public');
        }

        $property = Property::create($validated);
        $property->image_url = $property->image ? Storage::url($property->image) : null;

        return response()->json($property->load('owner'), 201);
    }

    public function show(Property $property)
    {
        $property->available = $property->isAvailable();
        $property->image_url = $property->image ? Storage::url($property->image) : null;
        return response()->json($property->load(['owner', 'rentals.tenant.user']));
    }

    public function update(Request $request, Property $property)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'            => 'string|max:255',
            'description'     => 'nullable|string',
            'address'         => 'string',
            'price_per_month' => 'numeric|min:0',
            'bedrooms'        => 'integer|min:1',
            'bathrooms'       => 'integer|min:1',
            'owner_id'        => 'exists:users,id',
            'image'           => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($property->image) {
                Storage::disk('public')->delete($property->image);
            }
            $validated['image'] = $request->file('image')->store('properties', 'public');
        }

        $property->update($validated);
        $property->image_url = $property->image ? Storage::url($property->image) : null;

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

        $property->delete();

        return response()->json(null, 204);
    }
}
