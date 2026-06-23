import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ className = "" }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Thay vì dùng window.location.href, ta dùng window.history
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <button 
  onClick={handleLogout} 
  className={`flex items-center space-x-2 p-3 rounded-xl font-bold transition-all bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 ${className}`}
>
  <LogOut size={20} />
  <span>Đăng xuất</span>
</button>
  );
}