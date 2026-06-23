import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Loader2 } from 'lucide-react';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const validatePhone = (p) => {
        // Regex kiểm tra: bắt đầu bằng 0, chữ số thứ 2 là 3,5,7,8,9, tổng 10 số
        const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
        return phoneRegex.test(p);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Kiểm tra trường trống
        if (!phone.trim()) {
            setError("Vui lòng nhập số điện thoại");
            return;
        }

        // Kiểm tra định dạng số điện thoại
        if (!validatePhone(phone)) {
            setError("Số điện thoại không hợp lệ (Ví dụ: 0901234567)");
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await login(phone);
        if (result.success) {
            window.history.pushState({}, '', '/tables');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        // Thêm background với gradient mờ và hiệu ứng chấm bi nhẹ
        <div className="flex h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 p-4">

            <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 mb-4 bg-white rounded-3xl shadow-lg border border-slate-100 p-3 flex items-center justify-center">
                        <img
                            src="/pwa-192x192.png"
                            alt="Logo Nhà hàng"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">HƯƠNG BIỂN</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Hệ thống quản lý nhà hàng</p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-blue-500" size={20} />
                        <input
                            type="tel"
                            maxLength={10}
                            placeholder="Nhập số điện thoại"    
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all shadow-sm"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPhone(val);
                                setError(''); // Tắt lỗi ngay khi bắt đầu gõ
                            }}
                        // Đã bỏ thuộc tính "required" để tránh lỗi của trình duyệt
                        />
                    </div>

                    {/* Thông báo lỗi tùy chỉnh của riêng bạn */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Đăng nhập"}
                    </button>
                </form>
            </div>
        </div>
    );
}