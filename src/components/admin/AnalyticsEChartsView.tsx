import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  Award,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Users,
  Package,
  FileSpreadsheet,
  Printer,
  FileText,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { adminService, DeepAnalyticsData } from '../../services/admin/adminService';
import { RevenueReportPDFModal } from './RevenueReportPDFModal';

interface AnalyticsEChartsViewProps {
  token: string;
}

export const AnalyticsEChartsView: React.FC<AnalyticsEChartsViewProps> = ({ token }) => {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [data, setData] = useState<DeepAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCurrencyView, setSelectedCurrencyView] = useState<'UZS' | 'KRW' | 'USD'>('UZS');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState<boolean>(false);

  // Chart DOM refs
  const revenueChartRef = useRef<HTMLDivElement | null>(null);
  const sellersChartRef = useRef<HTMLDivElement | null>(null);
  const brandChartRef = useRef<HTMLDivElement | null>(null);
  const geoChartRef = useRef<HTMLDivElement | null>(null);

  // Chart instances
  const chartInstances = useRef<echarts.ECharts[]>([]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const resp = await adminService.getDeepAnalytics(periodDays, token);
      setData(resp);
    } catch (err) {
      console.error('Failed to load deep analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [periodDays, token]);

  // Currency multiplier helper (base in KRW)
  const currencyRate = selectedCurrencyView === 'UZS' ? 9.2 : selectedCurrencyView === 'KRW' ? 1 : 0.00075;
  const currencySymbol = selectedCurrencyView === 'UZS' ? ' сум' : selectedCurrencyView === 'KRW' ? ' ₩' : ' $';

  const fmtVal = (val?: number) => {
    const converted = (val || 0) * currencyRate;
    return Math.round(converted).toLocaleString('ru-RU') + currencySymbol;
  };

  const handleExportXLSX = () => {
    window.open('/api/admin/orders/export/xlsx', '_blank');
  };

  // Render ECharts
  useEffect(() => {
    if (!data || isLoading) return;

    // Dispose previous instances
    chartInstances.current.forEach((inst) => inst.dispose());
    chartInstances.current = [];

    const commonTextStyle = {
      color: '#A8A29E',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
    };

    // 1. REVENUE DYNAMICS (Timeline Area / Line)
    if (revenueChartRef.current) {
      const chart = echarts.init(revenueChartRef.current);
      chartInstances.current.push(chart);

      const timeline = data?.revenueTimeline || [];
      const dates = timeline.map((p) => (p?.date || '').slice(5));
      const revenues = timeline.map((p) => Math.round((p?.revenueKRW || 0) * currencyRate));
      const orders = timeline.map((p) => p?.ordersCount || 0);

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(212, 175, 55, 0.3)',
          textStyle: { color: '#EDE8E1', fontSize: 12 },
          formatter: (params: any) => {
            let res = `<div style="font-weight:bold;margin-bottom:4px;color:#D4AF37">${params[0]?.axisValue || ''}</div>`;
            params.forEach((item: any) => {
              res += `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;">
                <span style="color:${item.color}">● ${item.seriesName}:</span>
                <strong style="color:#fff">${item.value.toLocaleString()} ${item.seriesName === 'Выручка' ? currencySymbol : 'зак.'}</strong>
              </div>`;
            });
            return res;
          },
        },
        legend: {
          data: ['Выручка', 'Количество заказов'],
          textStyle: commonTextStyle,
          top: 0,
          right: 0,
          icon: 'roundRect',
        },
        grid: { left: '3%', right: '3%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLine: { lineStyle: { color: '#292524' } },
          axisLabel: { color: '#78716C', fontSize: 11 },
        },
        yAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#292524', type: 'dashed' } },
            axisLabel: {
              color: '#78716C',
              fontSize: 11,
              formatter: (v: number) => (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v.toLocaleString()),
            },
          },
          {
            type: 'value',
            show: false,
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: 'Выручка',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: revenues,
            itemStyle: { color: '#D4AF37' },
            lineStyle: { width: 3, color: '#D4AF37' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(212, 175, 55, 0.35)' },
                { offset: 1, color: 'rgba(212, 175, 55, 0.0)' },
              ]),
            },
          },
          {
            name: 'Количество заказов',
            type: 'bar',
            yAxisIndex: 1,
            data: orders,
            itemStyle: {
              color: 'rgba(56, 189, 248, 0.25)',
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
      });
    }

    // 2. SELLERS REVENUE DISTRIBUTION (Bar Chart)
    if (sellersChartRef.current) {
      const chart = echarts.init(sellersChartRef.current);
      chartInstances.current.push(chart);

      const sellers = data?.sellersRadar || [];
      const sellerNames = sellers.map((s) => s.displayName || s.username);
      const sellerRevs = sellers.map((s) => Math.round((s.revenueKRW || 0) * currencyRate));

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(212,175,55,0.3)',
          textStyle: { color: '#EDE8E1', fontSize: 12 },
          formatter: (params: any) => {
            const p = params[0];
            return `<div style="font-weight:bold;color:#D4AF37">${p.name}</div>
                    <div style="font-size:12px;color:#fff">Выручка: <strong>${p.value.toLocaleString()} ${currencySymbol}</strong></div>`;
          },
        },
        grid: { left: '3%', right: '5%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: sellerNames.length > 0 ? sellerNames : ['Нет данных'],
          axisLine: { lineStyle: { color: '#292524' } },
          axisLabel: { color: '#D6D3D1', fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#292524', type: 'dashed' } },
          axisLabel: {
            color: '#78716C',
            fontSize: 10,
            formatter: (v: number) => (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v.toLocaleString()),
          },
        },
        series: [
          {
            name: 'Выручка продавца',
            type: 'bar',
            data: sellerRevs.length > 0 ? sellerRevs : [0],
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#D4AF37' },
                { offset: 1, color: '#8B5A2B' },
              ]),
            },
            label: {
              show: true,
              position: 'top',
              color: '#FDE68A',
              fontSize: 10,
              formatter: (p: any) => (p.value >= 1000000 ? `${(p.value / 1000000).toFixed(1)}M` : p.value.toLocaleString()),
            },
          },
        ],
      });
    }

    // 3. TOP BRANDS TURNOVER (Horizontal Bar)
    if (brandChartRef.current) {
      const chart = echarts.init(brandChartRef.current);
      chartInstances.current.push(chart);

      const topBrands = (data?.topBrands || []).slice(0, 6);
      const brandNames = topBrands.map((b) => b.brand || 'Без бренда').reverse();
      const brandRevenues = topBrands.map((b) => Math.round((b.revenueKRW || 0) * currencyRate)).reverse();

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(212,175,55,0.3)',
          textStyle: { color: '#EDE8E1', fontSize: 12 },
        },
        grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
        xAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#292524', type: 'dashed' } },
          axisLabel: { color: '#78716C', fontSize: 10 },
        },
        yAxis: {
          type: 'category',
          data: brandNames,
          axisLine: { lineStyle: { color: '#292524' } },
          axisLabel: { color: '#D6D3D1', fontSize: 11, fontWeight: 'bold' },
        },
        series: [
          {
            type: 'bar',
            data: brandRevenues,
            itemStyle: {
              borderRadius: [0, 6, 6, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#B45309' },
                { offset: 1, color: '#F59E0B' },
              ]),
            },
            label: {
              show: true,
              position: 'right',
              color: '#FDE68A',
              fontSize: 10,
              formatter: (p: any) => (p.value >= 1000000 ? `${(p.value / 1000000).toFixed(1)}M` : p.value.toLocaleString()),
            },
          },
        ],
      });
    }

    // 4. REGIONAL & PAYMENT CHANNELS GEO (Donut Pie)
    if (geoChartRef.current) {
      const chart = echarts.init(geoChartRef.current);
      chartInstances.current.push(chart);

      const cities = (data?.geographyStats || []).slice(0, 5);
      const pieData = cities.map((c, i) => ({
        name: c.city || 'Ташкент',
        value: Math.round((c.revenueKRW || 0) * currencyRate),
        itemStyle: {
          color: ['#D4AF37', '#10B981', '#38BDF8', '#F59E0B', '#A855F7'][i % 5],
        },
      }));

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(212,175,55,0.3)',
          textStyle: { color: '#EDE8E1', fontSize: 12 },
          formatter: (p: any) =>
            `<div style="font-weight:bold;color:#D4AF37">${p.name}</div>
             <div style="font-size:12px;color:#fff">${p.value.toLocaleString()} ${currencySymbol} (${p.percent}%)</div>`,
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: commonTextStyle,
          icon: 'circle',
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#12110F',
              borderWidth: 3,
            },
            label: { show: false },
            emphasis: {
              label: {
                show: true,
                fontSize: 12,
                fontWeight: 'bold',
                color: '#fff',
              },
            },
            data: pieData,
          },
        ],
      });
    }

    const handleResize = () => chartInstances.current.forEach((inst) => inst.resize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, selectedCurrencyView]);

  const totalRev = data?.totalRevenueKRW || 0;
  const totalOrders = data?.totalOrders || 0;
  const totalUnits = (data?.topBrands || []).reduce((sum, b) => sum + (b.unitsSold || 0), 0) || Math.round(totalOrders * 1.8);
  const avgCheck = totalOrders > 0 ? totalRev / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-black font-black font-serif">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-serif tracking-wide">
                Финансовая Аналитика & Выручка
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Объем продаж, распределение выручки по продавцам, топы брендов и экспорт отчетов
              </p>
            </div>
          </div>
        </div>

        {/* Currency, Period & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Switcher */}
          <div className="flex rounded-xl bg-[#1C1A18] p-1 border border-amber-500/20 text-xs font-semibold">
            {(['UZS', 'KRW', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrencyView(curr)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCurrencyView === curr
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex rounded-xl bg-[#1C1A18] p-1 border border-amber-500/20 text-xs font-semibold">
            {[
              { label: '7 дней', val: 7 },
              { label: '30 дней', val: 30 },
              { label: '90 дней', val: 90 },
              { label: 'Год', val: 365 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriodDays(p.val)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodDays === p.val
                    ? 'bg-[#2D2823] text-amber-400 border border-amber-500/30 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* PDF Report Export Button */}
          <button
            onClick={() => setIsPDFModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Отчет PDF</span>
          </button>

          {/* Excel Export Button */}
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/20 text-neutral-300 hover:text-amber-400 transition-all cursor-pointer"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Revenue */}
        <div className="p-5 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Общая выручка
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-serif tracking-tight">
            {fmtVal(totalRev)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>За период {periodDays} дней</span>
          </div>
        </div>

        {/* Card 2: Units Sold */}
        <div className="p-5 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Продано товаров
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-serif tracking-tight">
            {totalUnits.toLocaleString('ru-RU')} шт.
          </div>
          <div className="text-xs text-neutral-400">
            Включая корзину и быстрый заказ
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="p-5 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Оформлено заказов
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-serif tracking-tight">
            {totalOrders} заказов
          </div>
          <div className="text-xs text-neutral-400">
            Доставлено и в обработке
          </div>
        </div>

        {/* Card 4: Average Order Value */}
        <div className="p-5 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Средний чек
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#D4AF37] font-serif tracking-tight">
            {fmtVal(avgCheck)}
          </div>
          <div className="text-xs text-neutral-400">
            Средняя сумма на 1 покупку
          </div>
        </div>
      </div>

      {/* Sellers Leaderboard & Sales Performance Table */}
      <div className="p-6 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Рейтинг и распределение продаж по продавцам
              </h3>
              <p className="text-xs text-neutral-400">
                Кто сколько продал, количество заказов, средний чек и доля в общей выручке
              </p>
            </div>
          </div>

          <div className="text-xs text-neutral-400">
            Активных менеджеров: <strong className="text-white">{(data?.sellersRadar || []).length}</strong>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Рейтинг</th>
                <th className="py-2.5 px-3">Продавец / Консультант</th>
                <th className="py-2.5 px-3 text-center">Заказов</th>
                <th className="py-2.5 px-3 text-right">Выручка</th>
                <th className="py-2.5 px-3 text-right">Средний чек</th>
                <th className="py-2.5 px-3 text-center">Доля в выручке (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data?.sellersRadar || []).map((s, idx) => {
                const sellerRev = s.revenueKRW || 0;
                const sharePct = totalRev > 0 ? ((sellerRev / totalRev) * 100).toFixed(1) : '0';
                const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                return (
                  <tr key={s.username} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-sm">
                      <span className="text-amber-400">{rankMedal}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                          {s.displayName?.charAt(0).toUpperCase() || s.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{s.displayName || s.username}</div>
                          <div className="text-[10px] text-neutral-400">@{s.username} • {s.role === 'admin' ? 'Админ' : 'Менеджер'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-white">
                      {s.ordersCount} зак.
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#D4AF37] text-sm">
                      {fmtVal(sellerRev)}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      {fmtVal(s.avgTicketKRW || (s.ordersCount > 0 ? sellerRev / s.ordersCount : 0))}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 max-w-[140px] mx-auto">
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                            style={{ width: `${Math.min(100, Number(sharePct))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-10 text-right">{sharePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!data?.sellersRadar || data.sellersRadar.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-neutral-400">
                    Нет назначенных заказов за выбранный период
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Financial ECharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue Timeline Dynamics */}
        <div className="p-6 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Динамика Выручки и Потока Заказов</h3>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              По дням
            </span>
          </div>
          <div ref={revenueChartRef} className="w-full h-72" />
        </div>

        {/* Chart 2: Sellers Revenue Comparison */}
        <div className="p-6 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Сравнение Выручки по Продавцам</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Продажи команды
            </span>
          </div>
          <div ref={sellersChartRef} className="w-full h-72" />
        </div>

        {/* Chart 3: Top Brands Turnover */}
        <div className="p-6 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Топ Брендов Кореи по Выручке</h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold">Лидеры продаж</span>
          </div>
          <div ref={brandChartRef} className="w-full h-72" />
        </div>

        {/* Chart 4: Regional Geographic Distribution */}
        <div className="p-6 rounded-3xl bg-[#141210] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Географическое Распределение Заказов</h3>
            </div>
            <span className="text-xs text-sky-400 font-semibold">Города доставки</span>
          </div>
          <div ref={geoChartRef} className="w-full h-72" />
        </div>

      </div>

      {/* PDF Report Modal */}
      <RevenueReportPDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        data={data}
        periodDays={periodDays}
        currencyView={selectedCurrencyView}
        onExportXLSX={handleExportXLSX}
      />
    </div>
  );
};
