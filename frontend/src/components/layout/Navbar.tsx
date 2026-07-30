'use client';

import { useState } from'react';
import Link from'next/link';
import { useRouter } from'next/navigation';
import {
 Heart,
 Search,
 Menu,
 X,
 User,
 LogOut,
 LayoutDashboard,
 Cpu,
} from'lucide-react';
import { useAuth } from'@/hooks/useAuth';
import { clearAuth } from'@/lib/auth';
import toast from'react-hot-toast';

export default function Navbar() {
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');

 const { user, isLoggedIn, isAdmin } = useAuth();
 const router = useRouter();

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
 <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 <Link href="/" className="flex items-center gap-2 text-gray-900 font-bold text-xl shrink-0 tracking-tight">
 <Cpu className="w-5 h-5 text-blue-600" />
 <span>ElektroniKu</span>
 </Link>

 <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
 <div className="relative w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Cari produk elektronik..."
 className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg transition-colors"
 />
 </div>
 </form>

 <div className="hidden md:flex items-center gap-1">
 <Link
 href="/ai-assistant"
 className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
 >
 <span>🤖</span>
 <span>AI</span>
 </Link>

 {isLoggedIn ? (
 <>
 <Link href="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors" title="Wishlist">
 <Heart className="w-5 h-5" />
 </Link>
 {isAdmin && (
 <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title="Dashboard Admin">
 <LayoutDashboard className="w-5 h-5" />
 </Link>
 )}
 <div className="relative group">
 <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-colors">
 <User className="w-4 h-4" />
 <span className="max-w-[80px] truncate">{user?.name}</span>
 </button>
 <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
 <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
 Profil Saya
 </Link>
 <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
 Pesanan Saya
 </Link>
 <button
 onClick={handleLogout}
 className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 w-full"
 >
 <LogOut className="w-4 h-4" />
 Keluar
 </button>
 </div>
 </div>
 </>
 ) : (
 <div className="flex items-center gap-2">
 <Link href="/auth/login" className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
 Masuk
 </Link>
 <Link href="/auth/register" className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
 Daftar
 </Link>
 </div>
 )}
 </div>

 <button
 className="md:hidden p-2 rounded-lg hover:bg-gray-100"
 onClick={() => setIsMenuOpen(!isMenuOpen)}
 >
 {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>

 <form onSubmit={handleSearch} className="md:hidden pb-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Cari produk..."
 className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
 />
 </div>
 </form>
 </div>

 {isMenuOpen && (
 <div className="md:hidden border-t border-gray-100 bg-white py-3 px-4 space-y-1">
 <Link href="/catalog" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>
 Katalog Produk
 </Link>
 <Link href="/ai-assistant" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>
 🤖 AI Assistant
 </Link>
 {isLoggedIn ? (
 <>
 <Link href="/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>Profil Saya</Link>
 <Link href="/orders" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>Pesanan Saya</Link>
 <Link href="/wishlist" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
 {isAdmin && (
 <Link href="/admin" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>Dashboard Admin</Link>
 )}
 <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-500">
 Keluar
 </button>
 </>
 ) : (
 <>
 <Link href="/auth/login" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
 <Link href="/auth/register" className="block px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm text-center font-medium" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
 </>
 )}
 </div>
 )}
 </nav>
 );
}
