import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [submitError, setSubmitError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem('token');
      axios.get(`/api/properties/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => {
        setValue('name', res.data.name);
        setValue('description', res.data.description);
        setValue('address', res.data.address);
        setValue('price_per_month', res.data.price_per_month);
        setValue('bedrooms', res.data.bedrooms);
        setValue('bathrooms', res.data.bathrooms);
        if (res.data.image_url) setImagePreview(res.data.image_url);
      });
    }
  }, [id, isEdit, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = data => {
    setSubmitError(null);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('price_per_month', data.price_per_month);
    formData.append('bedrooms', data.bedrooms);
    formData.append('bathrooms', data.bathrooms);
    if (data.description) formData.append('description', data.description);
    if (imageFile) formData.append('image', imageFile);

    if (!isEdit) {
      formData.append('owner_id', user.id);
    }

    // Laravel requires _method override for PUT with FormData
    if (isEdit) formData.append('_method', 'PUT');

    const token = localStorage.getItem('token');
    const url = isEdit ? `/api/properties/${id}` : '/api/properties';

    axios.post(url, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => navigate('/properties'))
      .catch(err => {
        const message = err.response?.data?.message || 'Something went wrong. Please try again.';
        setSubmitError(message);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEdit ? 'Edit Property' : 'Add Property'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
            placeholder="Describe the property..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            {...register('address', { required: 'Address is required' })}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price/Month</label>
            <input
              type="number"
              {...register('price_per_month', { required: 'Price is required' })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.price_per_month && <p className="text-red-500 text-sm mt-1">{errors.price_per_month.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              {...register('bedrooms', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input
              type="number"
              {...register('bathrooms', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Property Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition cursor-pointer"
            onClick={() => document.getElementById('image-upload').click()}
          >
            {imagePreview ? (
              <div className="space-y-2 text-center">
                <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded object-cover" />
                <p className="text-xs text-gray-500">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload an image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3">
          {isEdit ? 'Update Property' : 'Create Property'}
        </button>
      </form>
    </div>
  );
}
