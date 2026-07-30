'use client';

import { useEffect } from'react';
import { AlertTriangle, RefreshCw } from'lucide-react';

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 console.error(error);
 }, [error]);

 return (
 <div className="min-h-screen bg-white flex items-center justify-center px-4">
 <div className="text-center">
 <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 Terjadi Kesalahan
 </h1>
 <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
 Sesuatu tidak berjalan dengan benar. Silakan coba lagi.
 </p>
 <button
 onClick={reset}
 className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
 >
 <RefreshCw className="w-4 h-4" /> Coba Lagi
 </button>
 </div>
 </div>
 );
}
