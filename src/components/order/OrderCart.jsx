import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Minus, Plus, Search, ShoppingBag, Trash2, CreditCard, Save, ChevronLeft } from 'lucide-react';

export default function OrderCart() {
    const { activeTable, menu, addToOrder, reduceQuantity, removeFromOrder, checkoutTable } = useRestaurant();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('menu');

    const totalAmount = activeTable?.currentOrder?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const filteredMenu = menu.filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = () => {
        window.print();
    };
    return (
        <div className="h-screen w-full bg-slate-100 flex overflow-hidden">
            <PrintTemplate table={activeTable} orderItems={activeTable?.currentOrder || []} />
            {/* --- CỘT TRÁI: MENU --- */}
            <div className={`${activeView === 'menu' ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full border-r border-slate-200 bg-white`}>

                <div className="p-4 bg-slate-50">
                    <input type="text" placeholder="Tìm tên món ăn..." className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                {activeTable?.currentOrder?.length > 0 && (
                    <div className="md:hidden absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-50">
                        <button
                            onClick={() => setActiveView('order')}
                            className="w-full py-4 bg-green-500 text-white rounded-xl font-black flex justify-between px-6 items-center shadow-2xl active:scale-95 transition-all"
                        >
                            <span>{activeTable.currentOrder.length} món</span>
                            <span>Xem đơn - {totalAmount.toLocaleString()}đ</span>
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {filteredMenu.map(dish => {
                        const qty = activeTable?.currentOrder?.find(i => i.id === dish.id)?.quantity || 0;
                        return (
                            <div key={dish.id} onClick={() => addToOrder(dish)} className="bg-white border p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition-all shadow-sm hover:shadow-md active:scale-95">
                                <p className="text-sm font-bold h-10 line-clamp-2">{dish.name}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-blue-600 font-black">{dish.price.toLocaleString()}đ</span>
                                    {qty > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">x{qty}</span>}
                                </div>

                            </div>

                        )
                            ;
                    })}

                </div>

            </div>


            {/* --- CỘT PHẢI: CHI TIẾT ĐƠN --- */}
            <div className={`${activeView === 'order' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[400px] lg:w-[450px] h-full bg-slate-50 relative`}>
                <div className="p-5 border-b bg-white flex items-center gap-3">
                    <button onClick={() => setActiveView('menu')} className="md:hidden"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-slate-800">Chi tiết đơn</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeTable?.currentOrder?.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex-1">
                                <p className="text-sm font-bold">{item.name}</p>
                                <p className="text-xs font-bold text-blue-600">{(item.price * item.quantity).toLocaleString()}đ</p>
                            </div>
                            <div className="flex items-center gap-2 border rounded-lg p-1">
                                <button onClick={() => reduceQuantity(item.id)} className="p-1"><Minus size={14} /></button>
                                <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                                <button onClick={() => addToOrder(item)} className="p-1"><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeFromOrder(item.id)} className="ml-3 text-red-400"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>

                {/* FOOTER CỐ ĐỊNH Ở DƯỚI CÙNG */}
                <div className="p-4 bg-white border-t border-slate-200 shadow-lg pb-30">
                    <div className="flex justify-between text-lg font-black mt-5 mb-7">
                        <span>Tạm tính</span>
                        <span className="text-blue-600">{totalAmount.toLocaleString()}đ</span>
                    </div>

                    {/* Sử dụng grid-cols-1 trên mobile, grid-cols-2 trên desktop (md)
    */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">

                        {/* Nút In đơn: Chỉ hiện trên desktop (md:flex), ẩn trên mobile */}
                        <button
                            onClick={handlePrint}
                            className="hidden md:flex py-4 border-2 border-slate-200 rounded-xl font-black items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                            <Save size={18} /> In đơn
                        </button>


                        <button
                            onClick={() => checkoutTable(activeTable?.id)}
                            className="w-full py-4 bg-green-500 text-white rounded-xl font-black flex items-center justify-center gap-2 text-sm shadow-md hover:bg-green-600 transition-colors"
                        >
                            <CreditCard size={18} /> Thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PrintTemplate = ({ table, orderItems }) => (
    <div id="print-section" className="hidden print:block  w-[72mm] mx-auto text-black bg-white">
        {/* Header Bếp - Căn giữa, chữ lớn */}
        <div className="border-b-4 border-black pb-2 mb-3 text-center">
            <div className="bg-black text-black text-3xl font-black py-1 mt-2">
                {table?.name}
            </div>
            <p className="text-xs font-bold mt-1">
                {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
            </p>
        </div>

        {/* Danh sách món - Cột Số lượng & Tên món */}
        <div className="space-y-2">
            {orderItems.map((item, index) => (
                <div key={index} className="flex border-b border-gray-300 py-2 items-start">
                    {/* Cột số lượng: Dùng font cực to để dễ nhìn */}
                    <div className="w-12 text-center">
                        <span className="text-3xl font-black">{item.quantity}</span>
                    </div>
                    {/* Cột tên món: Uppercase, font lớn, viết hoa toàn bộ */}
                    <div className="flex-1 pl-2">
                        <p className="text-l font-black uppercase leading-tight">{item.name}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer */}

    </div>
);