import Link from 'next/link';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-4 tracking-tight">
              <Cpu className="w-5 h-5" />
              ElektroniKu
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-gray-500">
              Platform belanja elektronik dengan teknologi AI untuk membantu menemukan produk yang tepat.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-4">Navigasi</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/catalog" className="hover:text-white transition-colors">Katalog Produk</Link></li>
              <li><Link href="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Bandingkan Produk</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Keranjang</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-4">Kategori</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/catalog?category=smartphone" className="hover:text-white transition-colors">Smartphone</Link></li>
              <li><Link href="/catalog?category=laptop" className="hover:text-white transition-colors">Laptop</Link></li>
              <li><Link href="/catalog?category=headphone" className="hover:text-white transition-colors">Headphone</Link></li>
              <li><Link href="/catalog?category=kamera" className="hover:text-white transition-colors">Kamera</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-center text-gray-600">
          © {new Date().getFullYear()} ElektroniKu — Dibuat dengan Next.js, Express.js & Ollama AI
        </div>
      </div>
    </footer>
  );
}
