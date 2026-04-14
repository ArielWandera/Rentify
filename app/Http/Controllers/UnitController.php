<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnitController extends Controller
{
    private function formatUnit(Unit $u): array
    {
        $activeRental = $u->rentals->first();
        return array_merge($u->toArray(), [
            'is_occupied'  => (bool) $activeRental,
            'tenant_name'  => $activeRental?->tenant?->user?->name,
            'tenant_email' => $activeRental?->tenant?->user?->email,
            'rental_id'    => $activeRental?->id,
        ]);
    }

    private function loadUnits(Property $property)
    {
        return $property->units()->with([
            'rentals' => fn($q) => $q->where('status', 'active')->with('tenant.user'),
        ])->orderBy('floor')->orderBy('unit_number')->get()->map(fn($u) => $this->formatUnit($u));
    }

    public function index(Property $property)
    {
        return response()->json($this->loadUnits($property));
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
            'floor'           => 'nullable|integer|min:0',
            'bedrooms'        => 'required|integer|min:1',
            'bathrooms'       => 'required|integer|min:1',
            'price_per_month' => 'required|numeric|min:0',
        ]);

        $unit = $property->units()->create($validated);
        $unit->load(['rentals' => fn($q) => $q->where('status', 'active')->with('tenant.user')]);

        return response()->json($this->formatUnit($unit), 201);
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
            'floor'           => 'nullable|integer|min:0',
            'bedrooms'        => 'sometimes|integer|min:1',
            'bathrooms'       => 'sometimes|integer|min:1',
            'price_per_month' => 'sometimes|numeric|min:0',
        ]);

        $unit->update($validated);
        $unit->load(['rentals' => fn($q) => $q->where('status', 'active')->with('tenant.user')]);

        return response()->json($this->formatUnit($unit->fresh()));
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

    // Generate units in bulk — skips any unit_number that already exists
    public function generate(Request $request, Property $property)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'floors'          => 'required|integer|min:1|max:100',
            'units_per_floor' => 'required|integer|min:1|max:100',
            'pattern'         => 'required|in:numeric,alpha,sequential',
            'price_per_month' => 'required|numeric|min:0',
            'bedrooms'        => 'required|integer|min:1',
            'bathrooms'       => 'required|integer|min:1',
        ]);

        $existing = $property->units()->pluck('unit_number')->flip();
        $created  = [];
        $skipped  = [];

        for ($f = 1; $f <= $validated['floors']; $f++) {
            for ($u = 1; $u <= $validated['units_per_floor']; $u++) {
                $number = match ($validated['pattern']) {
                    'numeric'    => (string) ($f * 100 + $u),
                    'alpha'      => chr(64 + $f) . $u,
                    'sequential' => (string) (($f - 1) * $validated['units_per_floor'] + $u),
                };

                if (isset($existing[$number])) {
                    $skipped[] = $number;
                    continue;
                }

                $unit = $property->units()->create([
                    'unit_number'     => $number,
                    'floor'           => $f,
                    'bedrooms'        => $validated['bedrooms'],
                    'bathrooms'       => $validated['bathrooms'],
                    'price_per_month' => $validated['price_per_month'],
                ]);

                $unit->setRelation('rentals', collect());
                $created[]         = $this->formatUnit($unit);
                $existing[$number] = true;
            }
        }

        return response()->json(['created' => $created, 'skipped' => $skipped], 201);
    }

    // Bulk-update price/beds/baths for a selection of unit IDs (can be a whole floor or just a few)
    public function bulkUpdate(Request $request, Property $property)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $property->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'unit_ids'        => 'required|array|min:1',
            'unit_ids.*'      => 'integer|exists:units,id',
            'bedrooms'        => 'sometimes|integer|min:1',
            'bathrooms'       => 'sometimes|integer|min:1',
            'price_per_month' => 'sometimes|numeric|min:0',
        ]);

        $fields = array_intersect_key(
            $validated,
            array_flip(['bedrooms', 'bathrooms', 'price_per_month'])
        );

        if (empty($fields)) {
            return response()->json(['message' => 'Nothing to update.'], 422);
        }

        // Only update units that belong to this property (security check)
        $property->units()->whereIn('id', $validated['unit_ids'])->update($fields);

        return response()->json($this->loadUnits($property));
    }
}
