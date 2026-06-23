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
      case 'admin': return 'Quản trị viên';
      default: return role || 'Nhân viên';
    }
  };

  const roleDisplay = getRoleName(user.role);

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto h-full bg-slate-50 mb-14 sm:mb-0">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Thông tin tài khoản</h1>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 max-w-lg mx-auto space-y-4">
        
        {/* Khối chung: Số điện thoại */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</p>
          <p className="font-bold text-slate-900 mt-0.5">{user.phoneNumber}</p>
        </div>

        {/* Khối chung: Họ và tên (Có trạng thái chỉnh sửa) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</p>
              {isEditing ? (
                <input 
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <p className="font-bold text-slate-900 mt-0.5">{name || "Chưa cập nhật"}</p>
              )}
            </div>
            <button 
              onClick={() => isEditing ? handleUpdateName() : setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isEditing ? <CheckCircle size={18} className={isSaving ? "animate-spin" : ""} /> : <Edit2 size={18} />}
            </button>
          </div>
        </div>

        {/* Khối chung: Vai trò */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</p>
            <p className="font-bold text-slate-900 mt-0.5">{roleDisplay}</p>
        </div>

       <div className="pt-4">
  <LogoutButton 
    className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 justify-center font-bold" 
  />
</div>
      </div>
    </div>
  );
}