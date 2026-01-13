
 import Link from 'next/link';
 import { Navigation } from '@/types';
 import { BookOpenIcon } from '@heroicons/react/24/outline';
 
 interface NavigationGridProps {
   items: Navigation[];
 }
 
 export function NavigationGrid({ items }: NavigationGridProps) {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {items.map((nav) => (
         <Link
           key={nav.id}
           href={`/category/${nav.slug}`}
           className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
         >
           <div className="flex items-center space-x-3 mb-3">
             <BookOpenIcon className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
             <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
               {nav.title}
             </h3>
           </div>
           {nav.categories && nav.categories.length > 0 && (
             <p className="text-sm text-gray-600">
               {nav.categories.length} {nav.categories.length === 1 ? 'category' : 'categories'}
             </p>
           )}
         </Link>
       ))}
     </div>
   );
 }
 
 
