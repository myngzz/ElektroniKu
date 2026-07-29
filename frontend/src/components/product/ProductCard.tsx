import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Zap } from 'lucide-react';
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
  const category = typeof product.category === 'object' ? product.category : null;
  const imageUrl = getImageUrl(product.images?.[0] || '');
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
        <Link href={`/catalog/${product._id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='40'%3E📦%3C/text%3E%3C/svg%3E";
            }}
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
            <Zap className="w-3 h-3" /> Unggulan
          </span>
        )}
        {/* Action buttons on hover */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAddToWishlist && (
            <button
              onClick={() => onAddToWishlist(product)}
              className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 transition-colors"
              title="Tambah ke wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {category && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {(category as { icon?: string; name: string }).icon} {(category as { name: string }).name}
          </span>
        )}
        <Link href={`/catalog/${product._id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-1 mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= Math.round(product.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1 mb-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mb-2">Sisa {product.stock} unit!</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mb-2">Stok habis</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onAddToCart && product.stock > 0 && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Keranjang
            </button>
          )}
          {showCompareButton && onToggleCompare && (
            <button
              onClick={() => onToggleCompare(product)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                isInCompare
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {isInCompare ? '✓ Dibandingkan' : 'Bandingkan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
