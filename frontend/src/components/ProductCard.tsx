// src/components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="aspect-[3/4] relative bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-1">
          {product.title}
        </h3>
        
        {product.author && (
          <p className="text-sm text-gray-600 mb-2">{product.author}</p>
        )}
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(product.price, product.currency)}
          </p>
          
          {product.detail?.ratingsAvg && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium text-gray-700">
                {product.detail.ratingsAvg.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

