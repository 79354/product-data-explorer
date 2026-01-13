// src/app/products/[id]/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct, scrapeProduct } from '@/lib/api';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeftIcon, ArrowPathIcon, StarIcon } from '@heroicons/react/24/solid';

// Define the Review type
interface Review {
  id: string;
  author?: string;
  rating?: number;
  text?: string;
  reviewDate?: Date;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { product, isLoading, isError, mutate } = useProduct(id);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await scrapeProduct(id, true);
      await mutate();
    } catch (error) {
      console.error('Failed to refresh product:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load product. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/products"
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                title="Refresh product data"
              >
                <ArrowPathIcon className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {product.author && (
              <p className="text-xl text-gray-600 mb-4">by {product.author}</p>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <p className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price, product.currency)}
              </p>

              {product.detail?.ratingsAvg && (
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold text-gray-700">
                    {product.detail.ratingsAvg.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({product.detail.reviewsCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {product.detail?.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.detail.description}</p>
              </div>
            )}

            {product.detail?.specs && Object.keys(product.detail.specs).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Specifications</h2>
                <dl className="grid grid-cols-2 gap-3">
                  {Object.entries(product.detail.specs).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="text-sm text-gray-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View on World of Books
            </a>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {product.reviews.map((review: Review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{review.author || 'Anonymous'}</p>
                    {review.rating && (
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating! ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {review.text && <p className="text-gray-700">{review.text}</p>}
                  {review.reviewDate && (
                    <p className="text-sm text-gray-500 mt-2">{formatDate(review.reviewDate)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
