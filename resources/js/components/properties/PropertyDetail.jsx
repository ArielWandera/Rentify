import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowUpTrayIcon, ArrowDownTrayIcon, DocumentTextIcon,
  PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon,
  MagnifyingGlassIcon, SparklesIcon, AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [leaseUploading, setLeaseUploading] = useState(false);
  const [leaseMsg, setLeaseMsg]       = useState(null);

  // Units state
  const [units, setUnits]             = useState([]);
  const [newUnit, setNewUnit]         = useState({ unit_number: '', floor: '', bedrooms: 1, bathrooms: 1, price_per_month: '' });
  const [addingUnit, setAddingUnit]   = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);

  // Inline edit
  const [editingId, setEditingId]     = useState(null);
  const [editBuf, setEditBuf]         = useState({});

  // Selection for bulk edit
  const [selected, setSelected]       = useState(new Set());
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkFields, setBulkFields]   = useState({ bedrooms: '', bathrooms: '', price_per_month: '' });
  const [bulkSaving, setBulkSaving]   = useState(false);

  // Search / filter
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate modal
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm]         = useState({ floors: 1, units_per_floor: 10, pattern: 'numeric', price_per_month: '', bedrooms: 1, bathrooms: 1 });
  const [generating, setGenerating]   = useState(false);
  const [genResult, setGenResult]     = useState(null);

  useEffect(() => {
    axios.get(`/api/properties/${id}`, { headers: authHeaders() })
      .then(res => {
        setProperty(res.data);
        setLoading(false);
        axios.get(`/api/properties/${id}/units`, { headers: authHeaders() })
          .then(u => setUnits(u.data))
          .catch(() => {});
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Filtered + searched units
  const filtered = useMemo(() => {
    return units.filter(u => {
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'available' && !u.is_occupied)
        || (statusFilter === 'occupied' && u.is_occupied);
      const q = search.toLowerCase();
      const matchSearch = !q
        || u.unit_number.toLowerCase().includes(q)
        || (u.tenant_name || '').toLowerCase().includes(q)
        || (u.tenant_email || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [units, search, statusFilter]);

  // Group by floor (null floor = no grouping)
  const hasFloors = units.some(u => u.floor !== null && u.floor !== undefined);
  const grouped = useMemo(() => {
    if (!hasFloors) return { null: filtered };
    return filtered.reduce((acc, u) => {
      const key = u.floor ?? 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(u);
      return acc;
    }, {});
  }, [filtered, hasFloors]);

  const floorKeys = hasFloors
    ? Object.keys(grouped).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return Number(a) - Number(b);
      })
    : [null];

  // Selection helpers
  const toggleSelect = (unitId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(unitId) ? next.delete(unitId) : next.add(unitId);
      return next;
    });
  };
  const selectFloor = (floorUnits) => {
    setSelected(prev => {
      const next = new Set(prev);
      const ids = floorUnits.map(u => u.id);
      const allSelected = ids.every(id => next.has(id));
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };
  const clearSelection = () => { setSelected(new Set()); setShowBulkPanel(false); };

  // Inline edit helpers
  const startEdit = (unit) => {
    setEditingId(unit.id);
    setEditBuf({ unit_number: unit.unit_number, floor: unit.floor ?? '', bedrooms: unit.bedrooms, bathrooms: unit.bathrooms, price_per_month: unit.price_per_month });
  };
  const saveEdit = async (unit) => {
    try {
      const res = await axios.put(`/api/units/${unit.id}`, editBuf, { headers: authHeaders() });
      setUnits(prev => prev.map(u => u.id === unit.id ? res.data : u));
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.errors?.unit_number?.[0] || 'Failed to save.');
    }
  };

  // Bulk edit save
  const saveBulk = async () => {
    const fields = Object.fromEntries(
      Object.entries(bulkFields).filter(([, v]) => v !== '')
    );
    if (!Object.keys(fields).length) return;
    setBulkSaving(true);
    try {
      const res = await axios.post(
        `/api/properties/${id}/units/bulk`,
        { unit_ids: [...selected], ...fields },
        { headers: authHeaders() }
      );
      setUnits(res.data);
      clearSelection();
      setBulkFields({ bedrooms: '', bathrooms: '', price_per_month: '' });
    } catch { alert('Bulk update failed.'); }
    finally { setBulkSaving(false); }
  };

  // Generate submit
  const submitGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenResult(null);
    try {
      const res = await axios.post(`/api/properties/${id}/units/generate`, genForm, { headers: authHeaders() });
      setUnits(prev => [...prev, ...res.data.created]);
      setGenResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Generation failed.');
    } finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  if (!property) return (
    <div className="text-center p-8"><p className="text-gray-500">Property not found.</p></div>
  );

  const renderUnitRow = (unit) => {
    const isEditing = editingId === unit.id;
    const isSelected = selected.has(unit.id);

    if (isEditing) return (
      <tr key={unit.id} className="bg-primary/5 dark:bg-primary/10">
        <td className="py-2 pr-2">
          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(unit.id)} className="rounded" />
        </td>
        <td className="py-2 pr-1">
          <input value={editBuf.unit_number} onChange={e => setEditBuf({...editBuf, unit_number: e.target.value})}
            className="input text-xs w-16" />
        </td>
        <td className="py-2 pr-1">
          <input type="number" min={0} value={editBuf.floor} onChange={e => setEditBuf({...editBuf, floor: e.target.value})}
            placeholder="—" className="input text-xs w-14" />
        </td>
        <td className="py-2 pr-1">
          <input type="number" min={1} value={editBuf.bedrooms} onChange={e => setEditBuf({...editBuf, bedrooms: e.target.value})}
            className="input text-xs w-14" />
        </td>
        <td className="py-2 pr-1">
          <input type="number" min={1} value={editBuf.bathrooms} onChange={e => setEditBuf({...editBuf, bathrooms: e.target.value})}
            className="input text-xs w-14" />
        </td>
        <td className="py-2 pr-1 text-right">
          <input type="number" min={0} value={editBuf.price_per_month} onChange={e => setEditBuf({...editBuf, price_per_month: e.target.value})}
            className="input text-xs w-28 text-right" />
        </td>
        <td colSpan={2} className="py-2 text-xs text-gray-400">{unit.tenant_name || '—'}</td>
        <td className="py-2 text-right">
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => saveEdit(unit)} className="text-green-600 hover:text-green-700"><CheckIcon className="h-4 w-4" /></button>
            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        </td>
      </tr>
    );

    return (
      <tr key={unit.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
        <td className="py-3 pr-2">
          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(unit.id)} className="rounded" />
        </td>
        <td className="py-3 font-semibold text-gray-900 dark:text-white">{unit.unit_number}</td>
        <td className="py-3 text-gray-500 dark:text-gray-400">{unit.floor ?? '—'}</td>
        <td className="py-3 text-gray-600 dark:text-gray-300">{unit.bedrooms}</td>
        <td className="py-3 text-gray-600 dark:text-gray-300">{unit.bathrooms}</td>
        <td className="py-3 text-right text-gray-900 dark:text-white">UGX {parseFloat(unit.price_per_month).toLocaleString()}</td>
        <td className="py-3">
          {unit.tenant_name ? (
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-xs">{unit.tenant_name}</p>
              <p className="text-xs text-gray-400">{unit.tenant_email}</p>
            </div>
          ) : <span className="text-gray-400 text-xs">—</span>}
        </td>
        <td className="py-3 text-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            unit.is_occupied
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {unit.is_occupied ? 'Occupied' : 'Available'}
          </span>
        </td>
        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => startEdit(unit)} className="text-gray-400 hover:text-primary transition">
              <PencilIcon className="h-4 w-4" />
            </button>
            {!unit.is_occupied && (
              <button
                onClick={async () => {
                  if (!confirm(`Delete unit ${unit.unit_number}?`)) return;
                  await axios.delete(`/api/units/${unit.id}`, { headers: authHeaders() });
                  setUnits(u => u.filter(x => x.id !== unit.id));
                }}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{property.address}</p>
        </div>
        <Link to={`/properties/${property.id}/edit`} className="btn-primary px-5 py-2 rounded-lg">Edit Property</Link>
      </div>

      {/* Image + Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-80 overflow-hidden">
          {property.image_url
            ? <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><span className="text-gray-500">No image uploaded</span></div>
          }
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">Monthly Rent</p>
            <p className="text-3xl font-bold text-primary">${property.price_per_month?.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Bedrooms</p><p className="text-xl font-semibold">{property.bedrooms}</p></div>
            <div><p className="text-sm text-gray-500">Bathrooms</p><p className="text-xl font-semibold">{property.bathrooms}</p></div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-1 ${
              property.available
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {property.available ? 'Available for Rent' : 'Currently Occupied'}
            </span>
          </div>
          {property.owner && (
            <div><p className="text-sm text-gray-500">Owner</p><p className="font-medium text-gray-900 dark:text-white">{property.owner.name}</p></div>
          )}
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
          <p className="text-gray-600 dark:text-gray-400">{property.description}</p>
        </div>
      )}

      {/* Current Tenant Info (single-unit) */}
      {!property.available && property.rentals?.length > 0 && (() => {
        const activeRental = property.rentals.find(r => r.status === 'active');
        if (!activeRental) return null;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Tenant</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium text-gray-900 dark:text-white">{activeRental.tenant?.user?.name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-900 dark:text-white">{activeRental.tenant?.user?.email}</p></div>
              <div><p className="text-sm text-gray-500">Lease Start</p><p className="font-medium text-gray-900 dark:text-white">{new Date(activeRental.start_date).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-gray-500">Monthly Rent</p><p className="font-medium text-gray-900 dark:text-white">${activeRental.monthly_rent?.toLocaleString()}</p></div>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DocumentTextIcon className="h-4 w-4" /> Lease Document
              </p>
              {leaseMsg && <p className={`text-xs ${leaseMsg.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{leaseMsg.text}</p>}
              <div className="flex gap-2 flex-wrap">
                <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition
                  ${leaseUploading ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}>
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  {leaseUploading ? 'Uploading...' : activeRental.lease_path ? 'Replace lease' : 'Upload lease'}
                  <input type="file" accept=".pdf" disabled={leaseUploading} className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLeaseUploading(true); setLeaseMsg(null);
                      const fd = new FormData();
                      fd.append('lease', file);
                      try {
                        await axios.post(`/api/rentals/${activeRental.id}/lease`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setLeaseMsg({ ok: true, text: 'Lease uploaded successfully.' });
                        setProperty(p => ({ ...p, rentals: p.rentals.map(r => r.id === activeRental.id ? { ...r, lease_path: 'uploaded' } : r) }));
                      } catch { setLeaseMsg({ ok: false, text: 'Upload failed. File must be a PDF under 10 MB.' }); }
                      finally { setLeaseUploading(false); e.target.value = ''; }
                    }}
                  />
                </label>
                {activeRental.lease_path && (
                  <button
                    onClick={() => {
                      fetch(`/api/rentals/${activeRental.id}/lease`, { headers: authHeaders() })
                        .then(r => r.blob())
                        .then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lease-agreement.pdf'; a.click(); });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" /> Download lease
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Units ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-4">
        {/* Units header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Units</h2>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setShowGenerate(true); setGenResult(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary transition">
              <SparklesIcon className="h-4 w-4" /> Generate
            </button>
            <button onClick={() => setShowUnitForm(!showUnitForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition">
              <PlusIcon className="h-4 w-4" /> Add unit
            </button>
          </div>
        </div>

        {/* Search + filter */}
        {units.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search unit or tenant…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9 text-sm w-full"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="input text-sm w-auto">
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        )}

        {/* Bulk edit bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-primary">{selected.size} unit{selected.size > 1 ? 's' : ''} selected</span>
            <button onClick={() => setShowBulkPanel(!showBulkPanel)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition">
              <AdjustmentsHorizontalIcon className="h-4 w-4" /> Edit selected
            </button>
            <button onClick={clearSelection} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">Clear</button>
          </div>
        )}

        {showBulkPanel && selected.size > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Beds (leave blank to keep)</label>
              <input type="number" min={1} value={bulkFields.bedrooms} onChange={e => setBulkFields({...bulkFields, bedrooms: e.target.value})}
                placeholder="—" className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Baths</label>
              <input type="number" min={1} value={bulkFields.bathrooms} onChange={e => setBulkFields({...bulkFields, bathrooms: e.target.value})}
                placeholder="—" className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Price/month</label>
              <input type="number" min={0} value={bulkFields.price_per_month} onChange={e => setBulkFields({...bulkFields, price_per_month: e.target.value})}
                placeholder="—" className="input text-sm" />
            </div>
            <div className="flex items-end">
              <button onClick={saveBulk} disabled={bulkSaving}
                className="btn-primary text-sm px-4 py-2 w-full disabled:opacity-50">
                {bulkSaving ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        {/* Add unit form */}
        {showUnitForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAddingUnit(true);
              try {
                const res = await axios.post(`/api/properties/${property.id}/units`, newUnit, { headers: authHeaders() });
                setUnits(u => [...u, res.data]);
                setNewUnit({ unit_number: '', floor: '', bedrooms: 1, bathrooms: 1, price_per_month: '' });
                setShowUnitForm(false);
              } catch (err) {
                alert(err.response?.data?.errors?.unit_number?.[0] || 'Failed to add unit.');
              } finally { setAddingUnit(false); }
            }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Unit no.</label>
              <input required placeholder="e.g. A1" value={newUnit.unit_number}
                onChange={e => setNewUnit({...newUnit, unit_number: e.target.value})} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Floor</label>
              <input type="number" min={0} placeholder="—" value={newUnit.floor}
                onChange={e => setNewUnit({...newUnit, floor: e.target.value})} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Beds</label>
              <input type="number" min={1} required value={newUnit.bedrooms}
                onChange={e => setNewUnit({...newUnit, bedrooms: e.target.value})} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Baths</label>
              <input type="number" min={1} required value={newUnit.bathrooms}
                onChange={e => setNewUnit({...newUnit, bathrooms: e.target.value})} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Price/month</label>
              <input type="number" min={0} required value={newUnit.price_per_month}
                onChange={e => setNewUnit({...newUnit, price_per_month: e.target.value})} className="input text-sm" />
            </div>
            <div className="col-span-2 sm:col-span-5 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowUnitForm(false)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                Cancel
              </button>
              <button type="submit" disabled={addingUnit} className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50">
                {addingUnit ? 'Adding…' : 'Save unit'}
              </button>
            </div>
          </form>
        )}

        {/* Units table — grouped by floor if floors exist */}
        {units.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No units yet. Use Generate to bulk-create, or Add unit for one at a time.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No units match your search.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[640px]">
              {floorKeys.map((floorKey, fi) => {
                const floorUnits = grouped[floorKey] || [];
                if (!floorUnits.length) return null;
                const floorSelected = floorUnits.every(u => selected.has(u.id));
                return (
                  <tbody key={floorKey ?? 'all'} className="divide-y divide-gray-50 dark:divide-gray-700">
                    {hasFloors && (
                      <tr className="bg-gray-50 dark:bg-gray-700/40">
                        <td colSpan={9} className="px-1 py-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={floorSelected}
                              onChange={() => selectFloor(floorUnits)} className="rounded" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {floorKey === 'Other' ? 'No floor assigned' : `Floor ${floorKey}`}
                            </span>
                            <span className="text-xs text-gray-400">({floorUnits.length} units)</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {fi === 0 && !hasFloors && (
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="pb-2 w-8" />
                        <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                        <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Floor</th>
                        <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Beds</th>
                        <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Baths</th>
                        <th className="pb-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                        <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tenant</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="pb-2" />
                      </tr>
                    )}
                    {floorUnits.map(unit => renderUnitRow(unit))}
                  </tbody>
                );
              })}
            </table>
          </div>
        )}
      </div>

      {/* Generate units modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Units</h3>
              <button onClick={() => setShowGenerate(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {genResult ? (
              <div className="space-y-3">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ {genResult.created.length} unit{genResult.created.length !== 1 ? 's' : ''} created
                </p>
                {genResult.skipped.length > 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {genResult.skipped.length} skipped (already existed): {genResult.skipped.join(', ')}
                  </p>
                )}
                <button onClick={() => setShowGenerate(false)} className="btn-primary w-full">Done</button>
              </div>
            ) : (
              <form onSubmit={submitGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Floors</label>
                    <input type="number" min={1} max={100} required value={genForm.floors}
                      onChange={e => setGenForm({...genForm, floors: e.target.value})} className="input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Units per floor</label>
                    <input type="number" min={1} max={100} required value={genForm.units_per_floor}
                      onChange={e => setGenForm({...genForm, units_per_floor: e.target.value})} className="input text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Naming pattern</label>
                  <select value={genForm.pattern} onChange={e => setGenForm({...genForm, pattern: e.target.value})} className="input text-sm">
                    <option value="numeric">Numeric — 101, 102 … 201, 202</option>
                    <option value="alpha">Alpha — A1, A2 … B1, B2</option>
                    <option value="sequential">Sequential — 1, 2, 3 …</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Preview: {genForm.pattern === 'numeric'
                      ? `101 … ${genForm.floors}0${genForm.units_per_floor}`
                      : genForm.pattern === 'alpha'
                        ? `A1 … ${String.fromCharCode(64 + Number(genForm.floors))}${genForm.units_per_floor}`
                        : `1 … ${genForm.floors * genForm.units_per_floor}`}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Default beds</label>
                    <input type="number" min={1} required value={genForm.bedrooms}
                      onChange={e => setGenForm({...genForm, bedrooms: e.target.value})} className="input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Default baths</label>
                    <input type="number" min={1} required value={genForm.bathrooms}
                      onChange={e => setGenForm({...genForm, bathrooms: e.target.value})} className="input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Default price</label>
                    <input type="number" min={0} required value={genForm.price_per_month}
                      onChange={e => setGenForm({...genForm, price_per_month: e.target.value})} className="input text-sm" />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  This will create {genForm.floors * genForm.units_per_floor} units. Existing unit numbers will be skipped.
                  You can edit individual prices after generation.
                </p>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowGenerate(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={generating} className="flex-1 btn-primary text-sm disabled:opacity-50">
                    {generating ? 'Generating…' : `Generate ${genForm.floors * genForm.units_per_floor} units`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Back */}
      <div>
        <Link to="/properties" className="inline-flex items-center gap-2 text-primary hover:underline">
          ← Back to Properties
        </Link>
      </div>
    </div>
  );
}
