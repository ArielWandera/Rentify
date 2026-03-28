import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import TenantAssignmentModal from './TenantAssignmentModal';

export default function PropertyCard({ property, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [locallyAssigned, setLocallyAssigned] = useState(false);

  const isAvailable = !locallyAssigned && property.available;

  const handleDelete = async () => {
    if (confirm('Delete this property? This cannot be undone.')) {
      try {
        const response = await fetch(`/api/properties/${property.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          },
        });
        if (response.ok) onDelete?.(property.id);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  return (
    <>
      <div className="group bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 dark:border-dark-border">

        {/* Image */}
        <div className="relative h-52 bg-gray-100 dark:bg-dark-elevated overflow-hidden">
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs">No photo</span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={isAvailable ? 'badge-available' : 'badge-occupied'}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
              {isAvailable ? 'Available' : 'Occupied'}
            </span>
          </div>

          {/* Delete button */}
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="absolute top-3 right-3 p-1.5 bg-white/90 dark:bg-dark-surface/90 rounded-full text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow"
              title="Delete property"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Address */}
          <div className="flex items-start gap-1 text-warm-gray dark:text-gray-400 mb-2">
            <MapPinIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p className="text-xs line-clamp-1">{property.address}</p>
          </div>

          {/* Name */}
          <h3 className="text-base font-bold text-raisin dark:text-white line-clamp-1 mb-1">
            {property.name}
          </h3>

          {/* Beds / baths */}
          <p className="text-xs text-warm-gray dark:text-gray-400 mb-3">
            {property.bedrooms} bed · {property.bathrooms} bath
          </p>

          {/* Price */}
          <p className="text-lg font-bold text-raisin dark:text-white mb-4">
            UGX {property.price_per_month?.toLocaleString()}
            <span className="text-sm font-normal text-warm-gray"> /mo</span>
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {isAvailable && (user?.role === 'admin' || user?.role === 'owner') && (
              <button
                onClick={() => setShowTenantModal(true)}
                className="flex-1 text-center text-sm font-semibold py-2 px-3 rounded-xl border border-gray-200 dark:border-dark-border text-raisin dark:text-white hover:bg-gray-50 dark:hover:bg-dark-elevated transition"
              >
                Add tenant
              </button>
            )}
            <Link
              to={`/properties/${property.id}`}
              className="flex-1 text-center btn-primary text-sm py-2 px-3"
            >
              View
            </Link>
            <Link
              to={`/properties/${property.id}/edit`}
              className="flex-1 text-center btn-outline text-sm py-2 px-3"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {showTenantModal && (
        <TenantAssignmentModal
          property={property}
          onClose={() => setShowTenantModal(false)}
          onSuccess={() => {
            setLocallyAssigned(true);
            setShowTenantModal(false);
            onUpdate?.();
          }}
        />
      )}
    </>
  );
}
