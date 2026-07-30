export default function Loader({ text ='Memuat...' }: { text?: string }) {
 return (
 <div className="flex flex-col items-center justify-center py-16 gap-3">
 <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
 <p className="text-sm text-gray-500">{text}</p>
 </div>
 );
}

export function InlineLoader({ className ='' }: { className?: string }) {
 return (
 <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
 );
}

export function AILoader({ text ='AI sedang berpikir...' }: { text?: string }) {
 return (
 <div className="flex items-center gap-3 text-gray-700">
 <div className="flex gap-1">
 {[0, 1, 2].map((i) => (
 <div
 key={i}
 className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
 style={{ animationDelay: `${i * 0.15}s` }}
 />
 ))}
 </div>
 <span className="text-sm">{text}</span>
 </div>
 );
}
