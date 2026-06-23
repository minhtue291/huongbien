import React, { useState, useEffect, useMemo } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import OrderCart from './components/order/OrderCart';
import Dashboard from './components/dashboard/Dashboard';
import TablesSchema from './components/dashboard/TablesSchema';
import ProductManagement from './components/products/ProductManagement';
import LoginScreen from './components/login/LoginScreen';
import AccountSettings from './components/account/AccountSetting';
import { Utensils, LayoutDashboard, Grid, ArrowLeft, PackagePlus, UserCheck } from 'lucide-react';

function PosScreen({ tableId, navigateTo }) {
  const { setActiveTableId, tables } = useRestaurant();
  const { user } = useAuth();
  const currentTable = useMemo(() => tables.find(t => t.id === parseInt(tableId)), [tableId, tables]);

  useEffect(() => {
    if (currentTable) setActiveTableId(currentTable.id);
  }, [currentTable, setActiveTableId]);

  useEffect(() => {
    if (user && location.path === '/') {
      navigateTo('/tables');
    }
  }, [location.path, user]);

  if (!currentTable) {
    return <div className="p-10 text-center">Đang tải dữ liệu</div>;
  }
  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigateTo('/tables')} className="p-2 mr-3 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-black text-lg">{currentTable.name}</h2>
        </div>
      </header>
      <OrderCart />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useState({ path: window.location.pathname, search: window.location.search });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => setLocation({ path: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsMobileMenuOpen(false);
  };

  const navState = useMemo(() => ({
    isPos: location.path.startsWith('/pos'),
    isProduct: location.path.startsWith('/products'),
    isTables: location.path === '/' || location.path.startsWith('/tables'),
    isDashboard: location.path === '/dashboard',
    isAccount: location.path === '/account'
  }), [location]);

  const navItems = [
    { path: '/tables', label: 'Quản lý bàn', icon: Grid }, // Đưa lên đầu
    { path: '/products', label: 'Sản phẩm', icon: PackagePlus },
    ...(user?.role === 'admin' ? [{ path: '/dashboard', label: 'Doanh thu', icon: LayoutDashboard }] : []),
    { path: '/account', label: 'Tài khoản', icon: UserCheck }

  ];
  useEffect(() => {
    if (location.path === '/dashboard' && user?.role !== 'admin') {
      navigateTo('/tables');
    }
  }, [location.path, user]);
  // 2. Sau khi khai báo xong mới thực hiện render có điều kiện
  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
  if (!user) return <LoginScreen />;

  // 3. Render giao diện chính
  return (
    <div className="flex h-screen w-full bg-slate-50 antialiased overflow-hidden">
      {!navState.isPos && (
        <aside className="hidden md:flex md:w-64 bg-white border-r flex-col p-5">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-xl"><Utensils className="text-white" size={20} /></div>
            <span className="font-black text-blue-600">HƯƠNG BIỂN</span>
          </div>
          <nav className="space-y-2">
            {navItems.map(item => (
              <button key={item.path} onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl font-bold transition-all ${location.path === item.path ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-[env(safe-area-inset-top)]">
        <div className="flex-1 overflow-auto">
          {navState.isPos ? (
            <PosScreen tableId={new URLSearchParams(location.search).get('tableId')} navigateTo={navigateTo} />
          ) : navState.isProduct ? (
            <ProductManagement />
          ) : navState.isDashboard ? (
            <Dashboard />
          ) : navState.isAccount ? (
            <AccountSettings /> // Hiển thị trang tài khoản
          ) : (
            <TablesSchema navigateTo={navigateTo} />
          )}
        </div>

        {!navState.isPos && (
          <nav className="md:hidden flex justify-around items-center bg-white border-t p-2 pb-[env(safe-area-inset-bottom)]">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`flex flex-col items-center p-2 rounded-xl ${location.path === item.path ? 'text-blue-600' : 'text-slate-400'}`}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RestaurantProvider>
  );
}