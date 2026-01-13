// src/components/LoadingSkeleton.tsx
export function LoadingSkeleton({ count = 1 }: { count?: number }) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        ))}
      </>
    );
  }
  
 
