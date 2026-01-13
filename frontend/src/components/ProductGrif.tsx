import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { LoadingSkeleton } from './LoadingSkeleton';
  
    interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    }
  
  export function ProductGrid({ products, isLoading }: ProductGridProps) {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton count={8} />
        </div>
      );
    }
  
    if (products.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }
