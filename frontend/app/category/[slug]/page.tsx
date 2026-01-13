"use client";

import { useCategoryBySlug, scrapeCategory } from '@/lib/api';
import { CategoryList } from '@/components/CategoryList';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

// In Next.js 14 with "use client", params is a plain object, not a Promise
export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params; // No use() needed - just destructure directly
  const { category, isLoading, isError, mutate } = useCategoryBySlug(slug);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await scrapeCategory(slug, true);
      await mutate();
    } catch (error) {
      console.error('Failed to refresh category:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isLoading ? 'Loading...' : category?.title || slug}
            </h1>
            {category?.categories && (
              <p className="text-lg text-gray-600">
                {category.categories.length} {category.categories.length === 1 ? 'category' : 'categories'}
              </p>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to load category. Please try again.</p>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : category?.categories && category.categories.length > 0 ? (
        <CategoryList categories={category.categories} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No categories found</p>
          <Link
            href={`/products?categoryId=${category?.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            View Products
          </Link>
        </div>
      )}
    </div>
  );
}
