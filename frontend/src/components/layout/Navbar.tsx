'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
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
    <nav className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-xl shrink-0 tracking-tight">
            <Cpu className="w-5 h-5" />
            <span>ElektroniKu</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk elektronik..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-900 dark:focus:border-white rounded-lg transition-colors"
              />
            </div>
          </form>

          {/* Nav Actions - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Toggle dark mode"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <span className="w-5 h-5 block" />}
            </button>

            <Link
              href="/ai-assistant"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              <span>🤖</span>
              <span>AI</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title="Wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/cart" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title="Keranjang">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title="Dashboard Admin">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    <User className="w-4 h-4" />
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
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
                <Link href="/auth/register" className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium transition-colors">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-white"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black py-3 px-4 space-y-1">
          <Link href="/catalog" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>
            Katalog Produk
          </Link>
          <Link href="/ai-assistant" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>
            🤖 AI Assistant
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/cart" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Keranjang</Link>
              <Link href="/wishlist" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Dashboard Admin</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
              <Link href="/auth/register" className="block px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm text-center" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
            </>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm w-full"
          >
            {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4 block" />}
            <span>{mounted ? (theme === 'dark' ? 'Mode Terang' : 'Mode Gelap') : 'Mode Gelap'}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
