import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/properties/${id}`).then(res => {
        setValue('name', res.data.name);
        setValue('address', res.data.address);
        setValue('price_per_month', res.data.price_per_month);
        setValue('bedrooms', res.data.bedrooms);
        setValue('bathrooms', res.data.bathrooms);
        setValue('available', res.data.available);
      });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = data => {
    const request = isEdit ? axios.put(`/api/properties/${id}`, data) : axios.post('/api/properties', data);
    request.then(() => navigate('/properties')).catch(err => console.error(err));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Edit Property' : 'Add Property'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full p-3 border rounded-lg dark:bg-gray-700" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input {...register('address', { required: 'Address is required' })} className="w-full p-3 border rounded-lg dark:bg-gray-700" />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price/Month</label>
            <input type="number" {...register('price_per_month', { required: 'Price is required' })} className="w-full p-3 border rounded-lg dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input type="number" {...register('bedrooms', { required: 'Bedrooms required', min: 1 })} className="w-full p-3 border rounded-lg dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input type="number" {...register('bathrooms', { required: 'Bathrooms required', min: 1 })} className="w-full p-3 border rounded-lg dark:bg-gray-700" />
          </div>
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" {...register('available')} className="rounded" />
            <span className="ml-2">Available</span>
          </label>
        </div>
        <button type="submit" className="btn-primary w-full py-3">Save</button>
      </form>
    </div>
  );
}