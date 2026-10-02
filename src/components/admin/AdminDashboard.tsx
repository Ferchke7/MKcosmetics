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
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { adminService, AdminStats } from '../../services/admin/adminService';
import { TelegramPost } from '../../core/types/telegram';
import { ProductEditModal } from './ProductEditModal';

interface AdminDashboardProps {
  onBackToShop: () => void;
  posts: TelegramPost[];
  onRefreshFeed: () => Promise<void>;
}

type TabType = 'overview' | 'products' | 'sync' | 'visitors' | 'settings';

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

  useEffect(() => {
    fetchStats();
  }, [token]);

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
                <p className="text-xs text-[#A8A29E]">Ключевые показатели магазина и трафика</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    {stats?.totalVisits ? stats.totalVisits.toLocaleString() : '3,316+'}
                  </div>
                  <p className="text-[11px] text-green-400 mt-1">Органический трафик</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between text-[#A8A29E] mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">География (стран)</span>
                    <Globe className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-2xl font-bold text-white font-serif">
                    {stats?.countries?.length || 7}
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">Узбекистан, РФ, СНГ, Корея</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10">
                  <div className="flex items-center justify-between text-[#A8A29E] mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Telegram статус</span>
                    <RefreshCw className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Активен (каждые 3 мин)
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">@mkcosmetkor</p>
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
                      onClick={handleOpenAddModal}
                      className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] text-[#141312] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#E5C158] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить новый товар
                    </button>

                    <button
                      onClick={() => handleTriggerSync(false)}
                      disabled={isSyncing}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
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
                    Всего: {stats?.totalVisits?.toLocaleString() || '3,316'} визитов
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
    </div>
  );
};
