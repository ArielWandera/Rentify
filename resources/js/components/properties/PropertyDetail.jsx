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
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-80 flex items-center justify-center">
          <span className="text-gray-500">Property Image</span>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">Monthly Rent</p>
            <p className="text-3xl font-bold text-primary">
              ${property.price_per_month}
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
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {property.available ? 'Available for Rent' : 'Currently Occupied'}
            </span>
          </div>
        </div>
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