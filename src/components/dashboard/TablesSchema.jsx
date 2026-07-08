import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Coffee, Plus, X, Trash2, Layers, LayoutGrid, Edit2 } from 'lucide-react';

export default function TablesSchema({ navigateTo }) {
  const { tables, addTable, deleteTable, handleRenameTable } = useRestaurant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // 'single' hoặc 'bulk'

  // State cho tạo 1 bàn
  const [newTableName, setNewTableName] = useState('');

  // State cho tạo nhiều bàn hàng loạt
  const [prefix, setPrefix] = useState('Bàn số ');
  const [startNum, setStartNum] = useState(1);
  const [endNum, setEndNum] = useState(5);

  const getStatusStyle = (status) => {
    // Chiều cao rút từ h-36 xuống h-28 hoặc h-32 trên mobile để gọn gàng hơn
    let base = "p-4 sm:p-6 rounded-xl sm:rounded-2xl border flex flex-col justify-between h-28 sm:h-36 shadow-sm transition-all duration-300 relative group ";
    if (status === 'occupied') {
      return base + "bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-600/20 cursor-pointer transform active:scale-95 sm:hover:-translate-y-1";
    } else {
      return base + "bg-white border-slate-200 text-slate-600 cursor-pointer transform active:scale-95 sm:hover:border-blue-400 sm:hover:-translate-y-1";
    }
  };

  // Xử lý tạo 1 bàn
  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    try {
      await addTable(newTableName);
      setNewTableName('');
      setIsModalOpen(false);
    } catch (error) {
      alert("Lỗi thêm bàn: " + error.message);
    }
  };

  // Xử lý tạo nhiều bàn hàng loạt
  const handleCreateBulkTables = async (e) => {
    e.preventDefault();
    const start = parseInt(startNum);
    const end = parseInt(endNum);

    if (isNaN(start) || isNaN(end) || start > end) {
      alert("Số bắt đầu không được lớn hơn số kết thúc!");
      return;
    }
    if (end - start > 50) {
      alert("Để tránh nghẽn mạng, bạn chỉ nên tạo tối đa 50 bàn một lúc.");
      return;
    }

    try {
      for (let i = start; i <= end; i++) {
        const fullTableName = `${prefix}${i}`;
        await addTable(fullTableName, i);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Lỗi khi tạo hàng loạt: " + error.message);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto h-full bg-slate-50 mb-14 sm:mb-0">
      {/* Header tối ưu không gian */}
      <header className="mb-6 border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Quản Lý Bàn</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center space-x-1.5 text-xs sm:text-sm shadow-lg shadow-blue-600/10 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Thêm bàn</span>
        </button>
      </header>

      {/* Grid danh sách bàn: Chia 2 cột cực gọn trên mobile, 3-4 cột trên desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {tables && tables.map(table => {
          const isOccupied = table.status === 'occupied';
          // const totalAmount = table.currentOrder?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
          const totalAmount = table.currentOrder?.reduce((sum, i) => {
            const price = i.category === 'seafood' ? i.price * 2 : i.price;
            return sum + (price * i.quantity);
          }, 0) || 0;
          return (
            <div
              key={table.id}
              className={getStatusStyle(table.status)}
              onClick={() => navigateTo(`/pos?tableId=${table.id}`)}
            >
              {/* NÚT XÓA BÀN: Ẩn hoàn toàn trên Mobile (hidden), chỉ xuất hiện ở màn hình Desktop (sm:block) khi hover và bàn TRỐNG */}
             {/* Thay đoạn button xóa cũ bằng đoạn này */}
{!isOccupied && (
  <div className="absolute top-2 right-2 flex gap-1 z-10">
    {/* Nút Đổi tên */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleRenameTable(table);
      }}
      className="p-2 bg-blue-100 text-blue-600 rounded-lg active:bg-blue-600 active:text-white transition-all shadow-sm"
      title="Đổi tên bàn"
    >
      <Edit2 size={14} />
    </button>

    {/* Nút Xóa bàn */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        if(window.confirm(`Bạn có chắc muốn xóa ${table.name}?`)) {
           deleteTable(table.firestoreId, table.name);
        }
      }}
      className="p-2 bg-red-100 text-red-500 rounded-lg active:bg-red-500 active:text-white transition-all shadow-sm"
      title="Xóa bàn"
    >
      <Trash2 size={14} />
    </button>
  </div>
)}

              {/* Dòng trên: Tên bàn & Số món */}
              <div className="flex justify-between items-start w-full min-w-0">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Coffee size={16} className={isOccupied ? "text-blue-200 shrink-0" : "text-blue-500 shrink-0"} />
                  <span className={`font-black text-sm sm:text-lg tracking-tight truncate ${isOccupied ? 'text-white' : 'text-slate-900'}`}>
                    {table.name}
                  </span>
                </div>
                {table.currentOrder && table.currentOrder.length > 0 && (
                  <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 sm:px-2.5 rounded-full font-bold shrink-0 ${isOccupied ? 'bg-blue-500 text-white border border-blue-400/50' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                    {table.currentOrder.length} món
                  </span>
                )}
              </div>

              {/* Dòng dưới: Trạng thái & Giá tiền (Được tinh giản tối đa chữ thừa trên Mobile) */}
              <div className={`flex justify-between items-end sm:items-center mt-2 pt-1.5 border-t w-full ${isOccupied ? 'border-blue-500' : 'border-slate-100'}`}>
                {/* Trên mobile ẩn các chữ rườm rà, chỉ giữ dấu chấm màu hoặc chữ ngắn gọn */}
                <span className={`text-[10px] sm:text-xs font-bold ${isOccupied ? 'text-blue-100' : 'text-slate-400'}`}>
                  <span className={isOccupied ? "text-yellow-300 mr-0.5" : "text-emerald-400 mr-0.5"}>•</span>
                  <span className="hidden sm:inline">{isOccupied ? ' Có người' : ' Bàn trống'}</span>
                  <span className="inline sm:hidden">{isOccupied ? 'Có khách' : 'Trống'}</span>
                </span>

                {isOccupied && totalAmount > 0 ? (
                  <span className="text-sm sm:text-base font-black text-yellow-300 tracking-tight">
                    {totalAmount.toLocaleString()} VNĐ
                  </span>
                ) : (
                  // Màn hình mobile ẩn bớt chữ "Sẵn sàng" để tránh rối mắt
                  <span className="hidden sm:inline text-[11px] text-slate-400 italic">Sẵn sàng</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL ĐA NĂNG (Tối ưu full screen hoặc ôm gọn trên Mobile) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5 sm:p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
            >
              <X size={18} />
            </button>

            {/* THANH MENU CHUYỂN TAB */}
            <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl mb-5 mt-2">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <LayoutGrid size={13} />
                <span>Thêm lẻ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Layers size={13} />
                <span>Thêm nhiều</span>
              </button>
            </div>

            {/* TAB 1: FORM THÊM 1 BÀN */}
            {activeTab === 'single' && (
              <form onSubmit={handleCreateTable} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tên hoặc số bàn *</label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Ví dụ: Bàn 01, VIP 1"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm"
                    required
                  />
                </div>

                <div className="pt-1 flex space-x-2 text-sm">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Hủy</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold">Tạo bàn</button>
                </div>
              </form>
            )}

            {/* TAB 2: FORM THÊM HÀNG LOẠT */}
            {activeTab === 'bulk' && (
              <form onSubmit={handleCreateBulkTables} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tiền tố tên bàn</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="Ví dụ: Bàn số "
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Từ số</label>
                    <input
                      type="number"
                      value={startNum}
                      onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Đến số</label>
                    <input
                      type="number"
                      value={endNum}
                      onChange={(e) => setEndNum(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="pt-1 flex space-x-2 text-sm">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Đóng</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold">Xác nhận tạo</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}