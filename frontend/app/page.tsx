'use client';
import { useNavigation, scrapeNavigation } from '@/lib/api';
import { NavigationGrid } from '@/components/NavigationGrid';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function HomePage() {
  const { navigation, isLoading, isError, mutate } = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await scrapeNavigation(true);
      await mutate();
    } catch (error) {
      console.error('Failed to refresh navigation:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Product Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Discover books and products from World of Books
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to load navigation. Please try again.</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} />
        </div>
      ) : navigation && navigation.length > 0 ? (
        <NavigationGrid items={navigation} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No navigation items found</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Load Data
          </button>
        </div>
      )}
    </div>
  );
}
