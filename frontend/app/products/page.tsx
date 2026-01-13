'use client';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/lib/api';
import { ProductGrid } from '@/components/ProductGrif';
import { Pagination } from '@/components/Pagination';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || undefined;
  const [page, setPage] = useState(1);
  
  const { products, meta, isLoading, isError } = useProducts(page, 20, categoryId);

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

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
        {meta && (
          <p className="text-lg text-gray-600">
            Showing {products.length} of {meta.total} products
          </p>
        )}
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to load products. Please try again.</p>
        </div>
      )}

      <ProductGrid products={products} isLoading={isLoading} />

      {meta && meta.totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
