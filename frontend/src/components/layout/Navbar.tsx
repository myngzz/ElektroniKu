'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Cpu,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clearAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.success('Berhasil keluar');
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0">
            <Cpu className="w-6 h-6" />
            <span>ElektroniKu</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk elektronik..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Nav Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              href="/ai-assistant"
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium transition-colors"
            >
              <span>🤖</span>
              <span>AI Assistant</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" title="Wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/cart" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" title="Keranjang">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" title="Dashboard Admin">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  Masuk
                </Link>
                <Link href="/auth/register" className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 px-4 space-y-1">
          <Link href="/catalog" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>
            Katalog Produk
          </Link>
          <Link href="/ai-assistant" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-purple-600" onClick={() => setIsMenuOpen(false)}>
            🤖 AI Assistant
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/cart" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Keranjang</Link>
              <Link href="/wishlist" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Dashboard Admin</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
              <Link href="/auth/register" className="block px-3 py-2 rounded-lg bg-blue-600 text-white text-sm text-center" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
            </>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm w-full"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
