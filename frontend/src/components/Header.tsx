import Link from 'next/link';
  import { HomeIcon } from '@heroicons/react/24/outline';
  
  export function Header() {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <HomeIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                Product Explorer
              </span>
            </Link>
  
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">
                All Products
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>
    );
  }
  
 
