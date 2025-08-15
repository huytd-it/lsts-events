import React from 'react';

const Skeleton = ({ className = '', ...props }) => {
  return (
    <div 
      className={`skeleton bg-gray-200 rounded ${className}`} 
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-48" />
        <div className="absolute top-2 right-2 z-10">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};

export const TextSkeleton = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

export default Skeleton;