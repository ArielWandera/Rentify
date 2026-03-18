// resources/js/components/properties/PropertyCard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import TenantAssignmentModal from './TenantAssignmentModal';

export default function PropertyCard({ property, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [showTenantModal, setShowTenantModal] = useState(false);

  const isAvailable = property.available;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/properties/${property.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          onDelete?.(property.id);
        }
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-hover transition-all duration-300">
      {/* Image */}
      <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Property Image</span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
          {property.name}
        </h3>

        {/* Address */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
          {property.address}
        </p>

        {/* Price */}
        <p className="text-xl font-bold text-primary">
          ${property.price_per_month?.toLocaleString()}/mo
        </p>

        {/* Details */}
        <p className="text-sm text-gray-500">
          {property.bedrooms} bed • {property.bathrooms} bath
        </p>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isAvailable
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {isAvailable ? 'Available' : 'Occupied'}
          </span>

          {/* Buttons */}
          <div className="flex gap-2">
            {isAvailable && user?.role === 'admin' && (
              <button
                onClick={() => setShowTenantModal(true)}
                className="flex-1 text-center bg-green-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-green-600 transition"
              >
                Add Tenant
              </button>
            )}
            <Link
              to={`/properties/${property.id}`}
              className="flex-1 text-center btn-primary text-xs py-2 px-3 rounded-lg"
            >
              View
            </Link>
            <Link
              to={`/properties/${property.id}/edit`}
              className="flex-1 text-center border border-primary text-primary text-xs py-2 px-3 rounded-lg hover:bg-primary hover:text-white transition"
            >
              Edit
            </Link>
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                title="Delete Property"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showTenantModal && (
        <TenantAssignmentModal
          property={property}
          onClose={() => setShowTenantModal(false)}
          onSuccess={() => {
            setShowTenantModal(false);
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
}
