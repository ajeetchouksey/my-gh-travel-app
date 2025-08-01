'use client';

import { useTripPlans } from '@/hooks/useTripPlans';
import { formatDate, formatCurrency } from '@/lib/storage';
import { Plus, MapPin, Calendar, DollarSign, Trash2, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function TripsPage() {
  const { tripPlans, loading, deleteTripPlan } = useTripPlans();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  const handleDeleteTrip = (tripId: string, tripName: string) => {
    if (confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      deleteTripPlan(tripId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-2">Manage and view all your travel itineraries</p>
        </div>
        <Link href="/create" className="btn-primary inline-flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create New Trip
        </Link>
      </div>

      {/* Trip Stats */}
      {tripPlans.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">{tripPlans.length}</div>
            <p className="text-gray-600">Total Trips</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {tripPlans.reduce((sum, trip) => sum + trip.destinations.length, 0)}
            </div>
            <p className="text-gray-600">Destinations Visited</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {formatCurrency(tripPlans.reduce((sum, trip) => sum + trip.budget, 0))}
            </div>
            <p className="text-gray-600">Total Budget</p>
          </div>
        </div>
      )}

      {/* Trips List */}
      {tripPlans.length === 0 ? (
        <div className="card text-center py-16">
          <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No trips planned yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start planning your next adventure! Create detailed itineraries with destinations, activities, and budget tracking.
          </p>
          <Link href="/create" className="btn-primary text-lg px-8 py-3">
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tripPlans.map((trip) => (
            <div key={trip.id} className="card hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <Link href={`/trip/${trip.id}`} className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                    {trip.name}
                  </h3>
                </Link>
                <div className="flex gap-1 ml-2">
                  <Link
                    href={`/trip/${trip.id}`}
                    className="text-primary-600 hover:text-primary-700 p-1"
                    title="Edit trip"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteTrip(trip.id, trip.name)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Link href={`/trip/${trip.id}`} className="block">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Budget: {formatCurrency(trip.budget)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {trip.destinations.length === 0
                        ? 'No destinations added'
                        : trip.destinations.length === 1
                        ? trip.destinations[0].location
                        : `${trip.destinations[0].location} +${trip.destinations.length - 1} more`
                      }
                    </span>
                  </div>
                </div>

                {trip.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{trip.description}</p>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {trip.destinations.length} destinations • {trip.activities.length} activities
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated {new Date(trip.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}