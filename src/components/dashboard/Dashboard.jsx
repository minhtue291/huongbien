import React, { useState, useMemo} from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DollarSign, FileText, ShoppingBag, Users, Calendar, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
 const { ordersHistory = [], tables = [] } = useRestaurant();
  const [timeFilter, setTimeFilter] = useState('today'); // 'today' | 'all' | 'month'

  // Lấy chuỗi ngày hôm nay định dạng YYYY-MM-DD dựa theo múi giờ hệ thống
  const todayStr = new Date().toLocaleDateString('fr-CA');
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // LỌC DỮ LIỆU HÓA ĐƠN THEO BỘ LỌC THỜI GIAN
// LỌC DỮ LIỆU HÓA ĐƠN
const filteredOrders = useMemo(() => {
  return ordersHistory.filter(order => {
    if (timeFilter === 'today') return order.dateString === todayStr;
    if (timeFilter === 'month') return order.month === currentMonth && order.year === currentYear;
    return true;
  });
}, [ordersHistory, timeFilter, todayStr, currentMonth, currentYear]);

  // TÍNH TOÁN CÁC SỐ LIỆU THỐNG KÊ
  // 1. Tổng doanh thu sau lọc
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  
  // 2. Tổng số hóa đơn đã xuất
  const totalInvoices = filteredOrders.length;
  
  // 3. Tổng số lượng món ăn đã bán ra phục vụ khách
  const totalItemsSold = filteredOrders.reduce((sum, order) => {
    const orderItemsCount = order.items?.reduce((iSum, item) => iSum + (item.quantity || 0), 0) || 0;
    return sum + orderItemsCount;
  }, 0);

  // 4. Đếm số bàn hiện tại đang có khách ăn (Realtime trực tiếp từ sơ đồ bàn)
  const occupiedTablesCount = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto h-full bg-slate-50 mb-14 sm:mb-0">
      
      {/* HEADER & THANH LỌC THỜI GIAN */}
      <header className="mb-6 sm:mb-8 border-b border-slate-200 pb-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tổng Quan Kinh Doanh</h1> </div>

        {/* NÚT CHỌN NHANH KHOẢNG THỜI GIAN BÁO CÁO RESPONSIVE */}
        <div className="w-full xl:w-auto flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm font-bold text-xs text-slate-600 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button 
            onClick={() => setTimeFilter('today')}
            className={`flex-1 xl:flex-none text-center px-3 py-2 sm:px-4 rounded-lg transition-all ${timeFilter === 'today' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            Hôm nay
          </button>
          <button 
            onClick={() => timeFilter !== 'month' ? setTimeFilter('month') : setTimeFilter('today')}
            className={`flex-1 xl:flex-none text-center px-3 py-2 sm:px-4 rounded-lg transition-all ${timeFilter === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            Tháng này ({currentMonth})
          </button>
          <button 
            onClick={() => setTimeFilter('all')}
            className={`flex-1 xl:flex-none text-center px-3 py-2 sm:px-4 rounded-lg transition-all ${timeFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            Tất cả lịch sử
          </button>
        </div>
      </header>

      {/* GRID 4 THÊ SỐ LIỆU CHÍNH (KPI CARDS RESPONSIVE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        
        {/* THẺ 1: DOANH THU */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <DollarSign size={22} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Tổng doanh thu</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 break-words">
              {totalRevenue.toLocaleString()} VNĐ
            </h3>
          </div>
        </div>

        {/* THẺ 2: SỐ LƯỢNG HÓA ĐƠN */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
            <FileText size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Số lượng hóa đơn</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {totalInvoices} đơn
            </h3>
          </div>
        </div>

        {/* THẺ 3: SỐ MÓN ĐÃ BÁN */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Số món phục vụ</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {totalItemsSold} món
            </h3>
          </div>
        </div>

        {/* THẺ 4: BÀN ĐANG HOẠT ĐỘNG */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 shrink-0">
            <Users size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Bàn đang ăn</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {occupiedTablesCount} / {tables.length} bàn
            </h3>
          </div>
        </div>
      </div>

      {/* KHU VỰC BẢNG LỊCH SỬ HÓA ĐƠN CHI TIẾT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} className="text-slate-700" />
            <h3 className="font-black text-slate-900 text-base sm:text-lg">Lịch sử hóa đơn ({filteredOrders.length})</h3>
          </div>
          <span className="text-[11px] text-slate-400 italic font-medium flex items-center gap-1">
            <Clock size={12} /> Đồng bộ dữ liệu liên tục
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400">
            <Calendar size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-500 text-sm sm:text-base">Chưa có dữ liệu hóa đơn phát sinh!</p>
            <p className="text-xs mt-1 text-slate-400 max-w-xs mx-auto">Các hóa đơn sau khi hoàn tất thanh toán tại sơ đồ bàn sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <>
            {/* Giao diện Table: Hiển thị từ màn hình SM trở lên */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                    <th className="py-3.5 px-6">Tên bàn / Vị trí</th>
                    <th className="py-3.5 px-6">Thời gian thanh toán</th>
                    <th className="py-3.5 px-6">Chi tiết món đã gọi</th>
                    <th className="py-3.5 px-6 text-right">Tổng thanh toán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                  {filteredOrders.map((order) => (
                    <tr key={order.firestoreId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-black text-slate-900">{order.tableName}</td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        <div className="font-bold text-slate-700">{order.dateString}</div>
                        <div className="mt-0.5 text-[11px] font-medium opacity-70">{order.timeString}</div>
                      </td>
                      <td className="py-4 px-6 max-w-xs md:max-w-md">
                        <div className="flex flex-wrap gap-1.5">
                          {order.items?.map((item, idx) => (
                            <span 
                              key={idx} 
                              className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200/60 block"
                            >
                              {item.name} <span className="text-blue-600">x{item.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-900 text-base tracking-tight">
                        {(order.totalPrice || 0).toLocaleString()} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Giao diện List Card: Tối ưu riêng cho màn hình di động nhỏ (Mobile) */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <div key={order.firestoreId} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{order.tableName}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 font-semibold">
                        <span>{order.dateString}</span>
                        <span>•</span>
                        <span>{order.timeString}</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-base">
                      {(order.totalPrice || 0).toLocaleString()} VNĐ
                    </span>
                  </div>

                  {/* Danh sách món gọi thu nhỏ */}
                  <div className="flex flex-wrap gap-1">
                    {order.items?.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="bg-slate-50 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200/40"
                      >
                        {item.name} <span className="text-blue-600">x{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}