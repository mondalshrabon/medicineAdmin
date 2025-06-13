import React from 'react';

export default function CategoryLoad() { 
    return ( <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center"> 
<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4"> 
{/* Add Category Form Skeleton */} 
<div className="bg-white p-6 rounded-2xl shadow-md animate-pulse">
     <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div> 
     <div className="space-y-4">
         <div className="h-10 bg-gray-300 rounded-xl"></div>
          <div className="h-10 bg-gray-300 rounded-xl"></div>
           <div className="h-20 bg-gray-300 rounded-xl"></div> 
           <div className="h-20 bg-gray-200 border-dashed border-2 rounded-xl"></div> 
           <div className="h-12 bg-green-300 rounded-xl"></div>
            </div> 
            </div>
{/* Category List Skeleton */}
    <div className="bg-white p-6 rounded-2xl shadow-md animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
</div>

); }