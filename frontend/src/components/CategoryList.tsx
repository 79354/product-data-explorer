import Link from 'next/link';
import { Category } from '@/types';
import { FolderIcon } from '@heroicons/react/24/outline';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-5">
          <Link
            href={`/products?categoryId=${category.id}`}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <FolderIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.productCount} products
                </p>
              </div>
            </div>
          </Link>
          
          {category.children && category.children.length > 0 && (
            <div className="mt-4 ml-9 space-y-2">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/products?categoryId=${child.id}`}
                  className="block text-sm text-gray-600 hover:text-blue-600"
                >
                  → {child.title} ({child.productCount})
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

