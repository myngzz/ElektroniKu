import Image from'next/image';
import Link from'next/link';
import { Star, Heart } from'lucide-react';
import { Product } from'@/types';
import { formatPrice } from'@/lib/auth';
import { getImageUrl } from'@/lib/api';

interface ProductCardProps {
 product: Product;
 onAddToWishlist?: (product: Product) => void;
 showCompareButton?: boolean;
 isInCompare?: boolean;
 onToggleCompare?: (product: Product) => void;
}

export default function ProductCard({
 product,
 onAddToWishlist,
 showCompareButton,
 isInCompare,
 onToggleCompare,
}: ProductCardProps) {
 const imageUrl = getImageUrl(product.images?.[0] ||'');
 const discount = product.originalPrice && product.originalPrice > product.price
 ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
 : 0;

 return (
 <div className="group bg-white overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
 {/* Image */}
 <div className="relative aspect-square bg-gray-50 overflow-hidden">
 <Link href={`/catalog/${product._id}`} className="absolute inset-0">
 <Image
 src={imageUrl}
 alt={product.name}
 fill
 className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
 onError={(e) => {
 (e.target as HTMLImageElement).src ="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f9fafb'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' fill='%23d1d5db' font-size='64'%3E📷%3C/text%3E%3C/svg%3E";
 }}
 />
 </Link>
 <div className="absolute top-2 left-2 flex flex-col gap-1">
 {discount > 0 && (
 <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">-{discount}%</span>
 )}
 </div>
 {onAddToWishlist && (
 <button
 onClick={() => onAddToWishlist(product)}
 className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm"
 >
 <Heart className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 {/* Info */}
 <div className="p-4">
 <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>
 <Link href={`/catalog/${product._id}`}>
 <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 mb-2">
 {product.name}
 </h3>
 </Link>
 <div className="flex items-center gap-1 mb-3">
 <div className="flex">
 {[1,2,3,4,5].map((s) => (
 <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.avgRating) ?'text-yellow-400 fill-yellow-400' :'text-gray-200'}`} />
 ))}
 </div>
 <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
 </div>
 <div className="flex items-baseline gap-2 mb-3">
 <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
 {product.originalPrice && product.originalPrice > product.price && (
 <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
 )}
 </div>
 {product.stock === 0 && <p className="text-xs text-red-400 mb-2">Stok habis</p>}
 {product.stock > 0 && product.stock <= 5 && <p className="text-xs text-orange-500 mb-2">Sisa {product.stock}</p>}
 <div className="flex gap-2">
 <Link
 href={`/catalog/${product._id}`}
 className="flex-1 py-2 text-center text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
 >
 Lihat Detail
 </Link>
 {showCompareButton && onToggleCompare && (
 <button
 onClick={() => onToggleCompare(product)}
 className={`flex-1 py-2 text-xs font-medium border rounded transition-colors ${isInCompare ?'bg-blue-600 border-blue-600 text-white' :'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'}`}
 >
 {isInCompare ?'✓ Dipilih' :'Bandingkan'}
 </button>
 )}
 </div>
 </div>
 </div>
 );
}
