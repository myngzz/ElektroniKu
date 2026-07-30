import Link from'next/link';
import { Search } from'lucide-react';

export default function NotFound() {
 return (
 <div className="min-h-screen bg-white flex items-center justify-center px-4">
 <div className="text-center">
 <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3">404</p>
 <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
 Halaman Tidak Ditemukan
 </h1>
 <p className="text-gray-500 mb-8 max-w-md mx-auto">
 Halaman yang Anda cari tidak ada atau telah dipindahkan.
 </p>
 <div className="flex items-center justify-center gap-3">
 <Link
 href="/"
 className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
 >
 Kembali ke Beranda
 </Link>
 <Link
 href="/catalog"
 className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
 >
 <Search className="w-4 h-4" /> Cari Produk
 </Link>
 </div>
 </div>
 </div>
 );
}
