import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { UserCheck, Coffee } from 'lucide-react';

export default function TableCard({ table }) {
  const { setActiveTableId, activeTable } = useRestaurant();
  
  // Rút gọn chỉ còn đúng 2 trạng thái: Có người (Occupied) và Trống (Available / mặc định)
  const isOccupied = table.status === 'occupied';
  const isSelected = activeTable?.id === table.id;

  // Tính tổng tiền hiện tại của bàn để hiển thị
  const currentTableTotal = table.currentOrder?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div 
      onClick={() => setActiveTableId(table.id)}
      className={`p-5 rounded-2xl border transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md relative flex flex-col justify-between h-32 cursor-pointer ${
        isOccupied 
          ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-600/20' // CÓ NGƯỜI: Background Xanh cực kỳ nổi bật
          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'     // TRỐNG: Màu xám trắng dịu mắt
      } ${
        isSelected ? 'ring-4 ring-amber-400 border-transparent scale-[1.02]' : '' // Khung viền khi đang click chọn bàn đó
      }`}
    >
      {/* Hàng trên: Tên bàn & Icon nhận diện nhanh */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-black text-xl tracking-tight ${isOccupied ? 'text-white' : 'text-slate-800'}`}>
            {table.name}
          </h3>
          <span className={`text-[11px] font-bold uppercase tracking-wider mt-1 block ${isOccupied ? 'text-blue-100' : 'text-slate-400'}`}>
            {isOccupied ? '• Có người' : '• Bàn trống'}
          </span>
        </div>

        {/* Khối tròn chứa Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${isOccupied ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {isOccupied ? <UserCheck size={18} /> : <Coffee size={18} />}
        </div>
      </div>

      {/* Hàng dưới: Hiển thị tiền hóa đơn hoặc lời nhắc */}
      <div className={`mt-4 pt-2 border-t flex justify-between items-center ${isOccupied ? 'border-blue-500/50' : 'border-slate-200'}`}>
        {isOccupied ? (
          <span className="text-base font-black text-yellow-300 tracking-tight animate-pulse">
            {currentTableTotal.toLocaleString()}đ
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            Sẵn sàng đón khách
          </span>
        )}

        {/* Chấm tròn trạng thái */}
        <span className={`h-2.5 w-2.5 rounded-full ${isOccupied ? 'bg-yellow-300 shadow-sm shadow-white' : 'bg-slate-300'}`}></span>
      </div>
    </div>
  );
}