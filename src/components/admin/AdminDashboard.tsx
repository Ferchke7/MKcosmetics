import React, { useState, useEffect } from 'react';
import {
  Package,
  Users,
  RefreshCw,
  Globe,
  Settings,
  LogOut,
  Store,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
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
  MapPin,
  Image as ImageIcon,
  CreditCard,
  Eye,
  X,
  Layers,
  FileSpreadsheet,
  LineChart,
  TrendingUp,
  BookOpen,
  Send,
  Database,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { adminService, AdminStats, Order } from '../../services/admin/adminService';
import { TelegramPost } from '../../core/types/telegram';
import { ProductEditModal } from './ProductEditModal';
import { OrderProcessingModal } from './OrderProcessingModal';
import { AnalyticsEChartsView } from './AnalyticsEChartsView';
import { SalesUnitEconomicsView } from './SalesUnitEconomicsView';
import { InventoryVariantsView } from './InventoryVariantsView';
import { StaffManagementView } from './StaffManagementView';
import { DataExportModal } from './DataExportModal';
import { CustomerCRMView } from './CustomerCRMView';
import { BeautyBlogView } from '../blog/BeautyBlogView';
import { TelegramDummyImportModal } from './TelegramDummyImportModal';
import { UnifiedDataGrid, Column, BulkAction } from './UnifiedDataGrid';

interface AdminDashboardProps {
  onBackToShop: () => void;
  posts: TelegramPost[];
  onRefreshFeed: () => Promise<void>;
}

type TabType =
  | 'overview'
  | 'sales'
  | 'orders'
  | 'customers'
  | 'staff'
  | 'products'
  | 'articles'
  | 'variants'
  | 'sync'
  | 'visitors'
  | 'settings';

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
  const [sellerFilter, setSellerFilter] = useState('all');
  const [selectedOrderForProcessing, setSelectedOrderForProcessing] = useState<Order | null>(null);
  const [lightboxReceiptUrl, setLightboxReceiptUrl] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDummyModalOpen, setIsDummyModalOpen] = useState(false);

  // Product CRUD State
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
        '',
        500,
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
  }, [activeTab, orderStatusFilter, token]);

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

  const handleDeleteOrder = async (orderId: number) => {
    if (!token) return;
    try {
      await adminService.deleteOrder(orderId, token);
      await fetchOrders();
      await fetchStats();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления заказа');
    }
  };

  const handleSaveProcessedOrder = async (updatedFields: Partial<Order>) => {
    if (!selectedOrderForProcessing || !token) return;
    try {
      const updated = await adminService.processOrder(selectedOrderForProcessing.id, updatedFields, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
      );
      setSelectedOrderForProcessing(null);
      await fetchStats();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения обработки заказа');
      throw err;
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

  // Trigger sync from Telegram
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

  // 1-Click XLSX Export Handlers
  const handleExportProductsXLSX = () => {
    window.open('/api/admin/products/export/xlsx', '_blank');
  };

  const handleExportOrdersXLSX = () => {
    const url = `/api/admin/orders/export/xlsx${orderStatusFilter !== 'all' ? `?status=${orderStatusFilter}` : ''}`;
    window.open(url, '_blank');
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

  // Format money helper
  const fmtMoney = (val?: number) => {
    if (!val) return '0 сум';
    return new Intl.NumberFormat('ru-RU').format(Math.round(val)) + ' сум';
  };

  // Orders Columns for UnifiedDataGrid
  const orderColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: '№ Заказа / Дата',
      sortable: true,
      render: (o) => (
        <div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="text-amber-400">#{o.orderNumber}</span>
            {o.status === 'new' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {new Date(o.createdAt).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Клиент / Телефон',
      sortable: true,
      render: (o) => (
        <div>
          <div className="font-semibold text-neutral-200">{o.customerName || 'Покупатель'}</div>
          <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-neutral-500" />
            <span>{o.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Город / Адрес',
      sortable: true,
      render: (o) => (
        <div className="text-xs">
          <div className="font-medium text-neutral-300 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400/70" />
            <span>{o.city || 'Ташкент'}</span>
          </div>
          {o.shippingAddress && (
            <div className="text-neutral-500 truncate max-w-[150px]">{o.shippingAddress}</div>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Сумма заказа',
      sortable: true,
      align: 'right',
      render: (o) => (
        <div className="text-right">
          <div className="font-bold text-emerald-400">{fmtMoney(o.totalAmount)}</div>
          <div className="text-[11px] text-neutral-500">{o.items?.length || 0} тов.</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      align: 'center',
      render: (o) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          new: { label: 'Новый', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
          processing: { label: 'В обработке', color: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
          paid: { label: 'Оплачен', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
          shipped: { label: 'Отправлен', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
          delivered: { label: 'Доставлен', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
          cancelled: { label: 'Отменен', color: 'bg-neutral-800 text-neutral-400 border-neutral-700' },
        };
        const st = statusMap[o.status] || { label: o.status, color: 'bg-neutral-800 text-neutral-400' };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
            {st.label}
          </span>
        );
      },
    },
    {
      key: 'receipt',
      header: 'Чек оплаты',
      align: 'center',
      render: (o) => {
        if (o.paymentReceiptUrl) {
          return (
            <button
              onClick={() => setLightboxReceiptUrl(o.paymentReceiptUrl!)}
              className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 hover:bg-emerald-500/30 transition-colors mx-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Чек 📄</span>
            </button>
          );
        }
        return <span className="text-neutral-600 text-xs">—</span>;
      },
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'center',
      render: (o) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedOrderForProcessing(o)}
            className="p-1.5 rounded-lg bg-[#25221F] hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 border border-amber-500/10 transition-all"
            title="Обработать заказ"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Удалить заказ #${o.orderNumber}?`)) {
                handleDeleteOrder(o.id);
              }
            }}
            className="p-1.5 rounded-lg bg-[#25221F] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-amber-500/10 transition-all"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Bulk actions for Orders
  const orderBulkActions: BulkAction<Order>[] = [
    {
      label: 'Отметить: В обработке',
      variant: 'default',
      onClick: async (items, clear) => {
        for (const item of items) {
          await adminService.updateOrderStatus(item.id, 'processing', token || '');
        }
        await fetchOrders();
        clear();
      },
    },
    {
      label: 'Отметить: Оплачен',
      variant: 'gold',
      onClick: async (items, clear) => {
        for (const item of items) {
          await adminService.updateOrderStatus(item.id, 'paid', token || '');
        }
        await fetchOrders();
        clear();
      },
    },
  ];

  // Product Columns for UnifiedDataGrid
  const productColumns: Column<TelegramPost>[] = [
    {
      key: 'productTitle',
      header: 'Товар / Фото',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#221F1C] border border-amber-500/20 overflow-hidden shrink-0">
            {p.photos && p.photos.length > 0 ? (
              <img src={p.photos[0]} alt={p.productTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-white text-sm line-clamp-1">{p.productTitle}</div>
            <div className="text-xs text-amber-400 font-semibold">{p.brand || 'Корея'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'priceUZS',
      header: 'Цена (UZS)',
      sortable: true,
      align: 'right',
      accessor: (p) => p.prices?.uzs || 0,
      render: (p) => (
        <span className="font-bold text-emerald-400">
          {fmtMoney(p.prices?.uzs)}
        </span>
      ),
    },
    {
      key: 'priceKRW',
      header: 'Цена (KRW)',
      sortable: true,
      align: 'right',
      accessor: (p) => p.prices?.krw || 0,
      render: (p) => (
        <span className="text-neutral-300 font-medium">
          {p.prices?.krw ? `₩ ${p.prices.krw.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'discountPercent',
      header: 'Скидка',
      sortable: true,
      align: 'center',
      render: (p) =>
        p.discountPercent > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            -{p.discountPercent}%
          </span>
        ) : (
          <span className="text-neutral-600 text-xs">—</span>
        ),
    },
    {
      key: 'views',
      header: 'Просмотры',
      sortable: true,
      align: 'center',
      render: (p) => <span className="text-neutral-400 text-xs">{p.views || 0}</span>,
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'center',
      render: (p) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleOpenEditModal(p)}
            className="p-1.5 rounded-lg bg-[#25221F] hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 border border-amber-500/10 transition-all"
            title="Редактировать"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {p.postUrl && (
            <a
              href={p.postUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-[#25221F] hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all"
              title="Открыть в Telegram"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => setDeleteConfirmId(p.id)}
            className="p-1.5 rounded-lg bg-[#25221F] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-amber-500/10 transition-all"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#141312] text-[#EDE8E1] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-[#1C1A18] border-b border-amber-500/20 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-black font-black font-serif shadow-lg">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-white text-base tracking-wide">
                MK COSMETICS ENTERPRISE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ERP/CRM
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Управление магазином корейской косметики</p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Telegram Dummy Loader Trigger */}
          <button
            onClick={() => setIsDummyModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/40 text-xs text-sky-300 font-semibold transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Импорт из Telegram</span>
          </button>

          {/* Quick XLSX Export */}
          <button
            onClick={handleExportProductsXLSX}
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs text-emerald-300 font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Каталог .xlsx</span>
          </button>

          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white border border-white/10 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">В магазин</span>
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 transition-colors"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#181614] border-r border-amber-500/10 p-4 shrink-0 flex flex-col justify-between">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Аналитика ECharts</span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'sales'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Юнит-Экономика</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4" />
                <span>Заказы & Лиды CRM</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'orders'
                    ? 'bg-black/20 text-black font-bold'
                    : 'bg-white/10 text-neutral-300'
                }`}
              >
                {ordersTotal || orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Клиенты (CRM)</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Продавцы & Зарплата (HRM)</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Каталог Товаров</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'products'
                    ? 'bg-black/20 text-black font-bold'
                    : 'bg-white/10 text-neutral-300'
                }`}
              >
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'articles'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Бьюти-Журнал (Статьи)</span>
            </button>

            <button
              onClick={() => setActiveTab('variants')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'variants'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Склад & Варианты</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'sync'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Telegram Синхронизация</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Настройки & Доступ</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-amber-500/10">
            <div className="p-3 rounded-2xl bg-[#141210] border border-amber-500/10 text-xs text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Go + SQLite WAL</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                Нативная генерация Excel `.xlsx` и CRM база.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* TAB: ECHARTS OVERVIEW */}
          {activeTab === 'overview' && <AnalyticsEChartsView token={token || ''} />}

          {/* TAB: SALES UNIT ECONOMICS */}
          {activeTab === 'sales' && <SalesUnitEconomicsView token={token || ''} />}

          {/* TAB: ORDERS & LEADS (Unified DataGrid) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 border-b border-amber-500/10 pb-4">
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
                        ? 'bg-amber-500 text-black shadow-md font-bold'
                        : 'bg-[#1C1A18] text-neutral-400 hover:text-white border border-amber-500/10'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        orderStatusFilter === st.id
                          ? 'bg-black/20 text-black font-bold'
                          : st.highlight && st.count > 0
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : 'bg-white/10 text-neutral-400'
                      }`}
                    >
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

              <UnifiedDataGrid<Order>
                data={orders}
                columns={orderColumns}
                keyExtractor={(item) => item.id}
                title="Реестр Заказов и Лидов CRM"
                subtitle="Обработка входящих заказов, чеки оплаты и статус доставки"
                searchPlaceholder="Поиск по номеру, имени, телефону, городу..."
                searchFields={['orderNumber', 'customerName', 'phone', 'city', 'shippingAddress']}
                loading={isLoadingOrders}
                onRefresh={fetchOrders}
                onExportXLSX={handleExportOrdersXLSX}
                bulkActions={orderBulkActions}
              />
            </div>
          )}

          {/* TAB: CRM CUSTOMERS */}
          {activeTab === 'customers' && <CustomerCRMView />}

          {/* TAB: HRM STAFF MANAGEMENT */}
          {activeTab === 'staff' && <StaffManagementView token={token || ''} />}

          {/* TAB: PRODUCTS (Unified DataGrid) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <UnifiedDataGrid<TelegramPost>
                data={posts}
                columns={productColumns}
                keyExtractor={(item) => item.id}
                title="Каталог Товаров Корейской Косметики"
                subtitle="База товаров из Telegram-канала @mkcosmetkor с ценами и фото"
                searchPlaceholder="Поиск по наименованию, бренду, описанию..."
                searchFields={['productTitle', 'brand', 'text']}
                onRefresh={onRefreshFeed}
                onExportXLSX={handleExportProductsXLSX}
                headerActionSlot={
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить товар</span>
                  </button>
                }
              />
            </div>
          )}

          {/* TAB: BEAUTY MAGAZINE & ARTICLES */}
          {activeTab === 'articles' && <BeautyBlogView />}

          {/* TAB: INVENTORY VARIANTS */}
          {activeTab === 'variants' && <InventoryVariantsView token={token || ''} />}

          {/* TAB: TELEGRAM SYNC */}
          {activeTab === 'sync' && (
            <div className="max-w-2xl space-y-6">
              <div className="p-6 rounded-3xl bg-[#181614] border border-amber-500/20 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Синхронизация с Telegram</h3>
                    <p className="text-xs text-neutral-400">Канал @mkcosmetkor • Автоматический сбор каждые 3 мин.</p>
                  </div>
                </div>

                {syncMessage && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    {syncMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleTriggerSync(false)}
                    disabled={isSyncing}
                    className="p-4 rounded-2xl bg-[#221F1C] hover:bg-[#2C2824] border border-amber-500/20 text-left transition-all disabled:opacity-50"
                  >
                    <div className="font-bold text-white text-sm">Обычная синхронизация</div>
                    <div className="text-xs text-neutral-400 mt-1">Проверяет последние новые посты</div>
                  </button>

                  <button
                    onClick={() => handleTriggerSync(true)}
                    disabled={isSyncing}
                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-left font-bold transition-all disabled:opacity-50 shadow-lg"
                  >
                    <div className="text-sm">Глубокий Scrape (40+ страниц)</div>
                    <div className="text-xs opacity-80 mt-1">Полная перезагрузка каталога</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & PASSWORD */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              <div className="p-6 rounded-3xl bg-[#181614] border border-amber-500/20 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white">Смена пароля администратора</h3>
                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Минимум 4 символа"
                      className="w-full p-2.5 bg-[#141210] border border-amber-500/20 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    {isChangingPass ? 'Сохранение...' : 'Обновить пароль'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {isDummyModalOpen && (
        <TelegramDummyImportModal
          isOpen={isDummyModalOpen}
          onClose={() => setIsDummyModalOpen(false)}
          onSuccess={async () => {
            await onRefreshFeed();
            await fetchStats();
          }}
        />
      )}

      {isExportModalOpen && (
        <DataExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          token={token || ''}
          orders={orders}
        />
      )}

      {editModalOpen && (
        <ProductEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          product={selectedProduct}
          onSave={handleSaveProduct}
        />
      )}

      {selectedOrderForProcessing && (
        <OrderProcessingModal
          isOpen={!!selectedOrderForProcessing}
          onClose={() => setSelectedOrderForProcessing(null)}
          order={selectedOrderForProcessing}
          onSave={handleSaveProcessedOrder}
          token={token || ''}
        />
      )}

      {/* Lightbox for receipt */}
      {lightboxReceiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxReceiptUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[#141210] border border-amber-500/30 rounded-3xl p-3 overflow-hidden">
            <button
              onClick={() => setLightboxReceiptUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxReceiptUrl}
              alt="Чек оплаты"
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Delete product confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="p-6 rounded-3xl bg-[#181614] border border-red-500/30 max-w-md w-full text-center space-y-4 shadow-2xl">
            <Trash2 className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Удалить товар из базы?</h3>
            <p className="text-xs text-neutral-400">Это действие удалит товар из базы данных SQLite.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#25221F] text-neutral-300 text-xs font-semibold rounded-xl"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl"
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
