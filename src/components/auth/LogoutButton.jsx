import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, AlertTriangle } from 'lucide-react';

export default function LogoutButton({ className = "" }) {
  const { logout } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleLogout = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      // Tự động tắt trạng thái xác nhận sau 3 giây nếu người dùng không bấm nữa
      setTimeout(() => setIsConfirming(false), 3000);
      return;
    }

    logout();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <button 
      onClick={handleLogout} 
      className={`flex items-center justify-center space-x-2 p-4 rounded-2xl font-black transition-all duration-300 border ${
        isConfirming 
          ? "bg-red-600 text-white border-red-600 hover:bg-red-700 scale-105" 
          : "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
      } ${className}`}
    >
      {isConfirming ? (
        <>
          <AlertTriangle size={20} />
          <span>Xác nhận đăng xuất?</span>
        </>
      ) : (
        <>
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </>
      )}
    </button>
  );
}