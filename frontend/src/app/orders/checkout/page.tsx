'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Cart } from '@/types';
import { isLoggedIn, formatPrice } from '@/lib/auth';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/Loader';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/orders/checkout');
      return;
    }
    api.get('/api/cart')
      .then((res) => setCart(res.data.data))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const res = await api.post('/api/orders', {
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
        },
        notes: form.notes,
      });
      toast.success('Pesanan berhasil dibuat!');
      router.push(`/orders`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) return <Loader text="Memuat checkout..." />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500">Keranjang kosong. Tidak bisa checkout.</p>
        <Link href="/catalog" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">
          Kembali Belanja
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((s, item) => s + (typeof item.product === 'object' ? item.product.price : 0) * item.qty, 0);
  const shippingCost = 15000;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shipping form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Alamat Pengiriman</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Nama Penerima', required: true, placeholder: 'Nama lengkap' },
                    { key: 'phone', label: 'Nomor HP', required: true, placeholder: '08xxxxxxxxxx' },
                    { key: 'city', label: 'Kota', required: true, placeholder: 'Jakarta' },
                    { key: 'province', label: 'Provinsi', required: true, placeholder: 'DKI Jakarta' },
                    { key: 'postalCode', label: 'Kode Pos', required: true, placeholder: '12345' },
                  ].map(({ key, label, required, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label} {required && '*'}</label>
                      <input
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat Lengkap *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan (opsional)</label>
                    <input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Instruksi tambahan untuk kurir"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sticky top-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {cart.items.map((item, i) => {
                    const p = typeof item.product === 'object' ? item.product : null;
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 line-clamp-1 flex-1">{p?.name || 'Produk'} ×{item.qty}</span>
                        <span className="ml-2 text-gray-900 dark:text-white shrink-0">{formatPrice((p?.price || 0) * item.qty)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Ongkos Kirim</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                >
                  {isPlacingOrder ? 'Memproses...' : 'Buat Pesanan'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
