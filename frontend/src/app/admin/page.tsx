'use client';

import { useState, useEffect } from'react';
import api from'@/lib/api';
import { isLoggedIn, isAdmin as checkAdmin, formatPrice } from'@/lib/auth';
import { useRouter } from'next/navigation';
import Loader from'@/components/ui/Loader';
import {
 Package, Users, ShoppingBag, DollarSign,
 TrendingUp, TrendingDown, AlertTriangle, Plus,
 Tag, MessageSquare, BookOpen
} from'lucide-react';
import Link from'next/link';
import {
 LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
 ResponsiveContainer, BarChart, Bar
} from'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

interface DashboardData {
 stats: {
 totalProducts: number;
 totalUsers: number;
 totalOrders: number;
 totalRevenue: number;
 thisMonthRevenue: number;
 revenueGrowth: number;
 ordersThisMonth: number;
 };
 recentOrders: Array<{
 _id: string;
 orderNumber: string;
 user: { name: string; email: string };
 total: number;
 status: string;
 createdAt: string;
 }>;
 topProducts: Array<{
 productName: string;
 brand: string;
 totalSold: number;
 revenue: number;
 }>;
 lowStockProducts: Array<{
 _id: string;
 name: string;
 brand: string;
 stock: number;
 }>;
 charts: {
 revenueByMonth: Array<{
 _id: { year: number; month: number };
 total: number;
 orders: number;
 }>;
 };
}

const STATUS_COLORS: Record<string, string> = {
 pending:'bg-yellow-100 text-yellow-700',
 confirmed:'bg-blue-100 text-blue-700',
 processing:'bg-purple-100 text-purple-700',
 shipped:'bg-indigo-100 text-indigo-700',
 delivered:'bg-green-100 text-green-700',
 cancelled:'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
 const [data, setData] = useState<DashboardData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
 if (!isLoggedIn() || !checkAdmin()) {
 router.push('/auth/login');
 return;
 }
 const fetchDashboard = async () => {
 try {
 const res = await api.get('/api/admin/dashboard');
 setData(res.data.data);
 } finally {
 setIsLoading(false);
 }
 };
 fetchDashboard();
 }, [router]);

 if (isLoading) return <Loader text="Memuat dashboard..." />;
 if (!data) return null;

 const chartData = data.charts.revenueByMonth.map((r) => ({
 name: MONTHS[r._id.month - 1],
 pendapatan: r.total,
 order: r.orders,
 }));

 const statCards = [
 {
 label:'Total Produk',
 value: data.stats.totalProducts,
 icon: Package,
 color:'bg-gray-100 text-gray-900',
 },
 {
 label:'Total Pengguna',
 value: data.stats.totalUsers,
 icon: Users,
 color:'bg-green-100 text-green-600',
 },
 {
 label:'Total Pesanan',
 value: data.stats.totalOrders,
 icon: ShoppingBag,
 color:'bg-gray-100 text-gray-700',
 },
 {
 label:'Total Pendapatan',
 value: formatPrice(data.stats.totalRevenue),
 icon: DollarSign,
 color:'bg-yellow-100 text-yellow-600',
 },
 ];

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
 <p className="text-sm text-gray-500 mt-1">Selamat datang kembali!</p>
 </div>
 <Link
 href="/admin/products/new"
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
 >
 <Plus className="w-4 h-4" />
 Tambah Produk
 </Link>
 </div>

 {/* Stat Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
 {statCards.map((card) => (
 <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
 <div className={`inline-flex p-2.5 rounded-xl mb-3 ${card.color}`}>
 <card.icon className="w-5 h-5" />
 </div>
 <p className="text-xs text-gray-500 mb-1">{card.label}</p>
 <p className="text-xl font-bold text-gray-900">{card.value}</p>
 </div>
 ))}
 </div>

 {/* Revenue Growth */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
 <div className="bg-white rounded-2xl border border-gray-100 p-5">
 <p className="text-sm text-gray-500 mb-1">Pendapatan Bulan Ini</p>
 <p className="text-2xl font-bold text-gray-900 mb-1">{formatPrice(data.stats.thisMonthRevenue)}</p>
 <div className="flex items-center gap-1">
 {data.stats.revenueGrowth >= 0 ? (
 <TrendingUp className="w-4 h-4 text-green-500" />
 ) : (
 <TrendingDown className="w-4 h-4 text-red-500" />
 )}
 <span className={`text-xs font-medium ${data.stats.revenueGrowth >= 0 ?'text-green-500' :'text-red-500'}`}>
 {Math.abs(data.stats.revenueGrowth)}% dari bulan lalu
 </span>
 </div>
 </div>
 <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
 <p className="font-semibold text-gray-900 mb-4">Pendapatan 6 Bulan Terakhir</p>
 {chartData.length > 0 ? (
 <ResponsiveContainer width="100%" height={150}>
 <LineChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
 <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
 <Tooltip formatter={(v) => formatPrice(Number(v))} />
 <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} dot={false} />
 </LineChart>
 </ResponsiveContainer>
 ) : (
 <p className="text-center text-sm text-gray-400 py-8">Belum ada data pendapatan</p>
 )}
 </div>
 </div>

 {/* Tables Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
 {/* Recent Orders */}
 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
 <div className="p-4 border-b border-gray-100 flex items-center justify-between">
 <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
 <Link href="/admin/orders" className="text-xs text-gray-900 hover:underline">Lihat semua</Link>
 </div>
 <div className="divide-y divide-gray-50">
 {data.recentOrders.length === 0 ? (
 <p className="text-center py-8 text-sm text-gray-400">Belum ada pesanan</p>
 ) : (
 data.recentOrders.map((order) => (
 <div key={order._id} className="p-4 flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
 <p className="text-xs text-gray-500">{order.user?.name}</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</p>
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ||''}`}>
 {order.status}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Top Products */}
 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
 <div className="p-4 border-b border-gray-100">
 <h2 className="font-semibold text-gray-900">Produk Terlaris</h2>
 </div>
 {data.topProducts.length === 0 ? (
 <p className="text-center py-8 text-sm text-gray-400">Belum ada data penjualan</p>
 ) : (
 <div className="p-4">
 <ResponsiveContainer width="100%" height={180}>
 <BarChart data={data.topProducts.slice(0, 5)} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
 <XAxis type="number" tick={{ fontSize: 11 }} />
 <YAxis dataKey="productName" type="category" width={100} tick={{ fontSize: 10 }} />
 <Tooltip formatter={(v) => `${v} terjual`} />
 <Bar dataKey="totalSold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>

 {/* Low Stock Alert */}
 {data.lowStockProducts.length > 0 && (
 <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5">
 <div className="flex items-center gap-2 mb-4">
 <AlertTriangle className="w-5 h-5 text-orange-500" />
 <h2 className="font-semibold text-orange-800">Stok Menipis</h2>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
 {data.lowStockProducts.map((p) => (
 <Link
 key={p._id}
 href={`/admin/products/${p._id}`}
 className="bg-white rounded-xl p-3 border border-orange-100 hover:shadow-md transition-shadow"
 >
 <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</p>
 <p className="text-xs font-bold text-orange-600">Sisa: {p.stock}</p>
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Quick Links */}
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6">
 {[
 { label:'Kelola Produk', href:'/admin/products', icon: Package },
 { label:'Daftar User', href:'/admin/users', icon: Users },
 { label:'Semua Pesanan', href:'/admin/orders', icon: ShoppingBag },
 { label:'Kategori', href:'/admin/categories', icon: Tag },
 { label:'Moderasi Review', href:'/admin/reviews', icon: MessageSquare },
 { label:'Swagger API', href:'http://localhost:5000/api-docs', icon: BookOpen, external: true },
 ].map((link) => (
 <Link
 key={link.href}
 href={link.href}
 target={link.external ?'_blank' : undefined}
 className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
 >
 <link.icon className="w-6 h-6 mx-auto mb-2 text-gray-500" strokeWidth={1.5} />
 <span className="text-sm font-medium text-gray-700">{link.label}</span>
 </Link>
 ))}
 </div>
 </div>
 </div>
 );
}
