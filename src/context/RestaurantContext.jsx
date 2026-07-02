import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [ordersHistory, setOrdersHistory] = useState([]); // State lưu lịch sử hóa đơn cho Dashboard
  const [activeTableId, setActiveTableId] = useState(null);

  // Tìm bàn đang hoạt động dựa trên ID
  const activeTable = tables.find(t => t.id === activeTableId);

  // ================= 1. TỰ ĐỘNG ĐỒNG BỘ REALTIME TỪ FIREBASE =================
  useEffect(() => {
    // Lắng nghe danh sách BÀN ĂN thay đổi realtime
    const unsubscribeTables = onSnapshot(collection(db, "tables"), (snapshot) => {
      const tablesData = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
      }));
      // Sắp xếp lại bàn theo ID tăng dần
      setTables(tablesData.sort((a, b) => a.id - b.id));
    });

    // Lắng nghe DANH SÁCH MÓN ĂN thay đổi realtime
    const unsubscribeMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
      }));
      setMenu(menuData.sort((a, b) => a.id - b.id));
    });

    // LẮNG NGHE LỊCH SỬ HÓA ĐƠN REALTIME (Phục vụ trang Dashboard doanh thu)
    const unsubscribeHistory = onSnapshot(collection(db, "orders_history"), (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
      }));
      // Sắp xếp hóa đơn mới nhất lên đầu dựa vào chuỗi thời gian checkoutAt
      setOrdersHistory(historyData.sort((a, b) => b.checkoutAt.localeCompare(a.checkoutAt)));
    });

    // Hủy lắng nghe khi component bị unmount
    return () => {
      unsubscribeTables();
      unsubscribeMenu();
      unsubscribeHistory();
    };
  }, []);

  // ================= 2. QUẢN LÝ ĐẶT MÓN (ORDER) =================

  // Hàm thêm món vào bàn (Order)
  // Trong RestaurantContext.js, tìm hàm addToOrder
  const addToOrder = async (menuItem, creatorName, step = 1) => {
    if (!activeTableId || !activeTable) return;

    const existing = activeTable.currentOrder?.find(item => item.id === menuItem.id);
    let newOrder = [];

    if (existing) {
        newOrder = activeTable.currentOrder.map(item =>
            item.id === menuItem.id 
                ? { ...item, quantity: parseFloat((item.quantity + step).toFixed(1)) } 
                : item
        );
    } else {
        newOrder = [...(activeTable.currentOrder || []), { ...menuItem, quantity: step }];
    }

    const tableDocRef = doc(db, "tables", activeTable.firestoreId);

    // Logic: Chỉ gán createdBy nếu bàn đang 'available' hoặc chưa có người tạo
    const updateData = {
      currentOrder: newOrder,
      status: 'occupied'
    };

   if (!activeTable.createdBy) {
        updateData.createdBy = creatorName || "Không xác định";
    }

    await updateDoc(tableDocRef, updateData);
  };

const updateItemQuantity = async (itemId, newQuantity) => {
    // Lọc để xóa nếu số lượng <= 0
    const newOrder = activeTable.currentOrder.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
    ).filter(item => item.quantity > 0);

    const tableDocRef = doc(db, "tables", activeTable.firestoreId);
    await updateDoc(tableDocRef, { currentOrder: newOrder });
};

  // Hàm giảm số lượng món ăn trên bàn
const getSafeQuantity = (qty) => {
    return parseFloat(qty.toFixed(1));
};

const reduceQuantity = async (itemId, amount = 1) => {
    if (!activeTable || !activeTable.currentOrder) return;

    const newOrder = activeTable.currentOrder.map(item => {
        if (item.id === itemId) {
            // Dùng getSafeQuantity để loại bỏ các số 0 thừa thãi
            return { ...item, quantity: getSafeQuantity(item.quantity - amount) };
        }
        return item;
    }).filter(item => item.quantity > 0);

  const isEmpty = newOrder.length === 0;

  const tableDocRef = doc(db, "tables", activeTable.firestoreId);
  
  const updateData = {
    currentOrder: newOrder,
    status: isEmpty ? 'available' : 'occupied'
  };

  if (isEmpty) {
    updateData.createdBy = null;
  }

  await updateDoc(tableDocRef, updateData);
};

  // Hàm xóa hoàn toàn món ăn khỏi bàn đang đặt
  const removeFromOrder = async (itemId) => {
  if (!activeTable || !activeTable.currentOrder) return;

  const newOrder = activeTable.currentOrder.filter(item => item.id !== itemId);
  
  // Kiểm tra nếu danh sách món còn lại rỗng
  const isEmpty = newOrder.length === 0;
  
  const tableDocRef = doc(db, "tables", activeTable.firestoreId);
  
  // Dữ liệu cập nhật
  const updateData = {
    currentOrder: newOrder,
    status: isEmpty ? 'available' : 'occupied'
  };

  // Nếu bàn trống, reset luôn người tạo đơn
  if (isEmpty) {
    updateData.createdBy = null;
  }

  await updateDoc(tableDocRef, updateData);
};

  // Hàm xử lý thanh toán, lưu lịch sử hóa đơn & reset bàn trống
const checkoutTable = async (tableId) => {
    const targetTable = tables.find(t => t.id === tableId);

    if (!targetTable || !targetTable.currentOrder || targetTable.currentOrder.length === 0) {
      return;
    }

    try {
      // Tính tổng tiền: Nếu là hải sản (category === 'seafood'), giá nhân đôi
      const totalAmount = targetTable.currentOrder.reduce((sum, item) => {
        const itemPrice = item.category === 'seafood' ? item.price * 2 : item.price;
        return sum + (itemPrice * item.quantity);
      }, 0);
      
      const now = new Date();

      // Đóng gói dữ liệu: Lưu kèm giá đã nhân đôi vào danh sách items để làm lịch sử hóa đơn
      const itemsWithCorrectPrice = targetTable.currentOrder.map(item => ({
        ...item,
        // Lưu giá đã xử lý vào đây để sau này xem lại hóa đơn không bị sai lệch
        finalPrice: item.category === 'seafood' ? item.price * 2 : item.price 
      }));

      await addDoc(collection(db, "orders_history"), {
        tableName: targetTable.name,
        tableId: targetTable.id,
        items: itemsWithCorrectPrice, // Dùng danh sách đã có giá cuối
        totalPrice: totalAmount,
        checkoutAt: now.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        dateString: now.toLocaleDateString('fr-CA'),
        timeString: now.toTimeString().split(' ')[0]
      });

      // Reset bàn
      const tableDocRef = doc(db, "tables", targetTable.firestoreId);
      await updateDoc(tableDocRef, {
        status: 'available',
        currentOrder: [],
        createdBy: null
      });

      setActiveTableId(null);
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      alert("Gặp lỗi khi lưu hóa đơn: " + error.message);
    }
};
  // ================= 3. QUẢN LÝ DANH SÁCH BÀN ĂN =================

  // Hàm tạo bàn mới (Chấp nhận customId khi tạo hàng loạt để đồng bộ sắp xếp)
  const addTable = async (tableName, customId = null) => {
    if (!tableName.trim()) return;

    const finalId = customId !== null
      ? parseInt(customId)
      : (tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1);

    await addDoc(collection(db, "tables"), {
      id: finalId,
      name: tableName,
      status: 'available',
      currentOrder: []
    });
  };

  // Hàm xóa bàn khỏi hệ thống
  const deleteTable = async (firestoreId, tableName) => {
    if (!firestoreId) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${tableName}" khỏi hệ thống?`)) {
      const tableDocRef = doc(db, "tables", firestoreId);
      await deleteDoc(tableDocRef);
    }
  };

  // ================= 4. QUẢN LÝ THỰC ĐƠN GỐC =================

  // Thêm món mới vào thực đơn tổng
  const addDish = async (newDish) => {
    const nextId = menu.length > 0 ? Math.max(...menu.map(d => d.id)) + 1 : 1;
    await addDoc(collection(db, "menu"), {
      name: newDish.name,
      price: parseFloat(newDish.price) || 0,
      category: newDish.category,
      id: nextId
    });
  };

  // Sửa thông tin món ăn
  const updateDish = async (updatedDish) => {
    const dishDocRef = doc(db, "menu", updatedDish.firestoreId);
    await updateDoc(dishDocRef, {
      name: updatedDish.name,
      price: parseFloat(updatedDish.price) || 0,
      category: updatedDish.category
    });
  };

  // Xóa món ăn khỏi thực đơn tổng
  // 8. Xóa món ăn khỏi thực đơn tổng (Đã gỡ bỏ window.confirm)
  const deleteDish = async (dishId) => {
    const targetDish = menu.find(d => d.id === dishId);
    if (!targetDish) return;

    // Không dùng window.confirm ở đây nữa, vì bên giao diện ProductManagement đã có Popup riêng
    const dishDocRef = doc(db, "menu", targetDish.firestoreId);
    await deleteDoc(dishDocRef);
  };

  
  return (
    <RestaurantContext.Provider value={{
      tables,
      menu,
      ordersHistory, // Đã đẩy biến này ra ngoài giá trị cung cấp toàn app
      addTable,
      deleteTable,
      addDish,
      updateDish,
      deleteDish,
      activeTable,
      setActiveTableId,
      addToOrder,
      reduceQuantity,
      updateItemQuantity,
      removeFromOrder,
      checkoutTable
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => useContext(RestaurantContext);