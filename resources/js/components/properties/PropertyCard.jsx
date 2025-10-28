// resources/js/components/properties/PropertyCard.jsx
import { Link } from 'react-router-dom';

export default function PropertyCard({ property }) {
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
              property.available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {property.available ? 'Available' : 'Occupied'}
          </span>

          {/* Buttons */}
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}