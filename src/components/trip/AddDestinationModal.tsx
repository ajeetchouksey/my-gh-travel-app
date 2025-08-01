'use client';

import { useState } from 'react';
import { Destination } from '@/types';
import { generateId } from '@/lib/storage';
import { Plus, MapPin, Calendar, Clock, Save, X } from 'lucide-react';

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (destination: Destination) => void;
}

export default function AddDestinationModal({ isOpen, onClose, onAdd }: AddDestinationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    arrivalTime: '',
    departureTime: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const destination: Destination = {
      id: generateId(),
      name: formData.name,
      location: formData.location,
      date: formData.date,
      arrivalTime: formData.arrivalTime || undefined,
      departureTime: formData.departureTime || undefined,
      notes: formData.notes || undefined,
    };

    onAdd(destination);
    setFormData({
      name: '',
      location: '',
      date: '',
      arrivalTime: '',
      departureTime: '',
      notes: '',
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Destination</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Destination Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Eiffel Tower, Central Park"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Paris, France"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Time
              </label>
              <input
                type="time"
                id="arrivalTime"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time
              </label>
              <input
                type="time"
                id="departureTime"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Any special notes or instructions..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.location || !formData.date}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Add Destination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}