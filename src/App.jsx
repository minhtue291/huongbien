import React, { useState, useEffect, useMemo } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import OrderCart from './components/order/OrderCart';
import Dashboard from './components/dashboard/Dashboard';
import TablesSchema from './components/dashboard/TablesSchema';
import ProductManagement from './components/products/ProductManagement';
import { Utensils, LayoutDashboard, Grid, ArrowLeft, UserCheck, CheckCircle, PackagePlus, Menu } from 'lucide-react';

function PosScreen({ tableId, navigateTo }) {
  const { setActiveTableId, tables } = useRestaurant();
  const currentTable = useMemo(() => tables.find(t => t.id === parseInt(tableId)), [tableId, tables]);

  useEffect(() => {
    if (currentTable) setActiveTableId(currentTable.id);
  }, [currentTable, setActiveTableId]);

  if (!currentTable) return <div className="p-10 text-center">Bàn không tồn tại!</div>;

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Header Mobile & Desktop */}
      <header className="bg-white border-b px-4 py-3 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigateTo('/tables')} className="p-2 mr-3 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-black text-lg">{currentTable.name}</h2>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {currentTable.status === 'occupied' ? 'Đang phục vụ' : 'Bàn trống'}
          </span>
        </div>
      </header>
      <div className="flex-1 overflow-hidden"><OrderCart /></div>
    </div>
  );
}

function AppContent() {
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
    isTables: location.path.startsWith('/tables'),
    isDashboard: location.path === '/'
  }), [location]);

  const navItems = [
    { path: '/', label: 'Doanh thu', icon: LayoutDashboard },
    { path: '/tables', label: 'Quản lý bàn', icon: Grid },
    { path: '/products', label: 'Sản phẩm', icon: PackagePlus }
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 antialiased overflow-hidden">
      
      {/* SIDEBAR - Ẩn trên mobile trừ khi mở menu */}
      {!navState.isPos && (
        <aside className={`${isMobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'} md:flex md:w-64 bg-white border-r flex flex-col p-5`}>
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Hamburger (chỉ hiện ngoài trang POS) */}
        {!navState.isPos && (
          <button className="md:hidden p-4 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        )}
        
        <div className="flex-1 overflow-auto">
          {navState.isPos ? (
            <PosScreen tableId={new URLSearchParams(location.search).get('tableId')} navigateTo={navigateTo} />
          ) : navState.isProduct ? (
            <ProductManagement />
          ) : navState.isTables ? (
            <TablesSchema navigateTo={navigateTo} />
          ) : (
            <Dashboard />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}