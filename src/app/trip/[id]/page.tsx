'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripPlan } from '@/hooks/useTripPlans';
import { tripStorage, formatDate, formatCurrency } from '@/lib/storage';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Edit3,
  Trash2,
  Users
} from 'lucide-react';
import Link from 'next/link';
import AddDestinationModal from '@/components/trip/AddDestinationModal';
import AddActivityModal from '@/components/trip/AddActivityModal';
import BudgetTracker from '@/components/trip/BudgetTracker';
import { Destination, Activity } from '@/types';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const { tripPlan, loading, updateTripPlan } = useTripPlan(tripId);

  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && tripPlan) {
      setShareUrl(`${window.location.origin}/trip/${tripPlan.id}`);
    }
  }, [tripPlan]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!tripPlan) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
        <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist or has been deleted.</p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const budgetSummary = tripStorage.calculateBudgetSummary(tripPlan);

  const handleAddDestination = (destination: Destination) => {
    const updatedPlan = {
      ...tripPlan,
      destinations: [...tripPlan.destinations, destination],
      updatedAt: new Date().toISOString(),
    };
    updateTripPlan(updatedPlan);
  };

  const handleAddActivity = (activity: Activity) => {
    const updatedPlan = {
      ...tripPlan,
      activities: [...tripPlan.activities, activity],
      updatedAt: new Date().toISOString(),
    };
    updateTripPlan(updatedPlan);
  };

  const handleDeleteDestination = (destinationId: string) => {
    if (confirm('Are you sure you want to delete this destination? All associated activities will also be deleted.')) {
      const updatedPlan = {
        ...tripPlan,
        destinations: tripPlan.destinations.filter(d => d.id !== destinationId),
        activities: tripPlan.activities.filter(a => a.destinationId !== destinationId),
        updatedAt: new Date().toISOString(),
      };
      updateTripPlan(updatedPlan);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      const updatedPlan = {
        ...tripPlan,
        activities: tripPlan.activities.filter(a => a.id !== activityId),
        updatedAt: new Date().toISOString(),
      };
      updateTripPlan(updatedPlan);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Trip link copied to clipboard!');
    } catch (error) {
      alert(`Share this link: ${shareUrl}`);
    }
  };

  const handleExportPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(tripPlan.name, 20, 30);
      
      // Add dates
      doc.setFontSize(12);
      doc.text(`${formatDate(tripPlan.startDate)} - ${formatDate(tripPlan.endDate)}`, 20, 45);
      
      // Add budget info
      doc.text(`Budget: ${formatCurrency(tripPlan.budget)}`, 20, 60);
      doc.text(`Spent: ${formatCurrency(budgetSummary.totalSpent)}`, 20, 75);
      
      let yPosition = 95;
      
      // Add destinations and activities
      tripPlan.destinations.forEach((destination, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(14);
        doc.text(`${index + 1}. ${destination.name}`, 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(10);
        doc.text(`Location: ${destination.location}`, 25, yPosition);
        yPosition += 12;
        doc.text(`Date: ${formatDate(destination.date)}`, 25, yPosition);
        yPosition += 12;
        
        const activities = tripPlan.activities.filter(a => a.destinationId === destination.id);
        if (activities.length > 0) {
          doc.text('Activities:', 25, yPosition);
          yPosition += 12;
          
          activities.forEach(activity => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(`• ${activity.name} (${activity.startTime}) - ${formatCurrency(activity.cost)}`, 30, yPosition);
            yPosition += 10;
          });
        }
        yPosition += 10;
      });
      
      doc.save(`${tripPlan.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const openActivityModal = (destinationId: string) => {
    setSelectedDestinationId(destinationId);
    setShowActivityModal(true);
  };

  const selectedDestination = tripPlan.destinations.find(d => d.id === selectedDestinationId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{tripPlan.name}</h1>
          {tripPlan.description && (
            <p className="text-gray-600 mt-2">{tripPlan.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(tripPlan.startDate)} - {formatDate(tripPlan.endDate)}
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Budget: {formatCurrency(tripPlan.budget)}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {tripPlan.destinations.length} destinations
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="btn-secondary inline-flex items-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-secondary inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Destinations */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Destinations</h2>
              <button
                onClick={() => setShowDestinationModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Destination
              </button>
            </div>

            {tripPlan.destinations.length === 0 ? (
              <div className="card text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No destinations yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first destination</p>
                <button
                  onClick={() => setShowDestinationModal(true)}
                  className="btn-primary"
                >
                  Add First Destination
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {tripPlan.destinations.map((destination, index) => {
                  const activities = tripPlan.activities.filter(a => a.destinationId === destination.id);
                  
                  return (
                    <div key={destination.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {index + 1}. {destination.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {destination.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(destination.date)}
                            {destination.arrivalTime && (
                              <span className="ml-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {destination.arrivalTime}
                                {destination.departureTime && ` - ${destination.departureTime}`}
                              </span>
                            )}
                          </div>
                          {destination.notes && (
                            <p className="text-sm text-gray-600 mt-2">{destination.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openActivityModal(destination.id)}
                            className="btn-secondary text-xs inline-flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Activity
                          </button>
                          <button
                            onClick={() => handleDeleteDestination(destination.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Activities */}
                      {activities.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Activities</h4>
                          <div className="space-y-3">
                            {activities.map(activity => (
                              <div key={activity.id} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">{activity.name}</span>
                                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                                      {activity.category}
                                    </span>
                                  </div>
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {activity.startTime}
                                      {activity.endTime && ` - ${activity.endTime}`}
                                    </span>
                                    <span className="flex items-center font-medium">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      {formatCurrency(activity.cost)}
                                    </span>
                                  </div>
                                  {activity.notes && (
                                    <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="text-red-600 hover:text-red-700 p-1 ml-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <BudgetTracker budgetSummary={budgetSummary} />
          
          {/* Collaboration */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Collaboration</h3>
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-center py-4">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">Share this trip with friends and family to plan together</p>
              <button
                onClick={handleShare}
                className="btn-primary w-full text-sm"
              >
                Share Trip Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDestinationModal
        isOpen={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        onAdd={handleAddDestination}
      />

      <AddActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onAdd={handleAddActivity}
        destinationId={selectedDestinationId}
        destinationName={selectedDestination?.name || ''}
      />
    </div>
  );
}