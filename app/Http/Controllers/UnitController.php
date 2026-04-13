<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnitController extends Controller
{
    public function index(Property $property)
    {
        return response()->json(
            $property->units()->withCount([
                'rentals as occupied' => fn($q) => $q->where('status', 'active'),
            ])->get()->map(fn($u) => array_merge($u->toArray(), ['is_occupied' => $u->occupied > 0]))
        );
    }

    public function store(Request $request, Property $property)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'unit_number'     => ['required', 'string', 'max:20',
                \Illuminate\Validation\Rule::unique('units')->where('property_id', $property->id)],
            'bedrooms'        => 'required|integer|min:1',
            'bathrooms'       => 'required|integer|min:1',
            'price_per_month' => 'required|numeric|min:0',
        ]);

        $unit = $property->units()->create($validated);

        return response()->json(array_merge($unit->toArray(), ['is_occupied' => false]), 201);
    }

    public function update(Request $request, Unit $unit)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $unit->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'unit_number'     => ['sometimes', 'string', 'max:20',
                \Illuminate\Validation\Rule::unique('units')->where('property_id', $unit->property_id)->ignore($unit->id)],
            'bedrooms'        => 'sometimes|integer|min:1',
            'bathrooms'       => 'sometimes|integer|min:1',
            'price_per_month' => 'sometimes|numeric|min:0',
        ]);

        $unit->update($validated);

        return response()->json(array_merge($unit->toArray(), ['is_occupied' => $unit->isOccupied()]));
    }

    public function destroy(Unit $unit)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $unit->property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($unit->isOccupied()) {
            return response()->json(['error' => 'Cannot delete an occupied unit'], 400);
        }

        $unit->delete();

        return response()->json(null, 204);
    }
}
