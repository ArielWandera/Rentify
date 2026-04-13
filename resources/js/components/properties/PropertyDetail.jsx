// resources/js/components/properties/PropertyDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaseUploading, setLeaseUploading] = useState(false);
  const [leaseMsg, setLeaseMsg] = useState(null);
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({ unit_number: '', bedrooms: 1, bathrooms: 1, price_per_month: '' });
  const [addingUnit, setAddingUnit] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`/api/properties/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        setProperty(res.data);
        setLoading(false);
        // Load units separately so they stay in sync after add/delete
        axios.get(`/api/properties/${id}/units`, { headers: { Authorization: `Bearer ${token}` } })
          .then(u => setUnits(u.data))
          .catch(() => {});
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {property.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {property.address}
          </p>
        </div>
        <Link
          to={`/properties/${property.id}/edit`}
          className="btn-primary px-5 py-2 rounded-lg"
        >
          Edit Property
        </Link>
      </div>

      {/* Image + Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-80 overflow-hidden">
          {property.image_url ? (
            <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No image uploaded</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">Monthly Rent</p>
            <p className="text-3xl font-bold text-primary">
              ${property.price_per_month?.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="text-xl font-semibold">{property.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="text-xl font-semibold">{property.bathrooms}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-1 ${
                property.available
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {property.available ? 'Available for Rent' : 'Currently Occupied'}
            </span>
          </div>

          {property.owner && (
            <div>
              <p className="text-sm text-gray-500">Owner</p>
              <p className="font-medium text-gray-900 dark:text-white">{property.owner.name}</p>
            </div>
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

      {/* Current Tenant Info */}
      {!property.available && property.rentals?.length > 0 && (() => {
        const activeRental = property.rentals.find(r => r.status === 'active');
        if (!activeRental) return null;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Tenant</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{activeRental.tenant?.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{activeRental.tenant?.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lease Start</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(activeRental.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="font-medium text-gray-900 dark:text-white">${activeRental.monthly_rent?.toLocaleString()}</p>
              </div>
            </div>

            {/* Lease document */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DocumentTextIcon className="h-4 w-4" /> Lease Document
              </p>
              {leaseMsg && (
                <p className={`text-xs ${leaseMsg.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{leaseMsg.text}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {/* Upload */}
                <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition
                  ${leaseUploading ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}>
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  {leaseUploading ? 'Uploading...' : activeRental.lease_path ? 'Replace lease' : 'Upload lease'}
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={leaseUploading}
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLeaseUploading(true);
                      setLeaseMsg(null);
                      const fd = new FormData();
                      fd.append('lease', file);
                      try {
                        await axios.post(`/api/rentals/${activeRental.id}/lease`, fd, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        setLeaseMsg({ ok: true, text: 'Lease uploaded successfully.' });
                        setProperty(p => ({
                          ...p,
                          rentals: p.rentals.map(r =>
                            r.id === activeRental.id ? { ...r, lease_path: 'uploaded' } : r
                          ),
                        }));
                      } catch {
                        setLeaseMsg({ ok: false, text: 'Upload failed. File must be a PDF under 10 MB.' });
                      } finally {
                        setLeaseUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>

                {/* Download */}
                {activeRental.lease_path && (
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      fetch(`/api/rentals/${activeRental.id}/lease`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                        .then(r => r.blob())
                        .then(blob => {
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = 'lease-agreement.pdf';
                          a.click();
                        });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download lease
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Units */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Units</h2>
          <button
            onClick={() => setShowUnitForm(!showUnitForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary transition"
          >
            <PlusIcon className="h-4 w-4" /> Add unit
          </button>
        </div>

        {showUnitForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAddingUnit(true);
              try {
                const res = await axios.post(`/api/properties/${property.id}/units`, newUnit);
                setUnits(u => [...u, res.data]);
                setNewUnit({ unit_number: '', bedrooms: 1, bathrooms: 1, price_per_month: '' });
                setShowUnitForm(false);
              } catch (err) {
                alert(err.response?.data?.errors?.unit_number?.[0] || 'Failed to add unit.');
              } finally {
                setAddingUnit(false);
              }
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Unit no.</label>
              <input
                required
                placeholder="e.g. A1"
                value={newUnit.unit_number}
                onChange={e => setNewUnit({ ...newUnit, unit_number: e.target.value })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Beds</label>
              <input type="number" min={1} required value={newUnit.bedrooms}
                onChange={e => setNewUnit({ ...newUnit, bedrooms: e.target.value })}
                className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Baths</label>
              <input type="number" min={1} required value={newUnit.bathrooms}
                onChange={e => setNewUnit({ ...newUnit, bathrooms: e.target.value })}
                className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Price/month</label>
              <input type="number" min={0} required value={newUnit.price_per_month}
                onChange={e => setNewUnit({ ...newUnit, price_per_month: e.target.value })}
                className="input text-sm" />
            </div>
            <div className="col-span-2 sm:col-span-4 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowUnitForm(false)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                Cancel
              </button>
              <button type="submit" disabled={addingUnit} className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50">
                {addingUnit ? 'Adding...' : 'Save unit'}
              </button>
            </div>
          </form>
        )}

        {units.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No units added yet. This is a single-unit property.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Beds</th>
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Baths</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tenant</th>
                <th className="pb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {units.map(unit => (
                <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="py-3 font-semibold text-gray-900 dark:text-white">{unit.unit_number}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{unit.bedrooms}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">{unit.bathrooms}</td>
                  <td className="py-3 text-right text-gray-900 dark:text-white">UGX {parseFloat(unit.price_per_month).toLocaleString()}</td>
                  <td className="py-3">
                    {unit.tenant_name ? (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{unit.tenant_name}</p>
                        <p className="text-xs text-gray-400">{unit.tenant_email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
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
                    {!unit.is_occupied && (
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete unit ${unit.unit_number}?`)) return;
                          await axios.delete(`/api/units/${unit.id}`);
                          setUnits(u => u.filter(x => x.id !== unit.id));
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Back Button */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          ← Back to Properties
        </Link>
      </div>
    </div>
  );
}