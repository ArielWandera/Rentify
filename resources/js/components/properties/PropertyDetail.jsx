// resources/js/components/properties/PropertyDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

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
          </div>
        );
      })()}

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