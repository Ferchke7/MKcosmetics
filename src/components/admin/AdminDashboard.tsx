import React, { useState, useEffect } from 'react';
import {
  Package,
  Users,
  RefreshCw,
  Globe,
  Settings,
  LogOut,
  Store,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  ClipboardList,
  Phone,
  MessageSquare,
  DollarSign,
  Filter,
  Check,
  ChevronDown,
  ShoppingBag,
  HeartHandshake,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { adminService, AdminStats, Order } from '../../services/admin/adminService';
import { TelegramPost } from '../../core/types/telegram';
import { ProductEditModal } from './ProductEditModal';

interface AdminDashboardProps {
  onBackToShop: () => void;
  posts: TelegramPost[];
  onRefreshFeed: () => Promise<void>;
}

type TabType = 'overview' | 'orders' | 'products' | 'sync' | 'visitors' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToShop,
  posts,
  onRefreshFeed,
}) => {
  const { user, token, logout, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Stats State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Orders State (CRM)
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersStatusCounts, setOrdersStatusCounts] = useState<Record<string, number>>({});
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [editingNotesOrderId, setEditingNotesOrderId] = useState<number | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');
  const [deleteOrderConfirmId, setDeleteOrderConfirmId] = useState<number | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Products Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'discount'>('newest');

  // Modals & Actions
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TelegramPost | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Load CRM dashboard stats
  const fetchStats = async () => {
    if (!token) return;
    try {
      const data = await adminService.getDashboardStats(token);
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load CRM Orders
  const fetchOrders = async () => {
    if (!token) return;
    setIsLoadingOrders(true);
    try {
      const data = await adminService.getAdminOrders(
        orderStatusFilter === 'all' ? '' : orderStatusFilter,
        orderSearchQuery,
        100,
        0,
        token
      );
      setOrders(data.orders || []);
      setOrdersTotal(data.total || 0);
      setOrdersStatusCounts(data.statusCounts || {});
    } catch (err) {
      console.error('Failed to load CRM orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'overview') {
      fetchOrders();
    }
  }, [activeTab, orderStatusFilter, orderSearchQuery, token]);

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!token) return;
    try {
      await adminService.updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      await fetchStats();
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления статуса');
    }
  };

  const handleStartEditNotes = (order: Order) => {
    setEditingNotesOrderId(order.id);
    setEditingNotesText(order.notes || '');
  };

  const handleSaveNotes = async (orderId: number) => {
    if (!token) return;
    setIsSavingNotes(true);
    try {
      await adminService.updateOrderNotes(orderId, editingNotesText, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, notes: editingNotesText } : o))
      );
      setEditingNotesOrderId(null);
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения заметки');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!token) return;
    try {
      await adminService.deleteOrder(orderId, token);
      setDeleteOrderConfirmId(null);
      await fetchOrders();
      await fetchStats();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления заказа');
    }
  };

  // Product CRUD Handlers
  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setEditModalOpen(true);
  };

  const handleOpenEditModal = (product: TelegramPost) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    if (!token) return;
    if (selectedProduct) {
      await adminService.updateProduct(selectedProduct.id, productData, token);
    } else {
      await adminService.createProduct(productData, token);
    }
    await onRefreshFeed();
    await fetchStats();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    try {
      await adminService.deleteProduct(id, token);
      setDeleteConfirmId(null);
      await onRefreshFeed();
      await fetchStats();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления товара');
    }
  };

  // Sync Handlers
  const handleTriggerSync = async (deep: boolean) => {
    if (!token || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await adminService.triggerSync(deep, token);
      setSyncMessage(res.message);
      await onRefreshFeed();
      await fetchStats();
    } catch (err: any) {
      setSyncMessage(`Ошибка: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Пароль должен быть не менее 4 символов' });
      return;
    }

    setIsChangingPass(true);
    setPasswordMsg(null);
    try {
      await changePassword(newPassword);
      setPasswordMsg({ type: 'success', text: 'Пароль успешно обновлен!' });
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Ошибка смены пароля' });
    } finally {
      setIsChangingPass(false);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mk_cosmetics_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter and sort products
  const brands = Array.from(new Set(posts.map((p) => p.brand).filter(Boolean))).sort();

  const filteredProducts = posts.filter((p) => {
    const matchSearch =
      !searchQuery.trim() ||
      p.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.text && p.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    return matchSearch && matchBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return (a.prices?.krw || 0) - (b.prices?.krw || 0);
    if (sortBy === 'priceDesc') return (b.prices?.krw || 0) - (a.prices?.krw || 0);
    if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
    return (b.timestamp || 0) - (a.timestamp || 0);
  });

  return (
    <div className="min-h-screen bg-[#141312] text-[#EDE8E1] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#1C1A18] border-b border-white/10 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8B5A2B] flex items-center justify-center text-[#141312] font-bold font-serif shadow-lg">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white text-base tracking-wide">
                MK COSMETICS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                CRM
              </span>
            </div>
            <p className="text-[11px] text-[#A8A29E]">Панель управления и база SQLite</p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#C4BDB5] hover:text-white border border-white/10 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Перейти в магазин</span>
          </button>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-xs font-bold border border-[#D4AF37]/30">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-xs font-medium text-white hidden md:inline">{user?.username}</span>
            <button
              onClick={logout}
              title="Выйти"
              className="p-1.5 text-[#A8A29E] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#181615] border-r border-white/10 p-4 space-y-1 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Обзор CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4" />
                <span>Заказы & Лиды CRM</span>
              </div>
              <div className="flex items-center gap-1">
                {(ordersStatusCounts['new'] || 0) > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold animate-pulse">
                    +{ordersStatusCounts['new']}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-[#141312]/20 text-[#141312]' : 'bg-white/10 text-[#C4BDB5]'
                }`}>
                  {ordersTotal || orders.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Товары в базе</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'products' ? 'bg-[#141312]/20 text-[#141312]' : 'bg-white/10 text-[#C4BDB5]'
              }`}>
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'sync'
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#D4AF37]' : ''}`} />
              <span>Telegram Синхронизация</span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'visitors'
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>CRM Посетители</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Настройки & Доступ</span>
            </button>
          </nav>

          <div className="pt-6 mt-6 border-t border-white/5 px-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-[#A8A29E] space-y-1.5">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Go + SQLite WAL</span>
              </div>
              <p className="text-[10px] text-[#78716C]">
                Идемпотентная персистентность. Данные защищены.
              </p>
            </div>
          </div>
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="text-xl font-bold text-white font-serif">Обзор CRM платформы</h1>
                <p className="text-xs text-[#A8A29E]">Ключевые показатели магазина, заказов и трафика</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between text-[#A8A29E] mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Заказов & Лидов CRM</span>
                    <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white font-serif">
                      {stats?.totalOrders !== undefined ? stats.totalOrders : ordersTotal}
                    </span>
                    {(ordersStatusCounts['new'] || 0) > 0 && (
                      <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {ordersStatusCounts['new']} новых
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">Быстрый заказ, корзина, квиз</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between text-[#A8A29E] mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Товаров в каталоге</span>
                    <Package className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-serif">{posts.length}</div>
                  <p className="text-[11px] text-[#78716C] mt-1">Синхронизировано из Telegram</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between text-[#A8A29E] mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Всего просмотров</span>
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-serif">
                    {stats?.totalVisits ? stats.totalVisits.toLocaleString() : '0'}
                  </div>
                  <p className="text-[11px] text-green-400 mt-1">Живой органический трафик</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between text-[#A8A29E] mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">География (стран)</span>
                    <Globe className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-serif">
                    {stats?.countries?.length || 0}
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">Реальные IP посетителей</p>
                </div>
              </div>

              {/* Geo Traffic Breakdown & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic by Country */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Распределение посетителей по странам
                    </h2>
                    <span className="text-xs text-[#A8A29E]">Живая статистика</span>
                  </div>

                  <div className="space-y-3.5">
                    {(stats?.countries || []).map((c) => {
                      const total = stats?.totalVisits || 1;
                      const percent = Math.min(100, Math.round((c.visits / total) * 100));
                      return (
                        <div key={c.code} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-medium text-[#EDE8E1]">
                              <span className="text-base">{c.flag}</span>
                              <span>{c.nameRu}</span>
                              <span className="text-[#78716C]">({c.code})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white">{c.visits.toLocaleString()}</span>
                              <span className="text-[11px] text-[#A8A29E] w-8 text-right">{percent}%</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B38F24] rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {(!stats?.countries || stats.countries.length === 0) && (
                      <p className="text-xs text-[#78716C] py-4 text-center">Ожидание первых визитов пользователей...</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                      Быстрые действия
                    </h2>
                    <p className="text-xs text-[#A8A29E]">Оперативные команды CRM</p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] text-[#141312] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#E5C158] transition-colors shadow-lg shadow-[#D4AF37]/10"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Перейти к заказам & лидам
                    </button>

                    <button
                      onClick={handleOpenAddModal}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      Добавить новый товар
                    </button>

                    <button
                      onClick={() => handleTriggerSync(false)}
                      disabled={isSyncing}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#D4AF37]' : ''}`} />
                      Синхронизировать Telegram
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#C4BDB5] text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Экспорт каталога в JSON
                    </button>
                  </div>

                  {syncMessage && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D4AF37]">
                      {syncMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRM ORDERS & LEADS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white font-serif">Заказы & Лиды CRM</h1>
                  <p className="text-xs text-[#A8A29E]">
                    Управление входящими заявками, статусами отправки и заметками менеджера
                  </p>
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={isLoadingOrders}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  Обновить список
                </button>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                {[
                  { id: 'all', label: 'Все заявки', count: ordersTotal },
                  { id: 'new', label: '🟡 Новые', count: ordersStatusCounts['new'] || 0, highlight: true },
                  { id: 'processing', label: '🔵 В обработке', count: ordersStatusCounts['processing'] || 0 },
                  { id: 'paid', label: '🟣 Оплачены', count: ordersStatusCounts['paid'] || 0 },
                  { id: 'shipped', label: '🚚 Отправлены', count: ordersStatusCounts['shipped'] || 0 },
                  { id: 'delivered', label: '🟢 Доставлены', count: ordersStatusCounts['delivered'] || 0 },
                  { id: 'cancelled', label: '⚪ Отменены', count: ordersStatusCounts['cancelled'] || 0 },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      orderStatusFilter === st.id
                        ? 'bg-[#D4AF37] text-[#141312] shadow-md'
                        : 'bg-white/5 text-[#A8A29E] hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      orderStatusFilter === st.id
                        ? 'bg-[#141312]/20 text-[#141312]'
                        : st.highlight && st.count > 0
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'bg-white/10 text-[#C4BDB5]'
                    }`}>
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search & Channel Filters */}
              <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Поиск по номеру заказа (MK-...), имени клиента или телефону..."
                    className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <select
                    value={orderTypeFilter}
                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="all">Все источники каналов</option>
                    <option value="quick_order">⚡ Быстрый заказ</option>
                    <option value="cart">🛒 Корзина магазина</option>
                    <option value="quiz_consultation">💆‍♀️ Подбор ухода (Квиз)</option>
                  </select>
                </div>
              </div>

              {/* Orders Table & Cards */}
              <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {isLoadingOrders ? (
                  <div className="p-12 text-center text-[#A8A29E] flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                    <span className="text-xs">Загрузка заказов из базы SQLite...</span>
                  </div>
                ) : orders.filter(o => orderTypeFilter === 'all' || o.type === orderTypeFilter || o.channelSource === orderTypeFilter).length === 0 ? (
                  <div className="p-12 text-center text-[#78716C] space-y-2">
                    <ClipboardList className="w-8 h-8 mx-auto text-[#78716C] opacity-40" />
                    <p className="text-sm font-medium text-white">Заказы не найдены</p>
                    <p className="text-xs text-[#78716C]">
                      Новые заявки из форм сайта и WhatsApp будут автоматически появляться здесь в реальном времени.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {orders
                      .filter(o => orderTypeFilter === 'all' || o.type === orderTypeFilter || o.channelSource === orderTypeFilter)
                      .map((order) => {
                        const isNew = order.status === 'new';
                        const statusColors: Record<string, string> = {
                          new: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                          processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                          paid: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                          shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                          delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                          cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
                        };

                        const channelBadges: Record<string, { label: string; icon: any; color: string }> = {
                          quick_order: { label: 'Быстрый заказ', icon: Zap, color: 'text-amber-400' },
                          cart: { label: 'Корзина', icon: ShoppingBag, color: 'text-emerald-400' },
                          quiz_consultation: { label: 'Подбор ухода', icon: HeartHandshake, color: 'text-rose-400' },
                          skin_quiz: { label: 'Подбор ухода', icon: HeartHandshake, color: 'text-rose-400' },
                        };

                        const channel = channelBadges[order.type] || channelBadges[order.channelSource] || {
                          label: order.channelSource || 'Заказ',
                          icon: ClipboardList,
                          color: 'text-[#D4AF37]',
                        };
                        const ChannelIcon = channel.icon;

                        const cleanPhone = (order.phone || '').replace(/[^\d+]/g, '');
                        const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : null;

                        return (
                          <div
                            key={order.id}
                            className={`p-5 sm:p-6 transition-colors hover:bg-white/[0.02] ${
                              isNew ? 'bg-amber-500/[0.03] border-l-4 border-l-amber-400' : ''
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              {/* Left Info: Order Number, Customer, Channel, Timestamp */}
                              <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="font-mono text-sm font-bold text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                                    {order.orderNumber}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/5 ${channel.color}`}>
                                    <ChannelIcon className="w-3.5 h-3.5" />
                                    <span>{channel.label}</span>
                                  </span>
                                  <span className="text-[11px] text-[#78716C] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(order.createdAt).toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs">
                                  <div className="text-white font-medium">
                                    <span className="text-[#78716C] text-[11px] block">Клиент:</span>
                                    <span className="font-semibold text-sm">{order.customerName || 'Не указано'}</span>
                                  </div>

                                  {order.phone && (
                                    <div>
                                      <span className="text-[#78716C] text-[11px] block">Телефон / Контакт:</span>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <a
                                          href={`tel:${cleanPhone}`}
                                          className="text-[#D4AF37] hover:underline font-mono"
                                        >
                                          {order.phone}
                                        </a>
                                        {waUrl && (
                                          <a
                                            href={waUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-0.5 rounded-md bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/30 text-[10px] font-bold flex items-center gap-1"
                                            title="Написать в WhatsApp"
                                          >
                                            <MessageSquare className="w-3 h-3" />
                                            WhatsApp
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Order Items or Details */}
                                {order.items && order.items.length > 0 && (
                                  <div className="pt-2">
                                    <span className="text-[11px] uppercase tracking-wider text-[#A8A29E] font-semibold block mb-1.5">
                                      Состав заказа ({order.items.length} поз.):
                                    </span>
                                    <div className="space-y-1.5">
                                      {order.items.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 p-2 rounded-xl bg-black/20 border border-white/5 text-xs"
                                        >
                                          {item.photoUrl ? (
                                            <img
                                              src={item.photoUrl}
                                              alt=""
                                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-black"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-[#78716C] flex-shrink-0">
                                              MK
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="text-white font-medium truncate">{item.title}</div>
                                            <div className="text-[11px] text-[#78716C]">
                                              Кол-во: <strong className="text-[#D4AF37]">{item.quantity} шт.</strong>
                                              {item.price > 0 && ` • ₩ ${item.price.toLocaleString()}`}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes / Comments */}
                                {order.notes && (
                                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-[#C4BDB5] whitespace-pre-line leading-relaxed">
                                    <span className="text-[10px] uppercase font-bold text-[#A8A29E] block mb-0.5">
                                      Комментарии / Данные заявки:
                                    </span>
                                    {order.notes}
                                  </div>
                                )}
                              </div>

                              {/* Right Info: Status Dropdown, Total Amount, Manager Actions */}
                              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 lg:w-64 flex-shrink-0 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                                {/* Total Amount */}
                                {order.totalAmount > 0 && (
                                  <div className="text-left lg:text-right">
                                    <span className="text-[10px] text-[#78716C] block uppercase">Сумма заказа:</span>
                                    <span className="text-lg font-bold text-[#D4AF37] font-serif">
                                      ₩ {order.totalAmount.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                                {/* Status Selector */}
                                <div className="w-full sm:w-auto lg:w-full space-y-1">
                                  <span className="text-[10px] text-[#78716C] block uppercase font-semibold">
                                    Статус заказа:
                                  </span>
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`w-full text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none cursor-pointer transition-colors ${
                                      statusColors[order.status] || 'bg-white/5 text-white border-white/10'
                                    }`}
                                  >
                                    <option value="new" className="bg-[#1C1A18] text-amber-400">🟡 Новый заказ (New)</option>
                                    <option value="processing" className="bg-[#1C1A18] text-blue-400">🔵 В обработке (Processing)</option>
                                    <option value="paid" className="bg-[#1C1A18] text-purple-400">🟣 Оплачен (Paid)</option>
                                    <option value="shipped" className="bg-[#1C1A18] text-orange-400">🚚 Отправлен из Кореи (Shipped)</option>
                                    <option value="delivered" className="bg-[#1C1A18] text-emerald-400">🟢 Доставлен клиенту (Delivered)</option>
                                    <option value="cancelled" className="bg-[#1C1A18] text-zinc-400">⚪ Отменен (Cancelled)</option>
                                  </select>
                                </div>

                                {/* Actions: Edit Notes / Delete */}
                                <div className="flex items-center gap-2 pt-1 w-full justify-end">
                                  <button
                                    onClick={() => handleStartEditNotes(order)}
                                    className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#C4BDB5] hover:text-white border border-white/5 flex items-center gap-1.5 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Заметка</span>
                                  </button>

                                  <button
                                    onClick={() => setDeleteOrderConfirmId(order.id)}
                                    className="p-1.5 rounded-lg text-[#78716C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Удалить заявку"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white font-serif">Управление товарами</h1>
                  <p className="text-xs text-[#A8A29E]">
                    Всего {posts.length} позиций в базе данных SQLite
                  </p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Добавить товар
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по названию, бренду, описанию..."
                    className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="all">Все бренды ({brands.length})</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="priceAsc">Цена: по возрастанию</option>
                    <option value="priceDesc">Цена: по убыванию</option>
                    <option value="discount">По размеру скидки</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161514] border-b border-white/10 text-[#A8A29E] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Товар</th>
                        <th className="py-3.5 px-3">Бренд</th>
                        <th className="py-3.5 px-3">Цены</th>
                        <th className="py-3.5 px-3">Скидка / Хит</th>
                        <th className="py-3.5 px-4 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Image & Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/10">
                                {p.photos && p.photos.length > 0 ? (
                                  <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#78716C] text-[10px]">
                                    Нет фото
                                  </div>
                                )}
                              </div>
                              <div className="max-w-xs sm:max-w-md">
                                <div className="font-semibold text-white truncate">{p.productTitle}</div>
                                <div className="text-[11px] text-[#78716C] truncate mt-0.5">
                                  ID: {p.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Brand */}
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#C4BDB5] text-[11px] font-medium border border-white/5">
                              {p.brand || 'K-Beauty'}
                            </span>
                          </td>

                          {/* Prices */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5 text-[11px]">
                              {p.prices?.krw && (
                                <div className="font-bold text-[#D4AF37]">
                                  ₩ {p.prices.krw.toLocaleString()}
                                </div>
                              )}
                              {p.prices?.uzs && (
                                <div className="text-[#A8A29E]">
                                  {p.prices.uzs.toLocaleString()} сум
                                </div>
                              )}
                              {p.prices?.rub && (
                                <div className="text-[#78716C]">
                                  {p.prices.rub.toLocaleString()} ₽
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Discount / Bestseller */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {p.discountPercent > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/30">
                                  -{p.discountPercent}%
                                </span>
                              )}
                              {p.isBestseller && (
                                <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] font-semibold text-[10px] border border-[#D4AF37]/30">
                                  ★ Хит
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {p.postUrl && (
                                <a
                                  href={p.postUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg text-[#78716C] hover:text-white hover:bg-white/5 transition-colors"
                                  title="Открыть в Telegram"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-2 rounded-lg text-[#A8A29E] hover:text-[#D4AF37] hover:bg-white/5 transition-colors"
                                title="Редактировать"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 rounded-lg text-[#A8A29E] hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sortedProducts.length === 0 && (
                  <div className="p-12 text-center text-[#78716C]">
                    Товары по заданным фильтрам не найдены
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TELEGRAM SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-xl font-bold text-white font-serif">Центр синхронизации Telegram</h1>
                <p className="text-xs text-[#A8A29E]">Управление фоновым парсером и ручной импорт</p>
              </div>

              {/* Channel Profile Box */}
              <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-2xl font-bold text-[#D4AF37] flex-shrink-0">
                  {stats?.channelInfo?.avatarUrl ? (
                    <img src={stats.channelInfo.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    'MK'
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-base font-bold text-white">
                      {stats?.channelInfo?.title || 'MK KOREA COSMETIC'}
                    </h2>
                    <span className="text-xs font-mono text-[#D4AF37]">
                      @{stats?.channelInfo?.username || 'mkcosmetkor'}
                    </span>
                  </div>
                  <p className="text-xs text-[#A8A29E]">
                    {stats?.channelInfo?.description || 'Прямые оптовые поставки из Южной Кореи'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#78716C]">
                    <span>Подписчиков: <strong>{stats?.channelInfo?.subscribersCount || '1.2k+'}</strong></span>
                    <span>Товаров в SQLite: <strong>{posts.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Sync Trigger Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Быстрая синхронизация</h3>
                    <p className="text-xs text-[#A8A29E]">
                      Сканирует последние 20 постов на канале и обновляет свежие цены и новинки.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTriggerSync(false)}
                    disabled={isSyncing}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] text-xs font-bold flex items-center justify-center gap-2 border border-[#D4AF37]/30 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    Запустить быстрый синк
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Глубокий архивный парсинг</h3>
                    <p className="text-xs text-[#A8A29E]">
                      Выполняет пагинацию до 20 страниц вглубь истории для выгрузки всех старых постов.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTriggerSync(true)}
                    disabled={isSyncing}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] text-[#141312] text-xs font-bold flex items-center justify-center gap-2 hover:from-[#E5C158] hover:to-[#C49E30] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Запустить глубокий синк (Deep Scrape)
                  </button>
                </div>
              </div>

              {syncMessage && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#D4AF37] flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VISITORS CRM */}
          {activeTab === 'visitors' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="text-xl font-bold text-white font-serif">CRM Посетители & Гео-трафик</h1>
                <p className="text-xs text-[#A8A29E]">
                  Учет переходов пользователей и распределение по странам мира
                </p>
              </div>

              {/* Geo Table */}
              <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-white/10 bg-[#161514] flex items-center justify-between">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Сводка по странам мира
                  </h2>
                  <span className="text-xs text-[#A8A29E]">
                    Всего: {stats?.totalVisits !== undefined ? stats.totalVisits.toLocaleString() : '0'} визитов
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141312] text-[#A8A29E] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Флаг & Страна</th>
                        <th className="py-3 px-3">Код</th>
                        <th className="py-3 px-3">Визиты</th>
                        <th className="py-3 px-4 text-right">Доля трафика</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(stats?.countries || []).map((c) => {
                        const total = stats?.totalVisits || 1;
                        const percent = Math.min(100, Math.round((c.visits / total) * 100));
                        return (
                          <tr key={c.code} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                              <span className="text-lg">{c.flag}</span>
                              <span>{c.nameRu}</span>
                              <span className="text-[#78716C] text-[11px]">/ {c.nameUz}</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[#D4AF37]">{c.code}</td>
                            <td className="py-3 px-3 font-bold text-white">{c.visits.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-medium text-[#A8A29E]">{percent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Access Logs */}
              {stats?.recentLogs && stats.recentLogs.length > 0 && (
                <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-white/10 bg-[#161514]">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      Последние записи визитов (Live Access Logs)
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#141312] text-[#A8A29E] text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">ID</th>
                          <th className="py-2.5 px-3">IP Адрес</th>
                          <th className="py-2.5 px-3">Страна</th>
                          <th className="py-2.5 px-4 text-right">Время</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px]">
                        {stats.recentLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-4 text-[#78716C]">#{log.id}</td>
                            <td className="py-2.5 px-3 text-[#EDE8E1]">{log.ip}</td>
                            <td className="py-2.5 px-3 text-[#D4AF37]">{log.countryCode}</td>
                            <td className="py-2.5 px-4 text-right text-[#A8A29E]">
                              {new Date(log.visitedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS & ACCESS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-xl font-bold text-white font-serif">Настройки и безопасность</h1>
                <p className="text-xs text-[#A8A29E]">Управление паролем и системные параметры</p>
              </div>

              {/* Change Password Form */}
              <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Сменить пароль администратора
                </h2>

                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passwordMsg.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A8A29E] mb-1.5">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Новый надежный пароль..."
                      className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="py-2.5 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isChangingPass ? 'Обновление...' : 'Обновить пароль'}
                  </button>
                </form>
              </div>

              {/* Architecture Info Box */}
              <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Архитектура & Стек системы
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[#78716C] block text-[10px]">Бэкенд</span>
                    <strong className="text-white">Go (Golang 1.24)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[#78716C] block text-[10px]">База данных</span>
                    <strong className="text-white">SQLite Pure Go (WAL Mode)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[#78716C] block text-[10px]">Авторизация</span>
                    <strong className="text-white">100% Open Source JWT (HMAC-SHA256)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[#78716C] block text-[10px]">Архитектурный паттерн</span>
                    <strong className="text-white">Clean Architecture & DDD</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Edit / Add Modal */}
      <ProductEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Удалить товар?</h3>
            </div>
            <p className="text-xs text-[#A8A29E]">
              Вы уверены, что хотите удалить товар <strong className="text-white">#{deleteConfirmId}</strong> из базы данных SQLite?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-4 rounded-xl border border-white/10 text-xs font-semibold text-[#A8A29E] hover:bg-white/5"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Notes Edit Modal */}
      {editingNotesOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">Заметки менеджера</h3>
              </div>
              <span className="font-mono text-xs text-[#A8A29E]">
                Заказ #{orders.find((o) => o.id === editingNotesOrderId)?.orderNumber}
              </span>
            </div>

            <textarea
              rows={5}
              value={editingNotesText}
              onChange={(e) => setEditingNotesText(e.target.value)}
              placeholder="Внутренний комментарий (статус оплаты, трек-номер, пожелания клиента)..."
              className="w-full bg-[#141312] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setEditingNotesOrderId(null)}
                disabled={isSavingNotes}
                className="py-2 px-4 rounded-xl border border-white/10 text-xs font-semibold text-[#A8A29E] hover:bg-white/5"
              >
                Отмена
              </button>
              <button
                onClick={() => handleSaveNotes(editingNotesOrderId)}
                disabled={isSavingNotes}
                className="py-2 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {isSavingNotes ? 'Сохранение...' : 'Сохранить заметку'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deleteOrderConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Удалить заявку?</h3>
            </div>
            <p className="text-xs text-[#A8A29E]">
              Вы уверены, что хотите удалить заявку{' '}
              <strong className="text-white">
                #{orders.find((o) => o.id === deleteOrderConfirmId)?.orderNumber || deleteOrderConfirmId}
              </strong>{' '}
              из CRM базы?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteOrderConfirmId(null)}
                className="py-2 px-4 rounded-xl border border-white/10 text-xs font-semibold text-[#A8A29E] hover:bg-white/5"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteOrderConfirmId)}
                className="py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
