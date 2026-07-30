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
    <div className="group bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <Link href={`/catalog/${product._id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f9fafb'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' fill='%23d1d5db' font-size='64'%3E📷%3C/text%3E%3C/svg%3E";
            }}
          />
        </Link>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-0.5 tracking-wide">-{discount}%</span>
          )}
        </div>
        {onAddToWishlist && (
          <button
            onClick={() => onAddToWishlist(product)}
            className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{product.brand}</p>
        <Link href={`/catalog/${product._id}`}>
          <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug hover:underline mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.avgRating) ? 'text-gray-900 dark:text-white fill-gray-900 dark:fill-white' : 'text-gray-200 dark:text-gray-700'}`} />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        {product.stock === 0 && <p className="text-xs text-gray-400 mb-2">Stok habis</p>}
        {product.stock > 0 && product.stock <= 5 && <p className="text-xs text-gray-500 mb-2">Sisa {product.stock}</p>}
        <div className="flex gap-2">
          {onAddToCart && product.stock > 0 && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Tambah
            </button>
          )}
          {showCompareButton && onToggleCompare && (
            <button
              onClick={() => onToggleCompare(product)}
              className={`flex-1 py-2 text-xs font-medium border transition-colors ${isInCompare ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white'}`}
            >
              {isInCompare ? '✓ Dipilih' : 'Bandingkan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
