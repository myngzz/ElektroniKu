export function SkeletonBlock({ className ='' }: { className?: string }) {
 return (
 <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
 );
}

export function ProductCardSkeleton() {
 return (
 <div className="bg-white border border-gray-100 overflow-hidden">
 <div className="aspect-square bg-gray-100 animate-pulse" />
 <div className="p-4 space-y-2">
 <SkeletonBlock className="h-3 w-16" />
 <SkeletonBlock className="h-4 w-full" />
 <SkeletonBlock className="h-4 w-3/4" />
 <SkeletonBlock className="h-3 w-20 mt-1" />
 <SkeletonBlock className="h-5 w-24 mt-1" />
 <SkeletonBlock className="h-8 w-full mt-2 rounded" />
 </div>
 </div>
 );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
 return (
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
 {Array.from({ length: count }).map((_, i) => (
 <ProductCardSkeleton key={i} />
 ))}
 </div>
 );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
 return (
 <tr>
 {Array.from({ length: cols }).map((_, i) => (
 <td key={i} className="px-4 py-3">
 <SkeletonBlock className="h-4 w-full" />
 </td>
 ))}
 </tr>
 );
}
