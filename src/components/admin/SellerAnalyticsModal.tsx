import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Search,
  FileSpreadsheet,
  Printer,
  Calendar,
  Percent,
  Award,
  ArrowUpRight,
  Download,
  Filter,
  Layers,
  Phone,
  Shield,
  Package,
  CreditCard,
  ChevronDown,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  adminService,
  StaffMember,
  StaffPayrollSummary,
  Order,
  OrderItem,
} from '../../services/admin/adminService';

interface SellerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  token: string;
  onOpenPayslip?: (summary: StaffPayrollSummary) => void;
}

export const SellerAnalyticsModal: React.FC<SellerAnalyticsModalProps> = ({
  isOpen,
  onClose,
  staff,
  token,
  onOpenPayslip,
}) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [orders, setOrders] = useState<Order[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<StaffPayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Commission settings (default 3% or from payroll)
  const [commissionRate, setCommissionRate] = useState<number>(3.0);
  const [commissionType, setCommissionType] = useState<'revenue' | 'margin'>('revenue');

  useEffect(() => {
    if (isOpen && staff) {
      loadSellerData();
    }
  }, [isOpen, staff, period, token]);

  const loadSellerData = async () => {
    if (!staff) return;
    setIsLoading(true);
    try {
      // 1. Fetch orders assigned to this seller
      const res = await adminService.getAdminOrders('', staff.username, 300, 0, token);
      const sellerOrders = (res.orders || []).filter(
        (o) =>
          (o.assignedTo || '').toLowerCase() === staff.username.toLowerCase() ||
          (o.assignedTo || '').toLowerCase() === staff.displayName.toLowerCase()
      );
      setOrders(sellerOrders);

      // 2. Fetch payroll data to get precise margin and payouts
      const payrollRes = await adminService.getStaffPayroll(
        {
          month: period === '30d' ? new Date().toISOString().slice(0, 7) : 'all',
          commissionType,
          commissionRate,
        },
        token
      );

      const foundPayroll = (payrollRes.staffPayrolls || []).find(
        (p) =>
          p.username.toLowerCase() === staff.username.toLowerCase() ||
          p.displayName.toLowerCase() === staff.displayName.toLowerCase()
      );
      if (foundPayroll) {
        setPayrollSummary(foundPayroll);
      }
    } catch (err) {
      console.error('Failed to load seller analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by time period
  const filteredByPeriodOrders = useMemo(() => {
    if (period === 'all') return orders;
    const now = new Date().getTime();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt).getTime();
      return orderDate >= cutoff;
    });
  }, [orders, period]);

  // Filter orders by search & status
  const visibleOrders = useMemo(() => {
    return filteredByPeriodOrders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q) ||
        (o.city || '').toLowerCase().includes(q) ||
        (o.notes || '').toLowerCase().includes(q) ||
        (o.items || []).some((item) => (item.title || '').toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [filteredByPeriodOrders, statusFilter, searchQuery]);

  // Aggregate Metrics Calculations
  const metrics = useMemo(() => {
    let totalRevenueKRW = 0;
    let totalCostKRW = 0;
    let unitsSold = 0;
    let paidCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let newCount = 0;

    const paymentMethodsMap: Record<string, number> = {};
    const topProductsMap: Record<string, { title: string; count: number; revenue: number }> = {};

    filteredByPeriodOrders.forEach((o) => {
      const amt = o.totalAmount || 0;
      const cost = o.costPrice || 0;

      // Status counters
      if (o.status === 'paid') paidCount++;
      else if (o.status === 'processing') processingCount++;
      else if (o.status === 'shipped') shippedCount++;
      else if (o.status === 'delivered') deliveredCount++;
      else if (o.status === 'cancelled') cancelledCount++;
      else if (o.status === 'new') newCount++;

      // Revenue only considers non-cancelled orders
      if (o.status !== 'cancelled') {
        totalRevenueKRW += amt;
        totalCostKRW += cost;
      }

      // Items count
      (o.items || []).forEach((item) => {
        unitsSold += item.quantity || 1;
        if (item.title) {
          if (!topProductsMap[item.title]) {
            topProductsMap[item.title] = { title: item.title, count: 0, revenue: 0 };
          }
          topProductsMap[item.title].count += item.quantity || 1;
          topProductsMap[item.title].revenue += (item.price || 0) * (item.quantity || 1);
        }
      });

      // Payment method
      const pay = o.paymentMethod || 'Не указан';
      paymentMethodsMap[pay] = (paymentMethodsMap[pay] || 0) + 1;
    });

    const totalOrders = filteredByPeriodOrders.length;
    const successfulOrders = paidCount + shippedCount + deliveredCount;
    const totalMarginKRW = Math.max(0, totalRevenueKRW - totalCostKRW);
    const totalRevenueUZS = Math.round(totalRevenueKRW * 10);
    const totalMarginUZS = Math.round(totalMarginKRW * 10);

    const conversionRate = totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : '0';
    const averageOrderKRW = successfulOrders > 0 ? Math.round(totalRevenueKRW / successfulOrders) : 0;
    const averageOrderUZS = Math.round(averageOrderKRW * 10);

    // Calculated Commission
    const commissionEarnedUZS =
      commissionType === 'margin'
        ? Math.round((totalMarginUZS * commissionRate) / 100)
        : Math.round((totalRevenueUZS * commissionRate) / 100);

    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      successfulOrders,
      paidCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      newCount,
      totalRevenueKRW,
      totalRevenueUZS,
      totalCostKRW,
      totalMarginKRW,
      totalMarginUZS,
      unitsSold,
      conversionRate,
      averageOrderKRW,
      averageOrderUZS,
      commissionEarnedUZS,
      paymentMethodsMap,
      topProducts,
    };
  }, [filteredByPeriodOrders, commissionRate, commissionType]);

  // Export CSV for this seller
  const handleExportSellerCSV = () => {
    if (!staff || visibleOrders.length === 0) {
      alert('Нет заказов для экспорта');
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        '№ Заказа',
        'Дата',
        'Клиент',
        'Телефон',
        'Город',
        'Адрес',
        'Статус',
        'Способ оплаты',
        'Сумма (KRW)',
        'Сумма (UZS)',
        'Товары',
        'Заметки',
      ];

      const rows = visibleOrders.map((o) => {
        const itemsStr = (o.items || []).map((i) => `${i.title} (${i.quantity} шт.)`).join('; ');
        const amtUzs = Math.round((o.totalAmount || 0) * 10);
        return [
          `"${o.orderNumber}"`,
          `"${new Date(o.createdAt).toLocaleString('ru-RU')}"`,
          `"${(o.customerName || '').replace(/"/g, '""')}"`,
          `"${(o.phone || '').replace(/"/g, '""')}"`,
          `"${(o.city || '').replace(/"/g, '""')}"`,
          `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
          `"${o.status}"`,
          `"${o.paymentMethod || ''}"`,
          o.totalAmount || 0,
          amtUzs,
          `"${itemsStr.replace(/"/g, '""')}"`,
          `"${(o.notes || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seller_${staff.username}_sales_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Ошибка экспорта данных');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !staff) return null;

  const statusColors: Record<string, { label: string; bg: string; text: string; border: string }> = {
    new: { label: 'Новый', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    processing: { label: 'В обработке', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    paid: { label: 'Оплачен', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    shipped: { label: 'Отправлен', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    delivered: { label: 'Доставлен', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    cancelled: { label: 'Отменен', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#141312] text-[#EDE8E1] border border-[#D4AF37]/30 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Header Profile Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1C1A18] via-[#161514] to-[#1C1A18] border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#8B5A2B] text-[#141312] flex items-center justify-center font-bold text-2xl shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/40">
                {staff.displayName.charAt(0).toUpperCase() || staff.username.charAt(0).toUpperCase()}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#141312] ${
                  staff.isActive ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                title={staff.isActive ? 'Активен' : 'Отключен'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white font-serif tracking-wide">
                  {staff.displayName}
                </h2>
                <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/30">
                  @{staff.username}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold">
                  {staff.role === 'admin'
                    ? '👑 Администратор'
                    : staff.role === 'manager'
                    ? '🛍 Продавец-консультант'
                    : '✈️ Логистика'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#A8A29E] mt-1.5 flex-wrap">
                {staff.phone && (
                  <a
                    href={`tel:${staff.phone}`}
                    className="flex items-center gap-1 text-[#D4AF37] hover:underline font-mono"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{staff.phone}</span>
                  </a>
                )}
                <span>•</span>
                <span>
                  Личная аналитика эффективности, закрытых заказов и расчет бонусов
                </span>
              </div>
            </div>
          </div>

          {/* Action & Period Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            {/* Period Switcher */}
            <div className="flex items-center bg-[#141312] p-1 rounded-xl border border-white/10 text-xs">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    period === p
                      ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-md shadow-[#D4AF37]/20'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  {p === '7d' ? '7 дн.' : p === '30d' ? '30 дн.' : p === '90d' ? '90 дн.' : 'Все время'}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportSellerCSV}
              disabled={isExporting}
              className="py-2 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Выгрузить заказы продавца в Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Экспорт Excel</span>
            </button>

            {/* Payslip PDF */}
            {onOpenPayslip && payrollSummary && (
              <button
                onClick={() => onOpenPayslip(payrollSummary)}
                className="py-2 px-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                title="Сформировать расчетный листок PDF"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Листок PDF</span>
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8A29E] hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Analytics Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Main KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* KPI 1: Revenue */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-[#1C1A18] to-[#25221F] border border-[#D4AF37]/30 space-y-1.5 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-[#D4AF37]">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  Выручка продавца
                </span>
                <DollarSign className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">
                {metrics.totalRevenueUZS.toLocaleString()} <span className="text-xs text-[#D4AF37]">сум</span>
              </div>
              <div className="text-[11px] font-mono text-[#A8A29E] flex items-center justify-between">
                <span>≈ ₩ {metrics.totalRevenueKRW.toLocaleString()}</span>
                <span className="text-emerald-400 font-semibold">Оборот продаж</span>
              </div>
            </div>

            {/* KPI 2: Gross Margin */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1A18] border border-white/10 space-y-1.5 shadow-xl">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  Прибыль / Маржа
                </span>
                <TrendingUp className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-serif">
                {metrics.totalMarginUZS.toLocaleString()} <span className="text-xs text-emerald-500">сум</span>
              </div>
              <div className="text-[11px] font-mono text-[#A8A29E] flex items-center justify-between">
                <span>≈ ₩ {metrics.totalMarginKRW.toLocaleString()}</span>
                <span className="text-emerald-400 font-semibold">
                  {metrics.totalRevenueKRW > 0
                    ? `${((metrics.totalMarginKRW / metrics.totalRevenueKRW) * 100).toFixed(0)}% маржа`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* KPI 3: Orders & Units */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1A18] border border-white/10 space-y-1.5 shadow-xl">
              <div className="flex items-center justify-between text-blue-400">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  Заказы и Товары
                </span>
                <ShoppingBag className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-serif">
                {metrics.successfulOrders}{' '}
                <span className="text-xs text-[#A8A29E] font-normal font-sans">
                  / {metrics.totalOrders} зак.
                </span>
              </div>
              <div className="text-[11px] text-[#A8A29E] flex items-center justify-between">
                <span>📦 Продано: <strong className="text-white font-bold">{metrics.unitsSold} шт.</strong></span>
                <span className="text-blue-400 font-semibold font-mono">{metrics.conversionRate}% conv</span>
              </div>
            </div>

            {/* KPI 4: Commission & Bonus */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-[#1C1A18] to-[#1C1A18] border border-amber-500/30 space-y-1.5 shadow-xl">
              <div className="flex items-center justify-between text-amber-300">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  Комиссия ({commissionRate}%)
                </span>
                <Award className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 font-serif">
                +{metrics.commissionEarnedUZS.toLocaleString()} <span className="text-xs text-amber-400">сум</span>
              </div>
              <div className="text-[11px] text-[#A8A29E] flex items-center justify-between">
                <span>Средний чек:</span>
                <strong className="text-white font-mono">{metrics.averageOrderUZS.toLocaleString()} сум</strong>
              </div>
            </div>
          </div>

          {/* Status Breakdown & Top Products Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Order Status Distribution Bar */}
            <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>Воронка статусов заказов</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-emerald-400">Оплачено</span>
                  <strong className="text-base text-emerald-300 font-bold font-mono">
                    {metrics.paidCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-green-400">Доставлено</span>
                  <strong className="text-base text-green-300 font-bold font-mono">
                    {metrics.deliveredCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-purple-400">Отправлено</span>
                  <strong className="text-base text-purple-300 font-bold font-mono">
                    {metrics.shippedCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-amber-400">В обработке</span>
                  <strong className="text-base text-amber-300 font-bold font-mono">
                    {metrics.processingCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-blue-400">Новые</span>
                  <strong className="text-base text-blue-300 font-bold font-mono">
                    {metrics.newCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-red-400">Отменено</span>
                  <strong className="text-base text-red-300 font-bold font-mono">
                    {metrics.cancelledCount}
                  </strong>
                </div>
              </div>
            </div>

            {/* Top Selling Products for Seller */}
            <div className="p-5 rounded-2xl bg-[#1C1A18] border border-white/10 space-y-3 lg:col-span-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Топ продаваемых позиций этим менеджером</span>
              </h3>

              {metrics.topProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#78716C]">
                  Нет данных по товарам за выбранный период
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {metrics.topProducts.map((p, idx) => (
                    <div
                      key={p.title}
                      className="p-2.5 rounded-xl bg-[#141312] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-white font-medium truncate">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <span className="text-emerald-400 font-bold font-mono">{p.count} шт.</span>
                        <span className="text-[#A8A29E] font-mono text-[11px] hidden sm:inline">
                          ≈ ₩ {p.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders Table Header & Filter Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                  <span>Реестр заказов продавца ({visibleOrders.length})</span>
                </h3>
                <p className="text-xs text-[#A8A29E] mt-0.5">
                  История и статусы всех сделок, закрепленных за {staff.displayName}
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'new', label: 'Новые' },
                  { id: 'processing', label: 'В обработке' },
                  { id: 'paid', label: 'Оплачено' },
                  { id: 'shipped', label: 'Отправлено' },
                  { id: 'delivered', label: 'Доставлено' },
                  { id: 'cancelled', label: 'Отменено' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-semibold ${
                      statusFilter === s.id
                        ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-md shadow-[#D4AF37]/20'
                        : 'bg-white/5 text-[#A8A29E] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру заказа, клиенту, телефону, городу или названию товара..."
                className="w-full bg-[#1C1A18] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Orders Table */}
            <div className="bg-[#1C1A18] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              {isLoading ? (
                <div className="py-16 text-center text-xs text-[#A8A29E] flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                  <span>Загрузка данных по заказам...</span>
                </div>
              ) : visibleOrders.length === 0 ? (
                <div className="py-14 text-center text-xs text-[#78716C]">
                  Заказов по заданным критериям не найдено
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141312] border-b border-white/10 text-[#A8A29E] uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">№ Заказа</th>
                        <th className="py-3 px-3">Дата</th>
                        <th className="py-3 px-3">Клиент & Контакты</th>
                        <th className="py-3 px-3">Состав товаров</th>
                        <th className="py-3 px-3 text-right">Сумма (KRW / UZS)</th>
                        <th className="py-3 px-3 text-center">Оплата</th>
                        <th className="py-3 px-4 text-center">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {visibleOrders.map((o) => {
                        const statusObj = statusColors[o.status] || {
                          label: o.status,
                          bg: 'bg-white/5',
                          text: 'text-white',
                          border: 'border-white/10',
                        };
                        const totalUzs = Math.round((o.totalAmount || 0) * 10);
                        return (
                          <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Order Number */}
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-white block">
                                {o.orderNumber}
                              </span>
                              <span className="text-[10px] text-[#78716C]">ID: #{o.id}</span>
                            </td>

                            {/* Date */}
                            <td className="py-3 px-3 text-[#A8A29E] whitespace-nowrap">
                              <div className="text-white font-medium">
                                {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                              </div>
                              <div className="text-[10px] text-[#78716C]">
                                {new Date(o.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{o.customerName || 'Покупатель'}</div>
                              {o.phone && (
                                <a
                                  href={`tel:${o.phone}`}
                                  className="text-[11px] text-[#D4AF37] hover:underline font-mono block"
                                >
                                  {o.phone}
                                </a>
                              )}
                              {o.city && <div className="text-[10px] text-[#78716C]">{o.city}</div>}
                            </td>

                            {/* Items */}
                            <td className="py-3 px-3 max-w-xs">
                              {o.items && o.items.length > 0 ? (
                                <div className="space-y-0.5">
                                  {o.items.slice(0, 2).map((item, i) => (
                                    <div key={i} className="text-[11px] text-[#EDE8E1] truncate">
                                      • {item.title} <span className="text-[#D4AF37]">x{item.quantity}</span>
                                    </div>
                                  ))}
                                  {o.items.length > 2 && (
                                    <div className="text-[10px] text-[#78716C] italic">
                                      + еще {o.items.length - 2} поз.
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#78716C] text-[11px] italic">
                                  {o.notes || '—'}
                                </span>
                              )}
                            </td>

                            {/* Amount */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div className="font-bold text-white font-serif text-sm">
                                {totalUzs.toLocaleString()} сум
                              </div>
                              <div className="text-[10px] font-mono text-[#78716C]">
                                ₩ {(o.totalAmount || 0).toLocaleString()}
                              </div>
                            </td>

                            {/* Payment */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[11px] text-[#EDE8E1] border border-white/5">
                                {o.paymentMethod || '—'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusObj.bg} ${statusObj.text} ${statusObj.border}`}
                              >
                                {statusObj.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-[#161514] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#A8A29E]">
          <div>
            Показано заказов: <strong className="text-white">{visibleOrders.length}</strong> из{' '}
            <strong className="text-white">{metrics.totalOrders}</strong> | Суммарный оборот выборки:{' '}
            <strong className="text-[#D4AF37]">
              {visibleOrders
                .filter((o) => o.status !== 'cancelled')
                .reduce((sum, o) => sum + (o.totalAmount || 0) * 10, 0)
                .toLocaleString()}{' '}
              сум
            </strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors self-end sm:self-auto"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
