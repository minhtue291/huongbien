import React, { useState, useEffect, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ArrowLeft, Coffee, Calendar, Save, CheckCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function QuantityReport({ navigateTo }) {
    const { ordersHistory, saveInventory } = useRestaurant();
    const today = new Date().toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [inventory, setInventory] = useState({});
    const [inventoryLogs, setInventoryLogs] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "inventory_logs"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data());
            setInventoryLogs(data);
        });
        return () => unsubscribe();
    }, []);

    const reportData = useMemo(() => {
        if (!ordersHistory) return { dates: [], itemsMap: {} };

        const filteredOrders = ordersHistory.filter(order => {
            const orderDate = order.checkoutAt.split('T')[0];
            return orderDate >= startDate && orderDate <= endDate;
        });

        const datesSet = new Set();
        const itemsMap = {};

        filteredOrders.forEach(order => {
            const date = new Date(order.checkoutAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            datesSet.add(date);

            order.items?.forEach(item => {
                if (item.category !== 'drink') return;
                if (!itemsMap[item.name]) itemsMap[item.name] = {};
                itemsMap[item.name][date] = (itemsMap[item.name][date] || 0) + (Number(item.quantity) || 0);
            });
        });

        return { dates: Array.from(datesSet).sort().slice(-7), itemsMap };
    }, [ordersHistory, startDate, endDate]);

    const handleSave = async () => {
        const success = await saveInventory(inventory);
        if (success) {
            alert("Đã lưu tồn kho!");
            setInventory({}); // Reset tạm thời sau khi lưu
        }
    };

    return (
        <div className="p-2 sm:p-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateTo('/products')} className="p-2 bg-white rounded-xl shadow-sm border">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-slate-800">Báo cáo Đồ uống</h1>
                </div>
                {/* <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl font-bold text-xs shadow-lg">
                    <Save size={14} /> Lưu
                </button> */}
            </header>

            {/* Thông báo chưa lưu */}
            {Object.keys(inventory).length > 0 && (
                <div className="mb-4 p-3 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl flex items-center justify-between">
                    <span>Dữ liệu đã thay đổi!</span>
                    <button onClick={handleSave} className="underline">Lưu ngay</button>
                </div>
            )}

           <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    {/* Label tiêu đề */}
    <div className="flex items-center gap-2 px-2 text-slate-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
        <Calendar size={16} />
        <span>Thời gian báo cáo</span>
    </div>

    <div className="flex w-full items-center gap-2">
        {/* Input Start Date */}
        <div className="flex-1 relative">
            <input 
                type="date" 
                value={startDate} 
                max={today} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full pl-3 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" 
            />
        </div>

        <span className="text-slate-300 font-black">—</span>

        {/* Input End Date */}
        <div className="flex-1 relative">
            <input 
                type="date" 
                value={endDate} 
                min={startDate} 
                max={today} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full pl-3 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" 
            />
        </div>
    </div>
</div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-[12px] border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500">
                                <th className="p-3 text-left sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Món</th>
                                <th className="p-3 text-center bg-amber-50 sticky left-[80px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Tồn đầu</th>
                                {reportData.dates.map(date => <th key={date} className="p-3 text-center">{date}</th>)}
                                <th className="p-3 text-center text-blue-700 bg-blue-50">Bán</th>
                                <th className="p-3 text-center text-emerald-700 bg-emerald-50">Còn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Object.entries(reportData.itemsMap).length > 0 ? Object.entries(reportData.itemsMap).map(([name, sales]) => {
                                const totalSold = reportData.dates.reduce((sum, d) => sum + (sales[d] || 0), 0);
                                const todayLog = inventoryLogs.find(log => log.date === today)?.items[name] || 0;
                                const endingStock = Number(inventory[name] !== undefined ? inventory[name] : todayLog) - totalSold;

                                return (
                                    <tr key={name} className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-slate-800 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] truncate max-w-[80px]">
                                            {name}
                                        </td>
                                        <td className="p-2 text-center bg-amber-50 sticky left-[80px] z-10 border-r border-amber-100">
                                            <input
                                                type="number"
                                                className="w-12 h-8 border rounded-lg text-center font-bold text-amber-700 outline-none"
                                                value={
                                                    inventory[name] !== undefined
                                                        ? inventory[name]
                                                        : (todayLog && todayLog !== 0 ? todayLog : "")
                                                }
                                                placeholder=""
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setInventory({ ...inventory, [name]: val });
                                                }}
                                            />
                                        </td>
                                        {reportData.dates.map(date => <td key={date} className="p-3 text-center font-medium">{sales[date] || 0}</td>)}
                                        <td className="p-3 text-center font-black text-blue-700 bg-blue-50/30">{totalSold}</td>
                                        <td className={`p-3 text-center font-black ${endingStock < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {endingStock}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="100%" className="p-8 text-center text-slate-400">Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}