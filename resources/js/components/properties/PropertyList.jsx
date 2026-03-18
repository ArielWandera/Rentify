import { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = () => {
    const token = localStorage.getItem('token');
    axios.get('/api/properties', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => setProperties(res.data))
      .catch(() => setError('Failed to load properties. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Properties</h1>
        <Link to="/properties/new" className="btn-primary">+ Add New</Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!error && properties.length === 0 ? (
        <div className="text-center py-16">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No properties yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first property.</p>
          <div className="mt-6">
            <Link to="/properties/new" className="btn-primary">+ Add Property</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              onDelete={id => setProperties(prev => prev.filter(x => x.id !== id))}
              onUpdate={fetchProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}