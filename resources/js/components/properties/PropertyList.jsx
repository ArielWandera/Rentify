import { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import { Link } from 'react-router-dom';

export default function PropertyList() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios.get('/api/properties').then(res => setProperties(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Link to="/properties/new" className="btn-primary">+ Add New</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}