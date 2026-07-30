'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product, Category, PaginatedResponse } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import Loader from '@/components/ui/Loader';
import { Filter, ChevronLeft, ChevronRight, SlidersHorizontal, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

function CatalogPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'createdAt',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.featured) params.featured = filters.featured;

      // Jika category adalah slug, cari ID-nya
      if (filters.category) {
        const cat = categories.find((c) => c.slug === filters.category || c._id === filters.category);
        if (cat) params.category = cat._id;
        else params.category = filters.category;
      }

      const res = await api.get<PaginatedResponse<Product>>('/api/products', { params });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Gagal memuat produk');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      const [catRes, brandRes] = await Promise.allSettled([
        api.get('/api/categories'),
        api.get('/api/products/brands'),
      ]);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data);
      if (brandRes.status === 'fulfilled') setBrands(brandRes.value.data.data);
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, categories]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/catalog');
      return;
    }
    try {
      await api.post('/api/cart', { productId: product._id, qty: 1 });
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menambah ke keranjang');
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/catalog');
      return;
    }
    try {
      await api.post('/api/wishlist', { productId: product._id });
      toast.success(`${product.name} ditambahkan ke wishlist`);
    } catch {
      toast.error('Gagal menambah ke wishlist');
    }
  };

  const activeFiltersCount = [filters.category, filters.brand, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleFilterChange('search', searchInput); }}
          className="flex gap-2 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk, merek, atau spesifikasi..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:outline-none focus:border-gray-900 dark:focus:border-white"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); handleFilterChange('search', ''); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button type="submit" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
            Cari
          </button>
        </form>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filters.search ? `Hasil: "${filters.search}"` : 'Katalog Produk'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {pagination.total} produk ditemukan
            </p>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter {activeFiltersCount > 0 && <span className="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <aside className={`${showFilter ? 'block' : 'hidden'} md:block w-64 shrink-0`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filter
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', sort: 'createdAt', search: '', featured: '', page: 1 })}
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Kategori */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-gray-50 dark:bg-zinc-800/30 text-gray-900 dark:text-white dark:text-gray-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleFilterChange('category', cat.slug)}
                      className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.category === cat.slug ? 'bg-gray-50 dark:bg-zinc-800/30 text-gray-900 dark:text-white dark:text-gray-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="">Semua Brand</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Harga */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rentang Harga</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urutkan</h3>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="createdAt">Terbaru</option>
                  <option value="price">Termurah</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="name">Nama A-Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <Loader text="Memuat produk..." />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-gray-500 dark:text-gray-400">Tidak ada produk yang ditemukan</p>
                <button
                  onClick={() => setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', sort: 'createdAt', search: '', featured: '', page: 1 })}
                  className="mt-3 text-gray-900 hover:underline text-sm"
                >
                  Reset filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      showCompareButton
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const p = i + Math.max(1, filters.page - 2);
                      if (p > pagination.pages) return null;
                      return (
                        <button
                          key={p}
                          onClick={() => handleFilterChange('page', p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === filters.page ? 'bg-gray-900 text-white' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleFilterChange('page', Math.min(pagination.pages, filters.page + 1))}
                      disabled={filters.page === pagination.pages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="text-center py-16"><div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-transparent rounded-full animate-spin" /></div>}>
      <CatalogPageInner />
    </Suspense>
  );
}
