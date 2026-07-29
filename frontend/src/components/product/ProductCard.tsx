import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/auth';
import { getImageUrl } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  showCompareButton?: boolean;
  isInCompare?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  showCompareButton,
  isInCompare,
  onToggleCompare,
}: ProductCardProps) {
  const imageUrl = getImageUrl(product.images?.[0] || '');
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <Link href={`/catalog/${product._id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='48'%3E📷%3C/text%3E%3C/svg%3E";
            }}
          />
        </Link>
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">Unggulan</span>
          )}
        </div>
        {onAddToWishlist && (
          <button
            onClick={() => onAddToWishlist(product)}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 text-gray-500"
          >
            <Heart className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">{product.brand}</p>
        <Link href={`/catalog/${product._id}`}>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        {product.stock === 0 && <p className="text-xs text-red-500 mb-2">Stok habis</p>}
        {product.stock > 0 && product.stock <= 5 && <p className="text-xs text-orange-500 mb-2">Sisa {product.stock}</p>}
        <div className="flex gap-2">
          {onAddToCart && product.stock > 0 && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Beli
            </button>
          )}
          {showCompareButton && onToggleCompare && (
            <button
              onClick={() => onToggleCompare(product)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${isInCompare ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {isInCompare ? '✓ Dibandingkan' : 'Bandingkan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
