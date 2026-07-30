'use client';

import { useState, useEffect } from'react';
import { useRouter } from'next/navigation';
import api from'@/lib/api';
import { User } from'@/types';
import { isLoggedIn, setAuth, getToken } from'@/lib/auth';
import toast from'react-hot-toast';
import Loader from'@/components/ui/Loader';
import { User as UserIcon, Lock, MapPin, Phone, Save } from'lucide-react';

export default function ProfilePage() {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [isChangingPw, setIsChangingPw] = useState(false);
 const router = useRouter();

 const [form, setForm] = useState({
 name:'',
 phone:'',
 street:'',
 city:'',
 province:'',
 postalCode:'',
 });

 const [pwForm, setPwForm] = useState({
 currentPassword:'',
 newPassword:'',
 confirmPassword:'',
 });

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push('/auth/login?redirect=/profile');
 return;
 }
 api.get('/api/auth/me')
 .then((res) => {
 const u: User = res.data.data;
 setUser(u);
 setForm({
 name: u.name ||'',
 phone: u.phone ||'',
 street: u.address?.street ||'',
 city: u.address?.city ||'',
 province: u.address?.province ||'',
 postalCode: u.address?.postalCode ||'',
 });
 })
 .finally(() => setIsLoading(false));
 }, [router]);

 const handleSaveProfile = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSaving(true);
 try {
 const res = await api.put('/api/auth/me', {
 name: form.name,
 phone: form.phone,
 address: {
 street: form.street,
 city: form.city,
 province: form.province,
 postalCode: form.postalCode,
 },
 });
 setUser(res.data.data);
 const token = getToken();
 if (token) setAuth(token, res.data.data);
 toast.success('Profil berhasil diperbarui');
 } catch {
 toast.error('Gagal memperbarui profil');
 } finally {
 setIsSaving(false);
 }
 };

 const handleChangePassword = async (e: React.FormEvent) => {
 e.preventDefault();
 if (pwForm.newPassword !== pwForm.confirmPassword) {
 toast.error('Konfirmasi password tidak cocok');
 return;
 }
 setIsChangingPw(true);
 try {
 await api.put('/api/auth/change-password', {
 currentPassword: pwForm.currentPassword,
 newPassword: pwForm.newPassword,
 });
 toast.success('Password berhasil diubah');
 setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } } };
 toast.error(err.response?.data?.message ||'Gagal mengubah password');
 } finally {
 setIsChangingPw(false);
 }
 };

 if (isLoading) return <Loader text="Memuat profil..." />;
 if (!user) return null;

 const inputClass =
'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors';

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
 <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
 <UserIcon className="w-6 h-6" />
 Profil Saya
 </h1>

 {/* Informasi Akun */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
 <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
 <UserIcon className="w-4 h-4" /> Informasi Akun
 </h2>
 <p className="text-xs text-gray-500 mb-4">
 Email: <span className="font-medium text-gray-700">{user.email}</span>
 </p>
 <form onSubmit={handleSaveProfile} className="space-y-4">
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">
 Nama Lengkap
 </label>
 <input
 type="text"
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 required
 className={inputClass}
 />
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
 <Phone className="w-3 h-3" /> Nomor Telepon
 </label>
 <input
 type="tel"
 value={form.phone}
 onChange={(e) => setForm({ ...form, phone: e.target.value })}
 placeholder="08xxxxxxxxxx"
 className={inputClass}
 />
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
 <MapPin className="w-3 h-3" /> Alamat
 </label>
 <div className="space-y-3">
 <input
 type="text"
 value={form.street}
 onChange={(e) => setForm({ ...form, street: e.target.value })}
 placeholder="Nama jalan & nomor"
 className={inputClass}
 />
 <div className="grid grid-cols-2 gap-3">
 <input
 type="text"
 value={form.city}
 onChange={(e) => setForm({ ...form, city: e.target.value })}
 placeholder="Kota"
 className={inputClass}
 />
 <input
 type="text"
 value={form.province}
 onChange={(e) => setForm({ ...form, province: e.target.value })}
 placeholder="Provinsi"
 className={inputClass}
 />
 </div>
 <input
 type="text"
 value={form.postalCode}
 onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
 placeholder="Kode Pos"
 className={inputClass}
 />
 </div>
 </div>
 <button
 type="submit"
 disabled={isSaving}
 className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 <Save className="w-4 h-4" />
 {isSaving ?'Menyimpan...' :'Simpan Perubahan'}
 </button>
 </form>
 </div>

 {/* Ubah Password */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Lock className="w-4 h-4" /> Ubah Password
 </h2>
 <form onSubmit={handleChangePassword} className="space-y-4">
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">
 Password Saat Ini
 </label>
 <input
 type="password"
 value={pwForm.currentPassword}
 onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
 required
 className={inputClass}
 />
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">
 Password Baru <span className="text-gray-400">(min. 6 karakter)</span>
 </label>
 <input
 type="password"
 value={pwForm.newPassword}
 onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
 required
 minLength={6}
 className={inputClass}
 />
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">
 Konfirmasi Password Baru
 </label>
 <input
 type="password"
 value={pwForm.confirmPassword}
 onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
 required
 className={inputClass}
 />
 </div>
 <button
 type="submit"
 disabled={isChangingPw}
 className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 <Lock className="w-4 h-4" />
 {isChangingPw ?'Mengubah...' :'Ubah Password'}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
}
