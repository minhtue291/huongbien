import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Minus, Plus, Search, ShoppingBag, Trash2, CreditCard, Save, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OrderCart() {
    const { user } = useAuth();
    const { activeTable, menu, addToOrder, reduceQuantity, removeFromOrder, checkoutTable } = useRestaurant();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('menu');
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

    const CATEGORY_LABELS = {
        'rice_side': 'Cơm - Món mặn',
        'salad_soup': 'Salad - Gỏi',
        'snack': 'Món nhậu',
        'noodle_fried': 'Cơm chiên - Mì',
        'hotpot': 'Món lẩu',
        'drink': 'Nước uống',
        'all': 'Tất cả'
    };

    const totalAmount = activeTable?.currentOrder?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    // const filteredMenu = menu.filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const removeVietnameseTones = (str) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase();
    };
    // const filteredMenu = useMemo(() => {
    //     const term = removeVietnameseTones(searchTerm.trim());
    //     if (!term) return menu;

    //     return menu.filter(dish => {
    //         const dishName = removeVietnameseTones(dish.name);
    //         return dishName.includes(term);
    //     });
    // }, [menu, searchTerm]);

    const filteredMenu = useMemo(() => {
        const term = removeVietnameseTones(searchTerm.trim());

        return menu.filter(dish => {
            const matchesTerm = !term || removeVietnameseTones(dish.name).includes(term);
            const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
            return matchesTerm && matchesCategory;
        });
    }, [menu, searchTerm, selectedCategory]);

    const categories = useMemo(() => {
        // Lấy danh sách id duy nhất từ menu
        const uniqueIds = [...new Set(menu.map(item => item.category || 'Khác'))];

        // Trả về mảng object chứa { id, label }
        return [
            { id: 'all', label: 'Tất cả' },
            ...uniqueIds.map(id => ({
                id: id,
                label: CATEGORY_LABELS[id] || id // Hiển thị label nếu có, không thì hiển thị id
            }))
        ];
    }, [menu]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-[100dvh] w-full bg-slate-100 flex overflow-hidden">
            <PrintTemplate table={activeTable} orderItems={activeTable?.currentOrder || []} />
            {/* --- CỘT TRÁI: MENU --- */}
            <div className={`${activeView === 'menu' ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full border-r border-slate-200 bg-white min-w-0`}>
                <div className="p-4 bg-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên món ăn..."
                            className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-row gap-2 px-4 mb-[-20px] pb-[20px] overflow-x-auto w-full scrollbar-hide">
                    {categories.map(cat => {
                        const isActive = selectedCategory === cat.id; // So sánh với cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all duration-200 border-2 ${isActive
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>


                {/* {activeTable?.currentOrder?.length > 0 && (

                    <div className="md:hidden absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 pb-5">

                        <button

                            onClick={() => setActiveView('order')}

                            className="w-full py-4 bg-green-500 text-white rounded-xl font-black flex justify-between px-6 items-center shadow-2xl active:scale-95 transition-all"

                        >

                            <span>{activeTable.currentOrder.length} món</span>

                            <span>Xem đơn - {totalAmount.toLocaleString()} VNĐ</span>

                        </button>

                    </div>

                )} */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 pb-8 z-50">
                    <button
                        
                        onClick={() => {
                            if (activeTable?.currentOrder?.length > 0) {
                                setActiveView('order');
                            } else {
                               
                            }
                        }}
                        className={`w-full py-4 rounded-xl font-black flex justify-between px-6 items-center shadow-lg active:scale-95 transition-all ${activeTable?.currentOrder?.length > 0
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span>{activeTable?.currentOrder?.length || 0} món</span>
                        <span>
                            {activeTable?.currentOrder?.length > 0
                                ? `Xem đơn - ${totalAmount.toLocaleString()} VNĐ`
                                : "Bàn trống"}
                        </span>
                    </button>
                </div>
                <div className="flex-1 pb-24 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {filteredMenu.length > 0 ? (
                        filteredMenu.map(dish => {
                            const qty = activeTable?.currentOrder?.find(i => i.id === dish.id)?.quantity || 0;
                            return (
                                <div
                                    key={dish.id}
                                    onClick={() => addToOrder(dish, user?.name)}
                                    className="bg-white border p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <p className="text-sm font-bold h-10 line-clamp-2">{dish.name}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-blue-600 font-black">{dish.price.toLocaleString()} VNĐ</span>
                                        {qty > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">x{qty}</span>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Dòng chữ thông báo khi tìm không ra món */
                        <div className="col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-10 text-slate-400">
                            <Search size={48} className="mb-2 opacity-50" />
                            <p className="font-bold">Không tìm thấy món ăn nào!</p>
                            <p className="text-sm">Vui lòng kiểm tra lại từ khóa</p>
                        </div>
                    )}
                </div>
            </div>


            <div className={`${activeView === 'order' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[400px] h-[100dvh] bg-slate-50 overflow-hidden`}>

                {/* 1. Header */}
                {/* <div className="flex-none p-5 border-b bg-white flex items-center gap-3">
                    <button onClick={() => setActiveView('menu')} className="md:hidden"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-slate-800">Chi tiết đơn</h2>
                </div> */}

                <div className="flex-none p-5 border-b bg-white">
                    {/* Sử dụng flex để đưa 2 phần tử con về 2 phía */}
                    <div className="flex items-center justify-between">

                        {/* Phần trái: Nút quay lại và Tiêu đề */}
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveView('menu')} className="md:hidden">
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="text-xl font-black text-slate-800">Chi tiết đơn</h2>
                        </div>

                        {/* Phần phải: Người tạo đơn */}
                        {activeTable?.createdBy && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                    Người tạo:
                                </span>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                    {activeTable.createdBy}
                                </span>
                            </div>
                        )}

                    </div>
                </div>
                {/* 2. Danh sách món (Sử dụng flex-1 để nó tự chiếm phần còn lại) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeTable?.currentOrder?.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex-1">
                                <p className="text-sm font-bold">{item.name}</p>
                                <p className="text-xs font-bold text-blue-600">
                                    {(item.price * item.quantity).toLocaleString()} VNĐ
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Cụm điều khiển số lượng - Tăng kích thước chút xíu để dễ bấm trên mobile */}
                                <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
                                    <button
                                        onClick={() => reduceQuantity(item.id)}
                                        className="p-1.5 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm active:scale-90 transition-all text-slate-500"
                                    >
                                        <Minus size={14} strokeWidth={2.5} />
                                    </button>

                                    <span className="font-black text-sm w-8 text-center text-slate-800">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() => addToOrder(item)}
                                        className="p-1.5 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm active:scale-90 transition-all text-slate-500"
                                    >
                                        <Plus size={14} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Nút xoá - Tách biệt và tinh tế hơn */}
                                <button
                                    onClick={() => setDeleteConfirmItem(item)} // Lưu lại món cần xóa
                                    className="group p-2 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-90"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {deleteConfirmItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Bạn có chắc muốn xóa <b>{deleteConfirmItem.name}</b> khỏi đơn hàng không?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmItem(null)}
                                    className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={() => {
                                        removeFromOrder(deleteConfirmItem.id);
                                        setDeleteConfirmItem(null);
                                    }}
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                                >
                                    Xóa món
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Footer Thanh toán (Không dùng absolute/fixed) */}
                {/* FOOTER THANH TOÁN */}
                <div className="flex-none bg-white border-t border-slate-200 p-4 pb-25 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-500">Tạm tính</span>
                        <span className="text-xl font-black text-slate-900">{totalAmount.toLocaleString()} VNĐ</span>
                    </div>

                    <div className="flex gap-3">
                        {/* Nút In đơn */}

                        {/* Nút Thanh toán - Mở Modal xác nhận */}
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex-1 py-4 bg-green-500 text-white rounded-xl font-black flex justify-between px-6 items-center shadow-lg active:scale-95 transition-all"
                        >
                            <span>Thanh toán</span>
                            <span>{totalAmount.toLocaleString()} VNĐ</span>
                        </button>
                    </div>
                </div>

                {/* MODAL XÁC NHẬN */}
                {showConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm rounded-3xl p-6 ">
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src="/vnpay-qr.png"
                                    alt="VNPay QR"
                                    /* Thay w-100 h-100 bằng w-64 h-64 hoặc w-80 h-80 để to hơn */
                                    className="w-96 h-96 object-contain bg-white rounded-lg"
                                />
                            </div>
                            {/* ------------------------- */}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 active:scale-95 transition-all"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={() => {
                                        checkoutTable(activeTable?.id);
                                        setShowConfirm(false);
                                    }}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-green-500 text-white shadow-lg active:scale-95 transition-all"
                                >
                                    Đã thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const PrintTemplate = ({ table, orderItems }) => {
    // Chỉ lấy món ăn (loại bỏ đồ uống)
    const foodItems = orderItems.filter(item => item.category !== 'drink');

    return (
        <div id="print-section" className="hidden print:block w-[80mm] mx-auto text-black bg-white p-2">
            <h1 className="text-2xl font-black text-center">{table?.name} : {table?.createdBy || "Hệ thống"}</h1>
            <div className="border-b-2 border-black pb-2 mb-2 flex flex-row gap-1 justify-end">
            </div>

            <div className="space-y-1">
                {foodItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <span className="text-2xl font-black w-8">{item.quantity}</span>
                        <span className="text-sm font-bold uppercase flex-1 leading-tight">{item.name}</span>
                    </div>
                ))}
            </div>


        </div>
    );
};