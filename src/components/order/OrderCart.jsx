import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Minus, Plus, Search, ShoppingBag, Trash2, CreditCard, Save, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OrderCart() {
    const { user } = useAuth();
    const { activeTable, menu, addToOrder, reduceQuantity, removeFromOrder, checkoutTable, updateItemQuantity, updateTableNote, markItemsAsPrinted } = useRestaurant();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('menu');
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [noteInput, setNoteInput] = useState(activeTable?.note || "");
    const CATEGORY_LABELS = {
        'rice_side': 'Cơm - Món mặn',
        'salad_soup': 'Salad - Gỏi',
        'snack': 'Món nhậu',
        'noodle_fried': 'Cơm chiên - Mì',
        'hotpot': 'Món lẩu',
        'drink': 'Nước uống',
        'seafood': 'Hải sản tươi',
        'all': 'Tất cả'
    };

    // const totalAmount = activeTable?.currentOrder?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const totalAmount = React.useMemo(() => {
        if (!activeTable?.currentOrder) return 0;
        return activeTable.currentOrder.reduce((sum, item) =>
            sum + ((item.category === 'seafood' ? item.price * 2 : item.price) * item.quantity), 0
        );
    }, [activeTable]);
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

    const handleDishClick = (dish) => {
        const existingItem = activeTable?.currentOrder?.find(i => i.id === dish.id);

        if (dish.category === 'seafood') {
            // --- LOGIC HẢI SẢN: LUÔN MỞ PROMPT ---
            const currentVal = existingItem ? existingItem.quantity : "1";
            const input = prompt(`Nhập số lượng cho ${dish.name}:`, currentVal);
            const newQty = parseFloat(input);

            if (!isNaN(newQty) && newQty > 0) {
                if (existingItem) {
                    updateItemQuantity(dish.id, newQty); // Ghi đè số mới
                } else {
                    addToOrder(dish, user?.name, newQty); // Thêm mới với số lượng đã nhập
                }
            }
        } else {
            // --- LOGIC MÓN THƯỜNG: BẤM LÀ CỘNG 1 ---
            if (existingItem) {
                // Nếu đã có, cộng thêm 1 đơn vị
                updateItemQuantity(dish.id, existingItem.quantity + 1);
            } else {
                // Nếu chưa có, thêm mới với số lượng 1
                addToOrder(dish, user?.name, 1);
            }
        }
    };

    const formatPrice = (item) => {
        const price = Number(item.price) || 0;
        const formattedPrice = price.toLocaleString();

        // Kiểm tra nếu là danh mục 'seafood', thêm hậu tố / 0.5kg
        if (item.category === 'seafood') {
            return `${formattedPrice} VNĐ / 0,5kg`;
        }
        return `${formattedPrice} VNĐ`;
    };

    const getDisplayPrice = (item) => {
        const basePrice = item.price;
        return item.category === 'seafood' ? basePrice * 2 : basePrice;
    };

    useEffect(() => {
        // Khi activeTable thay đổi (ví dụ: bàn được reset), cập nhật lại state tạm
        setNoteInput(activeTable?.note || "");
    }, [activeTable?.note]);

    const handlePrint = () => {
        // 1. Kích hoạt lệnh in
          if (activeTable?.currentOrder?.length === 0) return;
        window.print();

        // 2. Sau khi in xong, gọi hàm cập nhật trạng thái các món trong Firebase
        // Bạn cần tạo hàm này trong RestaurantContext để set lại isNew = false cho tất cả item trong bàn
        markItemsAsPrinted(activeTable.id);
    };

    const handleSaveOrder = async () => {
        if (activeTable?.currentOrder?.length === 0) return;

        // Gọi hàm chuyển isNew thành false để "chốt đơn" (không in lại lần sau)
        await markItemsAsPrinted(activeTable.id);

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
                            className="w-full pl-10 pr-10 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Nút X xóa hết nội dung tìm kiếm */}
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-3 p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        )}
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
                                    onClick={() => handleDishClick(dish, user?.name)}
                                    className="bg-white border p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <p className="text-sm font-bold h-8 line-clamp-2 ">{dish.name}</p>
                                    <div className="flex justify-between items-center ">
                                        {/* <span className="text-blue-600 font-black">{dish.price.toLocaleString()} VNĐ</span> */}
                                        <span className="text-blue-600 font-black text-sm">
                                            {formatPrice(dish)}
                                        </span>
                                        {qty > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">x{Number(qty)}</span>}
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
                            {console.log(`Món: ${item.name}, isNew: ${item.isNew}`)}
                            <div className="flex-1">
                                <p className="text-sm font-bold">{item.name}</p>
                                {/* <p className="text-xs font-bold text-blue-600">
                                    {(item.price * item.quantity).toLocaleString()} VNĐ
                                </p> */}
                                <p className="text-xs font-bold text-blue-600">
                                    {/* Nếu là hải sản thì price * 2, sau đó mới nhân quantity */}
                                    {((item.category === 'seafood' ? item.price * 2 : item.price) * item.quantity).toLocaleString()} VNĐ
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Cụm điều khiển số lượng - Tăng kích thước chút xíu để dễ bấm trên mobile */}
                                <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
                                    <button
                                        onClick={() => {
                                            const step = item.category === 'seafood' ? 0.1 : 1;
                                            reduceQuantity(item.id, step); // Truyền step vào
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm active:scale-90 transition-all text-slate-500"
                                    >
                                        <Minus size={14} strokeWidth={2.5} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const input = prompt(`Nhập số lượng mới cho ${item.name}:`, item.quantity);
                                            const newQty = parseFloat(input);
                                            // Nếu nhập số hợp lệ thì gọi hàm updateItemQuantity
                                            if (!isNaN(newQty)) {
                                                updateItemQuantity(item.id, newQty);
                                            }
                                        }}
                                        className="font-black text-sm w-8 text-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded transition-all outline-none"
                                    >
                                        <span className="font-black text-sm w-8 text-center text-slate-800">
                                            {Number(item.quantity)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const step = item.category === 'seafood' ? 0.1 : 1;
                                            addToOrder(item, null, step); // Truyền step vào (giả sử tham số thứ 3 là quantity)
                                        }}
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
                    ))
                    }

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
                <div className="flex-none bg-white border-t border-slate-200 p-4 pb-25 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] space-y-4">

                    {/* Phần ghi chú được thiết kế gọn gàng */}
                    <div className="space-y-1">

                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Ít cay, không hành..."
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-sm font-bold placeholder:text-slate-300 transition-all"
                            value={noteInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                setNoteInput(capitalized);
                            }}
                            onBlur={() => updateTableNote(activeTable.id, noteInput)}
                        />
                    </div>

                    {/* Phần tạm tính */}
                    <div className="flex justify-between items-center py-2">
                        <span className="font-bold text-slate-500">Tạm tính</span>
                        <span className="text-xl font-black text-slate-900">{totalAmount.toLocaleString()} VNĐ</span>
                    </div>

                    {/* Bố cục nút bấm: Thanh toán trên, Lưu đơn dưới cùng */}
               <div className="flex gap-3">
    {/* 1. Nút "Thêm món/Lưu đơn" - Chỉ hiện trên máy tính (md) */}
    {/* Bạn có thể dùng hidden md:flex để ẩn trên mobile và hiện trên desktop */}
    <button
        onClick={handleSaveOrder}
        className="hidden md:flex w-full py-3 bg-blue-500 text-white rounded-xl font-bold justify-center items-center gap-2 shadow-sm active:scale-95 transition-all"
    >
        Reset
    </button>

    {/* 2. Nút "Thanh toán" - Luôn hiển thị vì là nút quan trọng nhất */}
    <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-4 bg-green-500 text-white rounded-xl font-black flex justify-center px-6 items-center shadow-lg active:scale-95 transition-all"
    >
        <span>Thanh toán</span>
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
    // Chỉ lọc các món chưa in (isNew === true) và loại trừ đồ uống
    const newItems = orderItems.filter(item => item.isNew === true && item.addedQty > 0 && item.category !== 'drink');

    // Nếu không có món mới, đừng in gì cả
    if (newItems.length === 0) return null;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('vi-VN');
    const formattedTime = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const hasNewNote = table?.note && table.note !== table.printedNote;

    return (
        <div id="print-section" className="hidden print:block w-[80mm] mx-auto text-black bg-white p-2">
            <h1 className="text-2xl font-black text-center">{table?.name} : {table?.createdBy || "Hệ thống"}</h1>
            <div className="text-center text-sm font-bold border-b border-black py-1 mb-2">
                {formattedTime} - {formattedDate} 
            </div>
            <div className="space-y-1">
                {newItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                       <span className="text-2xl font-black w-8">{item.addedQty}</span>
                        <span className="text-sm font-bold uppercase flex-1 leading-tight">{item.name}</span>
                    </div>
                ))}
            </div>
           {hasNewNote && (
                <div className="text-2xl mt-4 border-t border-dashed border-black pt-2">
                    <strong>Lưu ý: </strong>{table.note}
                </div>
            )}
        </div>
    );
};