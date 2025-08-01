'use client';

import { useTripPlans } from '@/hooks/useTripPlans';
import { formatDate, formatCurrency } from '@/lib/storage';
import { Plus, MapPin, Calendar, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { tripPlans, loading } = useTripPlans();

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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Plan Your Perfect Journey
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create comprehensive travel itineraries with destinations, activities, budget tracking, and collaborative planning.
        </p>
        <Link href="/create" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create New Trip
        </Link>
      </div>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Multiple Destinations</h3>
          <p className="text-gray-600">Add multiple destinations with dates, times, and detailed planning</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Activity Planning</h3>
          <p className="text-gray-600">Schedule activities with times, costs, and personal notes</p>
        </div>
        <div className="card text-center">
          <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Budget Tracking</h3>
          <p className="text-gray-600">Monitor expenses and stay within your travel budget</p>
        </div>
      </div>

      {/* Recent Trips */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Recent Trips</h2>
          <Link href="/trips" className="text-primary-600 hover:text-primary-700 font-medium">
            View All Trips →
          </Link>
        </div>

        {tripPlans.length === 0 ? (
          <div className="card text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
            <Link href="/create" className="btn-primary">
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripPlans.slice(0, 6).map((trip) => (
              <Link key={trip.id} href={`/trip/${trip.id}`} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{trip.name}</h3>
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                    {trip.destinations.length} destinations
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Budget: {formatCurrency(trip.budget)}
                  </div>
                  {trip.destinations.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {trip.destinations.map(d => d.location).join(', ')}
                    </div>
                  )}
                </div>

                {trip.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}