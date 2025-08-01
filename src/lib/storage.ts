import { TripPlan, BudgetSummary } from '@/types';

const STORAGE_KEY = 'ghumakad_trip_plans';

export const tripStorage = {
  // Get all trip plans
  getTripPlans(): TripPlan[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading trip plans:', error);
      return [];
    }
  },

  // Save trip plan
  saveTripPlan(tripPlan: TripPlan): void {
    if (typeof window === 'undefined') return;
    try {
      const plans = this.getTripPlans();
      const existingIndex = plans.findIndex(plan => plan.id === tripPlan.id);
      
      if (existingIndex >= 0) {
        plans[existingIndex] = { ...tripPlan, updatedAt: new Date().toISOString() };
      } else {
        plans.push(tripPlan);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving trip plan:', error);
    }
  },

  // Get trip plan by ID
  getTripPlan(id: string): TripPlan | null {
    const plans = this.getTripPlans();
    return plans.find(plan => plan.id === id) || null;
  },

  // Delete trip plan
  deleteTripPlan(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const plans = this.getTripPlans().filter(plan => plan.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
      console.error('Error deleting trip plan:', error);
    }
  },

  // Calculate budget summary
  calculateBudgetSummary(tripPlan: TripPlan): BudgetSummary {
    const totalSpent = tripPlan.activities.reduce((sum, activity) => sum + activity.cost, 0);
    const remaining = tripPlan.budget - totalSpent;

    const categories: { [key: string]: { budgeted: number; spent: number } } = {};
    
    tripPlan.activities.forEach(activity => {
      if (!categories[activity.category]) {
        categories[activity.category] = { budgeted: 0, spent: 0 };
      }
      categories[activity.category].spent += activity.cost;
    });

    return {
      totalBudget: tripPlan.budget,
      totalSpent,
      remaining,
      categories
    };
  }
};

// Utility functions
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};