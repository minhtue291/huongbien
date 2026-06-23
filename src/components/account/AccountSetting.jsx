import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, CheckCircle, Edit2, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import LogoutButton from '../auth/LogoutButton';

export default function AccountSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [isEditing, setIsEditing] = useState(false); // Chế độ chỉnh sửa
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdateName = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'authorized_users', user.phoneNumber);
      await updateDoc(userRef, { name: name });

      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsSaved(true);
      setIsEditing(false); // Thoát chế độ sửa
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Logic hiển thị vai trò
  const getRoleName = (role) => {
    switch (role) {
      case 'employee': return 'Nhân viên quèn';
      case 'captain': return 'Tổ trưởng';
      case 'admin': return 'Giám sát';
      default: return role || 'Nhân viên';
    }
  };

  const roleDisplay = getRoleName(user.role);

return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto h-full bg-slate-50 mb-14 sm:mb-0">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Quản Lý Tài Khoản</h1>
      </header>

      {/* Đã bỏ div bao quanh có class max-w-lg, mx-auto, space-y-4 */}
      <div className="space-y-4"> 
        
        {/* 1. Khối Số điện thoại */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
          <p className="font-bold text-slate-900 text-base">{user.phoneNumber}</p>
        </div>

        {/* 2. Khối Họ và tên */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Họ và tên</p>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                autoFocus
                className="flex-1 p-3 w-full bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <p className="flex-1 font-bold text-slate-900 truncate">{name || "Chưa cập nhật"}</p>
            )}
            <button
              onClick={() => isEditing ? handleUpdateName() : setIsEditing(true)}
              className={`px-6 py-3 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-95 ${
                isEditing ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isEditing ? (isSaving ? "Đang lưu..." : "Lưu") : "Sửa"}
            </button>
          </div>
        </div>

        {/* 3. Khối Vai trò */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vai trò</p>
              <p className="font-bold text-slate-900 text-base">{roleDisplay}</p>
            </div>
          </div>
        </div>

        {/* Nút Đăng xuất */}
        <div className="pt-2">
          <LogoutButton className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 justify-center font-bold py-4 rounded-2xl" />
        </div>
        
      </div>
    </div>
  );
}