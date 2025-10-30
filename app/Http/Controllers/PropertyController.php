<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index()
    {
      return Property::with(['owner', 'rentals.tenant.user'])->get()->map(function ($property) {
        $property->available = $property->isAvailable();
        return $property;
      });
    }

    public function store(Request $request)
    {
      $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'address' => 'required|string',
        'price_per_month' => 'required|numeric|min:0',
        'bedrooms' => 'required|integer|min:1',
        'bathrooms' => 'required|integer|min:1',
        'owner_id' => 'required|exists:users,id',
      ]);

      $property = Property::create($validated);

      return response()->json($property->load('owner'), 201);
    }

    public function show(Property $property)
    {
      return response()->json($property->load('owner'));
    }

    public function update(Request $request, Property $property)
    {
      $validated = $request->validate([
        'name' => 'string|max:255',
        'description' => 'nullable|string',
        'address' => 'string',
        'price_per_month' => 'numeric|min:0',
        'bedrooms' => 'integer|min:1',
        'bathrooms' => 'integer|min:1',
        'owner_id' => 'exists:users,id',
      ]);

      $property->update($validated);

      return response()->json($property->load('owner'));
    }

    public function destroy(Property $property)
    {
      $property->delete();

      return response()->json(null, 204);
    }
}