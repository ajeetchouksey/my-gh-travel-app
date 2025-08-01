export interface Destination {
  id: string;
  name: string;
  location: string;
  date: string;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  destinationId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime?: string;
  cost: number;
  notes?: string;
  category: 'sightseeing' | 'dining' | 'accommodation' | 'transport' | 'entertainment' | 'other';
}

export interface TripPlan {
  id: string;
  name: string;
  description?: string;
  budget: number;
  startDate: string;
  endDate: string;
  destinations: Destination[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
  isShared: boolean;
  shareId?: string;
  collaborators?: string[];
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categories: {
    [category: string]: {
      budgeted: number;
      spent: number;
    };
  };
}