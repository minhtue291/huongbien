import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, HelpCircle, Search, BarChart2} from 'lucide-react';

export default function ProductManagement({ navigateTo }) {
    const { menu, addDish, updateDish, deleteDish } = useRestaurant();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', category: 'rice_side' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const removeVietnameseTones = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
    };

    // Bên trong component ProductManagement, thay thế logic currentItems cũ bằng:
    // const filteredMenu = useMemo(() => {
    //     const term = removeVietnameseTones(searchTerm.trim());
    //     if (!term) return menu || [];
    //     return (menu || []).filter(dish => removeVietnameseTones(dish.name).includes(term));
    // }, [menu, searchTerm]);

    const filteredMenu = useMemo(() => {
        const term = removeVietnameseTones(searchTerm.trim());
        return (menu || []).filter(dish => {
            const matchesTerm = !term || removeVietnameseTones(dish.name).includes(term);
            const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
            return matchesTerm && matchesCategory;
        });
    }, [menu, searchTerm, selectedCategory]);
    // STATE QUẢN LÝ THÔNG BÁO (TOAST)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // STATE QUẢN LÝ POPUP XÁC NHẬN XÓA (CONFIRM MODAL)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, dish: null });

    // STATE PHÂN TRANG (Mỗi trang hiện 10 món)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const categories = [
        { id: 'rice_side', label: 'Cơm - Món mặn' },
        { id: 'salad_soup', label: 'Salad - Gỏi' },
        { id: 'snack', label: 'Món nhậu lai rai' },
        { id: 'noodle_fried', label: 'Cơm chiên - Mì xào' },
        { id: 'hotpot', label: 'Món lẩu' },
        { id: 'drink', label: 'Nước uống' },
        { id: 'seafood', label: 'Hải sản tươi' },
    ];
    const categoryCounts = useMemo(() => {
        const counts = { all: menu?.length || 0 };
        categories.forEach(cat => {
            counts[cat.id] = (menu || []).filter(d => d.category === cat.id).length;
        });
        return counts;
    }, [menu]);

    // HÀM KÍCH HOẠT HIỂN THỊ THÔNG BÁO TOAST
    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // LOGIC XỬ LÝ PHÂN TRANG
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMenu.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const openAddModal = () => {
        setEditingDish(null);
        setFormData({ name: '', price: '', category: 'rice_side' });
        setIsModalOpen(true);
    };

    const openEditModal = (dish) => {
        setEditingDish(dish);
        setFormData({ name: dish.name, price: dish.price, category: dish.category });
        setIsModalOpen(true);
    };

    // HÀM XỬ LÝ LƯU (THÊM / SỬA)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return alert("Vui lòng nhập đầy đủ tên và giá món!");

        try {
            if (editingDish) {
                await updateDish({ ...editingDish, ...formData });
                showNotification(`Đã cập nhật thông tin món "${formData.name}" thành công!`, 'success');
            } else {
                await addDish(formData);
                setCurrentPage(1);
                showNotification(`Đã thêm món mới "${formData.name}" vào thực đơn!`, 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            showNotification("Đã xảy ra lỗi, vui lòng thử lại!", 'error');
        }
    };

    // MỞ POPUP XÁC NHẬN XÓA CUSTOM
    const openDeleteConfirm = (dish) => {
        setDeleteModal({ isOpen: true, dish });
    };

    // THỰC HIỆN XÓA SAU KHI BẤM XÁC NHẬN TRÊN POPUP
    const handleConfirmDelete = async () => {
        const { dish } = deleteModal;
        if (!dish) return;

        try {
            await deleteDish(dish.id);
            showNotification(`Đã xóa thành công món "${dish.name}"!`, 'success');

            const remainingItemsInPage = currentItems.length - 1;
            if (remainingItemsInPage === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            showNotification("Không thể xóa món ăn này!", 'error');
        } finally {
            setDeleteModal({ isOpen: false, dish: null });
        }
    };

    const formatPrice = (dish) => {
        const formatted = (Number(dish.price) || 0).toLocaleString();
        if (dish.category === 'seafood') {
            return `${formatted} VNĐ / 0.5kg`;
        }
        return `${formatted} VNĐ`;
    };

    return (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto h-full bg-slate-50 flex flex-col justify-between relative mb-14 sm:mb-0">

            {/* GIAO DIỆN TOAST THÔNG BÁO FLOAT TRÊN MÀN HÌNH */}
            {toast.show && (
                <div className={`fixed top-4 right-4 sm:top-5 sm:right-5 z-[99] flex items-center space-x-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl shadow-xl border text-xs sm:text-sm font-bold transition-all duration-300 max-w-[90vw] ${toast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="text-rose-600 shrink-0" />}
                    <span className="truncate">{toast.message}</span>
                </div>
            )}

            <div>
                {/* HEADER RESPONSIVE */}
                <header className="mb-6 border-b border-slate-200 pb-4">
                    {/* Dòng 1: Tiêu đề + Nút Thêm mới */}
                 <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Quản Lý Thực Đơn</h1>
    
    <div className="flex items-center gap-2">
        {/* Nút Báo cáo: Phong cách Outlined hiện đại */}
        <button
            onClick={() => navigateTo('/report')}
            className="group flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all active:scale-95"
        >
            <BarChart2 size={16} className="group-hover:rotate-6 transition-transform" />
            <span>Báo cáo</span>
        </button>

        {/* Nút Thêm món: Phong cách Solid nổi bật */}
        <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
            <Plus size={16} />
            <span>Thêm món</span>
        </button>
    </div>
</div>

                    {/* Dòng 2: Tìm kiếm & Lọc danh mục */}
                    <div className="space-y-4">
                        <div className="bg-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm tên món ăn..."
                                    // Thêm pr-10 để dành chỗ cho nút X
                                    className="w-full pl-10 pr-10 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {/* Nút X xóa nội dung */}
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


                        <div className="w-full overflow-hidden mt-2">
                            <div
                                className="flex gap-2 px-2 pb-2 overflow-x-auto scrollbar-hide"
                                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                            >
                                {/* Nút "Tất cả" */}
                                <button
                                    onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                                    className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all duration-200 border-2 flex items-center gap-2 ${selectedCategory === 'all'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                                        }`}
                                >
                                    Tất cả
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedCategory === 'all' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {categoryCounts.all}
                                    </span>
                                </button>

                                {/* Các nút danh mục khác */}
                                {categories.map(cat => {
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                                            className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all duration-200 border-2 flex items-center gap-2 ${isActive
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                                                }`}
                                        >
                                            {cat.label}
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {categoryCounts[cat.id] || 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </header>
                {filteredMenu.length > 0 ? (
                    <>
                        {/* Phần bảng (Table) */}
                    </>
                ) : (
                    <div className="py-20 text-center text-slate-400">
                        <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-bold">Không tìm thấy món nào!</p>
                        <p className="text-sm">Vui lòng kiểm tra lại từ khóa tìm kiếm.</p>
                    </div>
                )}

                {/* DANH SÁCH SẢN PHẨM */}
                {/* Cách nhìn 1: Dạng Bảng (Ẩn trên Mobile, hiện từ màn hình SM trở lên) */}
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider">
                                <th className="p-4 w-20 text-center">Mã</th>
                                <th className="p-4">Tên sản phẩm</th>
                                <th className="p-4">Danh mục</th>
                                <th className="p-4 text-right">Đơn giá</th>
                                <th className="p-4 text-center w-32"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {currentItems.map(dish => (
                                <tr key={dish.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-center font-bold text-slate-400">#{dish.id}</td>
                                    <td className="p-4 font-bold text-slate-900">{dish.name}</td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                                            {categories.find(c => c.id === dish.category)?.label || dish.category}
                                        </span>
                                    </td>
                                    {/* <td className="p-4 text-right font-black text-blue-600 text-base">{(Number(dish.price) || 0).toLocaleString()} VNĐ</td> */}
                                    <td className="p-4 text-right font-black text-blue-600 text-base">
                                        {formatPrice(dish)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(dish)}
                                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirm(dish)}
                                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cách nhìn 2: Dạng Thẻ/Card (Chỉ hiện trên Mobile, ẩn từ màn hình SM trở lên) */}
                <div className="block sm:hidden space-y-3">
                    {currentItems.map(dish => (
                        <div key={dish.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1 pr-2">
                                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">#{dish.id}</span>
                                    <h4 className="font-bold text-slate-900 text-base break-words">{dish.name}</h4>
                                    <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold mt-1">
                                        {categories.find(c => c.id === dish.category)?.label || dish.category}
                                    </span>
                                </div>
                                {/* <span className="font-black text-blue-600 text-base shrink-0">
                                    {(Number(dish.price) || 0).toLocaleString()} VNĐ
                                </span> */}
                                <span className="font-black text-blue-600 text-base shrink-0">
                                    {formatPrice(dish)}
                                </span>
                            </div>

                            <div className="flex items-center justify-end border-t border-slate-100 pt-3 gap-2">
                                <button
                                    onClick={() => openEditModal(dish)}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100"
                                >
                                    <Pencil size={13} />
                                    <span>Sửa</span>
                                </button>
                                <button
                                    onClick={() => openDeleteConfirm(dish)}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100"
                                >
                                    <Trash2 size={13} />
                                    <span>Xóa</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* THANH THAO TÁC PHÂN TRANG RESPONSIVE */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl mt-6 shadow-sm">
                    {/* Phân trang tinh gọn cho Mobile */}
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span className="text-xs font-bold text-slate-500 self-center">Trang {currentPage} / {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>

                    {/* Phân trang chi tiết cho Desktop */}
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">
                                Hiển thị từ <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> đến{' '}
                                <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, menu.length)}</span> trong tổng số{' '}
                                <span className="font-bold text-slate-800">{menu.length}</span> món ăn
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm border border-slate-200 bg-white p-1 space-x-1" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`relative inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${currentPage === index + 1
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP SỬA HOẶC THÊM MỚI MÓN ĂN RESPONSIVE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[460px] p-5 sm:p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
                        >
                            <X size={18} />
                        </button>

                        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4">
                            {editingDish ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tên món ăn *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm sm:text-base"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Đơn giá (VNĐ) *</label>
                                <input
                                    type="text"
                                    value={formData.price ? Number(formData.price).toLocaleString('vi-VN') : ''}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        setFormData({
                                            ...formData,
                                            price: rawValue ? parseInt(rawValue, 10) : ''
                                        });
                                    }}
                                    className="w-full px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-black text-slate-600 text-sm sm:text-base"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phân loại danh mục</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 bg-slate-50 text-sm sm:text-base"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 flex space-x-3 text-sm sm:text-base">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/10 transition-all"
                                >
                                    {editingDish ? 'Cập nhật' : 'Thêm vào menu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* POPUP XÁC NHẬN XÓA CUSTOM RESPONSIVE */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-[400px] p-5 sm:p-6 shadow-2xl border border-slate-100 text-center relative transform scale-100 transition-all">
                        <button
                            onClick={() => setDeleteModal({ isOpen: false, dish: null })}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
                        >
                            <X size={18} />
                        </button>

                        <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
                            <HelpCircle size={28} />
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">Xác nhận xóa món ăn</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mb-6 px-1">
                            Bạn có chắc chắn muốn xóa món <span className="font-bold text-rose-600">"{deleteModal.dish?.name}"</span> khỏi thực đơn? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex space-x-3 text-xs sm:text-sm">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, dish: null })}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/10 transition-all"
                            >
                                Vẫn xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}