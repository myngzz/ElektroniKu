'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Order } from '@/types';
import { isLoggedIn, isAdmin, formatPrice, formatDate } from '@/lib/auth';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/Loader';
import { ShoppingCart, RefreshCw } from 'lucide-react';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  processing: { label: 'Diproses', color: 'bg-gray-100 text-gray-900 dark:text-white dark:bg-zinc-800/30 dark:text-gray-500' },
  shipped: { label: 'Dikirim', color: 'bg-gray-100 text-gray-900 dark:text-white dark:bg-gray-800/30 dark:text-gray-900 dark:text-white' },
  delivered: { label: 'Diterima', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/orders');
      setOrders(res.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/api/admin/orders/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: status as Order['status'] } : o));
      toast.success('Status pesanan diperbarui');
    } catch {
      toast.error('Gagal memperbarui status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Loader text="Memuat pesanan..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            Manajemen Pesanan
          </h1>
          <button onClick={fetchOrders} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['No. Pesanan', 'Tanggal', 'Pembeli', 'Items', 'Total', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => {
                  const st = statusLabel[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
                  const user = typeof order.user === 'object' ? order.user : null;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-mono text-gray-900 dark:text-white">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-500">{order.items.length} item</td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={updatingId === order._id}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{statusLabel[s]?.label || s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-400">Belum ada pesanan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
