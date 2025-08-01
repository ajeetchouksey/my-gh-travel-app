import { useState, useEffect } from 'react';
import { TripPlan } from '@/types';
import { tripStorage } from '@/lib/storage';

export const useTripPlans = () => {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const plans = tripStorage.getTripPlans();
    setTripPlans(plans);
    setLoading(false);
  }, []);

  const saveTripPlan = (tripPlan: TripPlan) => {
    tripStorage.saveTripPlan(tripPlan);
    setTripPlans(tripStorage.getTripPlans());
  };

  const deleteTripPlan = (id: string) => {
    tripStorage.deleteTripPlan(id);
    setTripPlans(tripStorage.getTripPlans());
  };

  return {
    tripPlans,
    loading,
    saveTripPlan,
    deleteTripPlan,
  };
};

export const useTripPlan = (id: string | null) => {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const plan = tripStorage.getTripPlan(id);
      setTripPlan(plan);
    } else {
      setTripPlan(null);
    }
    setLoading(false);
  }, [id]);

  const updateTripPlan = (updatedPlan: TripPlan) => {
    tripStorage.saveTripPlan(updatedPlan);
    setTripPlan(updatedPlan);
  };

  return {
    tripPlan,
    loading,
    updateTripPlan,
  };
};