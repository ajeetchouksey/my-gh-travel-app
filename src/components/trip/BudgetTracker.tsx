'use client';

import { BudgetSummary } from '@/types';
import { formatCurrency } from '@/lib/storage';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface BudgetTrackerProps {
  budgetSummary: BudgetSummary;
}

export default function BudgetTracker({ budgetSummary }: BudgetTrackerProps) {
  const { totalBudget, totalSpent, remaining, categories } = budgetSummary;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Budget Tracker</h3>
        <DollarSign className="w-5 h-5 text-primary-600" />
      </div>

      {/* Budget Overview */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Budget</span>
          <span className="text-lg font-semibold text-gray-900">{formatCurrency(totalBudget)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Spent</span>
          <span className="text-lg font-semibold text-gray-900">{formatCurrency(totalSpent)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Remaining</span>
          <span className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isOverBudget ? 'bg-red-500' : spentPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
            {spentPercentage.toFixed(1)}% spent
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Budget Alert */}
      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800">
              You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
            </p>
          </div>
        </div>
      )}

      {spentPercentage > 80 && !isOverBudget && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-800">
              You've used {spentPercentage.toFixed(1)}% of your budget. Consider monitoring future expenses.
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categories).length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Expenses by Category</h4>
          <div className="space-y-3">
            {Object.entries(categories).map(([category, data]) => (
              <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(data.spent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalSpent === 0 && (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No expenses recorded yet</p>
          <p className="text-xs">Add activities with costs to track your spending</p>
        </div>
      )}
    </div>
  );
}