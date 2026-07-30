'use client';

import { useState, useEffect, use } from'react';
import { useRouter } from'next/navigation';
import api, { getImageUrl } from'@/lib/api';
import { Order } from'@/types';
import { isLoggedIn, formatPrice, formatDate } from'@/lib/auth';
import Loader from'@/components/ui/Loader';
import { Package, ChevronLeft, MapPin, Truck, CheckCircle, Clock, XCircle } from'lucide-react';
import Link from'next/link';
import Image from'next/image';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
 pending: { label:'Menunggu Konfirmasi', color:'bg-yellow-100 text-yellow-700', icon: Clock },
 confirmed: { label:'Dikonfirmasi', color:'bg-blue-100 text-blue-700', icon: CheckCircle },
 processing: { label:'Sedang Diproses', color:'bg-purple-100 text-purple-700', icon: Package },
 shipped: { label:'Sedang Dikirim', color:'bg-indigo-100 text-indigo-700', icon: Truck },
 delivered: { label:'Sudah Diterima', color:'bg-green-100 text-green-700', icon: CheckCircle },
 cancelled: { label:'Dibatalkan', color:'bg-red-100 text-red-700', icon: XCircle },
};

const statusSteps = ['pending','confirmed','processing','shipped','delivered'];

interface PageProps {
 params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
 const { id } = use(params);
 const [order, setOrder] = useState<Order | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push('/auth/login?redirect=/orders/' + id);
 return;
 }
 api.get(`/api/orders/${id}`)
 .then((res) => setOrder(res.data.data))
 .catch(() => router.push('/orders'))
 .finally(() => setIsLoading(false));
 }, [id, router]);

 if (isLoading) return <Loader text="Memuat detail pesanan..." />;
 if (!order) return null;

 const status = statusConfig[order.status] || { label: order.status, color:'bg-gray-100 text-gray-700', icon: Package };
 const StatusIcon = status.icon;
 const isCancelled = order.status ==='cancelled';
 const currentStep = isCancelled ? -1 : statusSteps.indexOf(order.status);

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
 {/* Back */}
 <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
 <ChevronLeft className="w-4 h-4" /> Kembali ke Pesanan
 </Link>

 {/* Header */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
 <div className="flex items-start justify-between mb-3">
 <div>
 <p className="font-mono font-bold text-lg text-gray-900">{order.orderNumber}</p>
 <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
 </div>
 <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${status.color}`}>
 <StatusIcon className="w-3.5 h-3.5" />
 {status.label}
 </span>
 </div>

 {/* Progress tracker */}
 {!isCancelled && (
 <div className="mt-6">
 <div className="flex items-center justify-between relative">
 <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200" />
 <div
 className="absolute left-0 top-3 h-0.5 bg-blue-600 transition-all"
 style={{ width: currentStep >= 0 ? `${(currentStep / (statusSteps.length - 1)) * 100}%` :'0%' }}
 />
 {statusSteps.map((step, i) => (
 <div key={step} className="relative flex flex-col items-center gap-1 z-10">
 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
 i <= currentStep
 ?'bg-gray-900 border-gray-900 text-white'
 :'bg-white border-gray-200 text-gray-400'
 }`}>
 {i + 1}
 </div>
 <span className="text-[9px] text-gray-500 capitalize hidden sm:block">
 {statusConfig[step]?.label.split('')[0]}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Items */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
 <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Package className="w-4 h-4" /> Item Pesanan
 </h2>
 <div className="space-y-4">
 {order.items.map((item, i) => (
 <div key={i} className="flex gap-4">
 <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
 {item.image ? (
 <Image src={getImageUrl(item.image)} alt={item.name} width={64} height={64} className="object-contain w-full h-full p-1" />
 ) : (
 <div className="flex items-center justify-center h-full text-2xl">📦</div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
 <p className="text-xs text-gray-500 mt-0.5">{formatPrice(item.price)} × {item.qty}</p>
 </div>
 <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
 {formatPrice(item.price * item.qty)}
 </p>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
 {/* Shipping address */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
 <MapPin className="w-4 h-4" /> Alamat Pengiriman
 </h2>
 <div className="text-sm text-gray-600 space-y-0.5">
 <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
 {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
 <p>{order.shippingAddress.street}</p>
 <p>{order.shippingAddress.city}{order.shippingAddress.province ? `, ${order.shippingAddress.province}` :''}</p>
 {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
 </div>
 {order.notes && (
 <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
 Catatan: {order.notes}
 </p>
 )}
 </div>

 {/* Price breakdown */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <h2 className="font-semibold text-gray-900 mb-3">Rincian Harga</h2>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-500">Subtotal</span>
 <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-500">Ongkir</span>
 <span className="text-gray-900">
 {order.shippingCost > 0 ? formatPrice(order.shippingCost) :'Gratis'}
 </span>
 </div>
 <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
 <span className="text-gray-900">Total</span>
 <span className="text-gray-900">{formatPrice(order.total)}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
