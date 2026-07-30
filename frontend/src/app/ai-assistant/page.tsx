'use client';

import { useState, useRef, useEffect } from'react';
import api, { getImageUrl } from'@/lib/api';
import { AIAssistantResponse, Product } from'@/types';
import { Send, Bot, User, Sparkles, RefreshCw } from'lucide-react';
import { AILoader } from'@/components/ui/Loader';
import ReactMarkdown from'react-markdown';
import Link from'next/link';
import { formatPrice } from'@/lib/auth';
import Image from'next/image';

interface Message {
 role:'user' |'assistant';
 content: string;
 relatedProducts?: Partial<Product>[];
 timestamp: Date;
}

const QUICK_QUESTIONS = [
'HP gaming terbaik di bawah 5 juta?',
'Laptop tipis untuk desainer?',
'Headphone noise cancelling terbaik?',
'Kamera mirrorless untuk pemula?',
'Smart TV 55 inch terbaik?',
];

export default function AIAssistantPage() {
 const [messages, setMessages] = useState<Message[]>([
 {
 role:'assistant',
 content:'Halo! Saya adalah AI Assistant ElektroniKu 🤖\n\nSaya bisa membantu Anda menemukan produk elektronik yang tepat. Tanya apa saja tentang produk kami!',
 timestamp: new Date(),
 },
 ]);
 const [input, setInput] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages]);

 const sendMessage = async (messageText?: string) => {
 const text = messageText || input.trim();
 if (!text || isLoading) return;

 const userMessage: Message = {
 role:'user',
 content: text,
 timestamp: new Date(),
 };

 setMessages((prev) => [...prev, userMessage]);
 setInput('');
 setIsLoading(true);

 try {
 const res = await api.post<{ success: boolean; data: AIAssistantResponse }>('/api/ai/assistant', {
 message: text,
 });

 const assistantMessage: Message = {
 role:'assistant',
 content: res.data.data.answer,
 relatedProducts: res.data.data.relatedProducts,
 timestamp: new Date(),
 };

 setMessages((prev) => [...prev, assistantMessage]);
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } } };
 setMessages((prev) => [
 ...prev,
 {
 role:'assistant',
 content: `Maaf, saya sedang mengalami gangguan teknis. ${err.response?.data?.message ||'Coba lagi dalam beberapa saat.'}`,
 timestamp: new Date(),
 },
 ]);
 } finally {
 setIsLoading(false);
 }
 };

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key ==='Enter' && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
 };

 const clearChat = () => {
 setMessages([{
 role:'assistant',
 content:'Chat baru dimulai! Tanya saya tentang produk elektronik apapun.',
 timestamp: new Date(),
 }]);
 };

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
 <Bot className="w-6 h-6 text-gray-700" />
 </div>
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 AI Product Assistant
 <Sparkles className="w-4 h-4 text-yellow-400" />
 </h1>
 <p className="text-sm text-gray-500">Powered by Ollama AI</p>
 </div>
 </div>
 <button
 onClick={clearChat}
 className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
 >
 <RefreshCw className="w-4 h-4" />
 Bersihkan
 </button>
 </div>

 {/* Chat Container */}
 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
 {/* Messages */}
 <div className="h-[500px] overflow-y-auto p-4 space-y-4">
 {messages.map((msg, i) => (
 <div key={i} className={`flex gap-3 ${msg.role ==='user' ?'flex-row-reverse' :''}`}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role ==='user' ?'bg-gray-100' :'bg-gray-100'}`}>
 {msg.role ==='user' ? (
 <User className="w-4 h-4 text-gray-900" />
 ) : (
 <Bot className="w-4 h-4 text-gray-700" />
 )}
 </div>
 <div className={`flex-1 max-w-[80%] ${msg.role ==='user' ?'items-end' :'items-start'} flex flex-col gap-1`}>
 <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role ==='user' ?'bg-blue-600 text-white rounded-tr-sm' :'bg-gray-50 text-gray-800 rounded-tl-sm'}`}>
 {msg.role ==='assistant' ? (
 <div className="prose prose-sm max-w-none">
 <ReactMarkdown>{msg.content}</ReactMarkdown>
 </div>
 ) : (
 msg.content
 )}
 </div>

 {/* Related Products */}
 {msg.relatedProducts && msg.relatedProducts.length > 0 && (
 <div className="mt-2 w-full">
 <p className="text-xs text-gray-500 mb-2">Produk relevan:</p>
 <div className="flex gap-2 overflow-x-auto pb-1">
 {msg.relatedProducts.map((p) => (
 <Link
 key={p._id}
 href={`/catalog/${p._id}`}
 className="shrink-0 bg-white border border-gray-100 rounded-xl p-2 w-36 hover:shadow-md transition-shadow"
 >
 {p.images?.[0] && (
 <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-1">
 <Image src={getImageUrl(p.images[0])} alt={p.name ||''} fill className="object-cover" />
 </div>
 )}
 <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-0.5">{p.name}</p>
 <p className="text-xs text-gray-900 font-semibold">
 {p.price ? formatPrice(p.price) :'-'}
 </p>
 </Link>
 ))}
 </div>
 </div>
 )}

 <span className="text-xs text-gray-400">
 {msg.timestamp.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
 </span>
 </div>
 </div>
 ))}

 {isLoading && (
 <div className="flex gap-3">
 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
 <Bot className="w-4 h-4 text-gray-700" />
 </div>
 <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
 <AILoader />
 </div>
 </div>
 )}

 <div ref={messagesEndRef} />
 </div>

 {/* Quick Questions */}
 <div className="px-4 py-3 border-t border-gray-100 overflow-x-auto">
 <div className="flex gap-2">
 {QUICK_QUESTIONS.map((q, i) => (
 <button
 key={i}
 onClick={() => sendMessage(q)}
 disabled={isLoading}
 className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
 >
 {q}
 </button>
 ))}
 </div>
 </div>

 {/* Input */}
 <div className="p-4 border-t border-gray-100">
 <div className="flex gap-3">
 <textarea
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyPress={handleKeyPress}
 placeholder="Tanya tentang produk elektronik..."
 rows={1}
 className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 resize-none focus:outline-none focus:outline-none focus:border-gray-400"
 />
 <button
 onClick={() => sendMessage()}
 disabled={!input.trim() || isLoading}
 className="p-3 bg-gray-100 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
 >
 <Send className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
