import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  Filter,
  RefreshCw,
  Award,
  Users,
  PieChart as PieIcon,
  Activity,
  Zap,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { adminService, DeepAnalyticsData } from '../../services/admin/adminService';

interface AnalyticsEChartsViewProps {
  token: string;
}

export const AnalyticsEChartsView: React.FC<AnalyticsEChartsViewProps> = ({ token }) => {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [data, setData] = useState<DeepAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCurrencyView, setSelectedCurrencyView] = useState<'KRW' | 'UZS' | 'USD'>('KRW');

  // Chart DOM refs
  const revenueChartRef = useRef<HTMLDivElement | null>(null);
  const geoChartRef = useRef<HTMLDivElement | null>(null);
  const brandTreemapRef = useRef<HTMLDivElement | null>(null);
  const heatmapChartRef = useRef<HTMLDivElement | null>(null);
  const paymentChartRef = useRef<HTMLDivElement | null>(null);
  const funnelChartRef = useRef<HTMLDivElement | null>(null);
  const radarChartRef = useRef<HTMLDivElement | null>(null);

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
  const currencyRate = selectedCurrencyView === 'KRW' ? 1 : selectedCurrencyView === 'UZS' ? 9.2 : 0.00075;
  const currencySymbol = selectedCurrencyView === 'KRW' ? '₩ ' : selectedCurrencyView === 'UZS' ? 'сум ' : '$ ';

  const fmtVal = (val: number) => {
    const converted = val * currencyRate;
    return currencySymbol + Math.round(converted).toLocaleString();
  };

  // Render ECharts
  useEffect(() => {
    if (!data || isLoading) return;

    // Dispose previous instances
    chartInstances.current.forEach((inst) => inst.dispose());
    chartInstances.current = [];

    const commonTextStyle = {
      color: '#A8A29E',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    };

    // 1. REVENUE & PROFIT TIMELINE (Area / Line Chart)
    if (revenueChartRef.current) {
      const chart = echarts.init(revenueChartRef.current);
      chartInstances.current.push(chart);

      const dates = data.revenueTimeline.map((p) => p.date.slice(5));
      const revenues = data.revenueTimeline.map((p) => Math.round(p.revenueKRW * currencyRate));
      const profits = data.revenueTimeline.map((p) => Math.round(p.profitKRW * currencyRate));
      const orders = data.revenueTimeline.map((p) => p.ordersCount);

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1', fontSize: 12 },
        },
        legend: {
          data: ['Выручка', 'Чистая прибыль', 'Заказы (шт.)'],
          textStyle: { color: '#C4BDB5' },
          top: 0,
        },
        grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLabel: { color: '#78716C', fontSize: 10 },
        },
        yAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            axisLabel: {
              color: '#78716C',
              fontSize: 10,
              formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val),
            },
          },
          {
            type: 'value',
            name: 'Заказы',
            nameTextStyle: { color: '#78716C', fontSize: 10 },
            splitLine: { show: false },
            axisLabel: { color: '#78716C', fontSize: 10 },
          },
        ],
        series: [
          {
            name: 'Выручка',
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: { color: '#D4AF37' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(212, 175, 55, 0.4)' },
                { offset: 1, color: 'rgba(212, 175, 55, 0.0)' },
              ]),
            },
            data: revenues,
          },
          {
            name: 'Чистая прибыль',
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: { color: '#10B981' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.0)' },
              ]),
            },
            data: profits,
          },
          {
            name: 'Заказы (шт.)',
            type: 'bar',
            yAxisIndex: 1,
            itemStyle: { color: 'rgba(139, 92, 246, 0.35)', borderRadius: [4, 4, 0, 0] },
            barMaxWidth: 16,
            data: orders,
          },
        ],
      });
    }

    // 2. GEOGRAPHY & CITIES (Horizontal Bar Chart)
    if (geoChartRef.current) {
      const chart = echarts.init(geoChartRef.current);
      chartInstances.current.push(chart);

      const cities = (data.geographyStats || []).slice(0, 8).map((g) => g.city).reverse();
      const amounts = (data.geographyStats || []).slice(0, 8).map((g) => Math.round(g.revenueKRW * currencyRate)).reverse();

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1' },
        },
        grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
        xAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLabel: { color: '#78716C', fontSize: 10 },
        },
        yAxis: {
          type: 'category',
          data: cities,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLabel: { color: '#C4BDB5', fontSize: 11 },
        },
        series: [
          {
            type: 'bar',
            data: amounts,
            barMaxWidth: 18,
            itemStyle: {
              borderRadius: [0, 6, 6, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#3B82F6' },
                { offset: 1, color: '#60A5FA' },
              ]),
            },
            label: {
              show: true,
              position: 'right',
              color: '#D4AF37',
              fontSize: 10,
              formatter: (params: any) => `${currencySymbol}${params.value.toLocaleString()}`,
            },
          },
        ],
      });
    }

    // 3. BRAND & CATEGORIES (Treemap Chart)
    if (brandTreemapRef.current) {
      const chart = echarts.init(brandTreemapRef.current);
      chartInstances.current.push(chart);

      const treemapData = (data.topBrands || []).map((b, idx) => {
        const colors = ['#D4AF37', '#10B981', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4', '#EAB308'];
        return {
          name: b.brand,
          value: Math.round(b.revenueKRW * currencyRate),
          itemStyle: { color: colors[idx % colors.length] },
        };
      });

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          formatter: (info: any) => `<strong>${info.name}</strong><br/>Выручка: ${currencySymbol}${info.value.toLocaleString()}`,
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1' },
        },
        series: [
          {
            type: 'treemap',
            data: treemapData,
            leafDepth: 1,
            roam: false,
            label: {
              show: true,
              formatter: '{b}\n{c}',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 'bold',
            },
            itemStyle: {
              borderColor: '#141312',
              borderWidth: 2,
              gapWidth: 2,
            },
          },
        ],
      });
    }

    // 4. 24h x 7d SALES ACTIVITY HEATMAP
    if (heatmapChartRef.current) {
      const chart = echarts.init(heatmapChartRef.current);
      chartInstances.current.push(chart);

      const daysLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          position: 'top',
          formatter: (params: any) => `${daysLabels[params.value[0]]}, ${hoursLabels[params.value[1]]}: <strong>${params.value[2]} заказов</strong>`,
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1' },
        },
        grid: { left: '4%', right: '3%', bottom: '15%', top: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          data: hoursLabels,
          splitArea: { show: false },
          axisLabel: { color: '#78716C', fontSize: 9, interval: 2 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        },
        yAxis: {
          type: 'category',
          data: daysLabels,
          splitArea: { show: false },
          axisLabel: { color: '#C4BDB5', fontSize: 10 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        },
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          inRange: {
            color: ['#1C1A18', '#312E81', '#6366F1', '#D4AF37', '#F59E0B'],
          },
          textStyle: { color: '#78716C', fontSize: 10 },
        },
        series: [
          {
            name: 'Заказы',
            type: 'heatmap',
            data: data.heatmap24h7d || [],
            label: { show: false },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(212, 175, 55, 0.5)',
              },
            },
          },
        ],
      });
    }

    // 5. PAYMENT METHODS DONUT
    if (paymentChartRef.current) {
      const chart = echarts.init(paymentChartRef.current);
      chartInstances.current.push(chart);

      const donutData = (data.paymentMethods || []).map((pm, idx) => {
        const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#D4AF37', '#64748B'];
        return {
          name: pm.method,
          value: pm.ordersCount,
          itemStyle: { color: colors[idx % colors.length] },
        };
      });

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} заказов ({d}%)',
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1' },
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { color: '#A8A29E', fontSize: 11 },
        },
        series: [
          {
            name: 'Способ оплаты',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#141312',
              borderWidth: 2,
            },
            label: { show: false },
            data: donutData,
          },
        ],
      });
    }

    // 6. ORDER FUNNEL
    if (funnelChartRef.current) {
      const chart = echarts.init(funnelChartRef.current);
      chartInstances.current.push(chart);

      const funnelData = (data.funnelSteps || []).map((s, idx) => {
        const colors = ['#F59E0B', '#3B82F6', '#8B5CF6', '#F97316', '#10B981'];
        return {
          name: s.label,
          value: s.count,
          itemStyle: { color: colors[idx % colors.length] },
        };
      });

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: <strong>{c} заказов</strong>',
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1' },
        },
        series: [
          {
            name: 'Воронка заказов',
            type: 'funnel',
            left: '10%',
            top: 20,
            bottom: 20,
            width: '80%',
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 4,
            label: {
              show: true,
              position: 'inside',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 'bold',
            },
            data: funnelData,
          },
        ],
      });
    }

    // 7. SELLER RADAR CHART
    if (radarChartRef.current && data.sellersRadar && data.sellersRadar.length > 0) {
      const chart = echarts.init(radarChartRef.current);
      chartInstances.current.push(chart);

      const radarSeriesData = data.sellersRadar.slice(0, 4).map((s, idx) => {
        const colors = ['#D4AF37', '#10B981', '#3B82F6', '#EC4899'];
        return {
          name: s.displayName || s.username,
          value: s.radarScores,
          itemStyle: { color: colors[idx % colors.length] },
          areaStyle: { opacity: 0.25 },
        };
      });

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#EDE8E1' },
        },
        legend: {
          top: 0,
          textStyle: { color: '#C4BDB5', fontSize: 11 },
        },
        radar: {
          indicator: [
            { name: 'Выручка', max: 100 },
            { name: 'Кол-во заказов', max: 100 },
            { name: 'Скорость оплат', max: 100 },
            { name: 'Конверсия', max: 100 },
            { name: 'Средний чек', max: 100 },
          ],
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'],
            },
          },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
          name: { textStyle: { color: '#A8A29E', fontSize: 10 } },
        },
        series: [
          {
            type: 'radar',
            data: radarSeriesData,
          },
        ],
      });
    }

    // Auto-resize handler
    const handleResize = () => {
      chartInstances.current.forEach((inst) => inst.resize());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstances.current.forEach((inst) => inst.dispose());
    };
  }, [data, isLoading, selectedCurrencyView]);

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
              Бизнес-Аналитика Apache ECharts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Live BI Hub
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Многомерная аналитика выручки, географии, брендов, тепловых карт и эффективности продавцов
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Switcher */}
          <div className="flex items-center bg-[#1C1A18] border border-white/10 rounded-xl p-1 text-xs">
            {(['KRW', 'UZS', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrencyView(curr)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  selectedCurrencyView === curr
                    ? 'bg-[#D4AF37] text-[#141312]'
                    : 'text-[#A8A29E] hover:text-white'
                }`}
              >
                {curr === 'KRW' ? '₩ Вон' : curr === 'UZS' ? 'Сум' : '$ USD'}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-[#1C1A18] border border-white/10 rounded-xl p-1 text-xs">
            {[
              { days: 7, label: '7 дней' },
              { days: 30, label: '30 дней' },
              { days: 90, label: '3 мес.' },
              { days: 365, label: 'Год' },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => setPeriodDays(p.days)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  periodDays === p.days
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-[#A8A29E] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-white/10 transition-colors disabled:opacity-50"
            title="Обновить аналитику"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 text-center text-[#A8A29E] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <span className="text-xs">Вычисление финансовых метрик и построение ECharts...</span>
        </div>
      ) : data ? (
        <>
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Gross Revenue */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1C1A18] to-[#141312] border border-white/10 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Выручка (Gross)</span>
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-serif tracking-tight">
                {fmtVal(data.totalRevenueKRW)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#10B981]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>За выбранный период ({periodDays} дн.)</span>
              </div>
            </div>

            {/* Card 2: Gross Profit & Margin */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1C1A18] to-[#141312] border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Чистая прибыль</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-serif tracking-tight">
                {fmtVal(data.totalProfitKRW)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#C4BDB5]">
                <span>Маржинальность:</span>
                <strong className="text-emerald-400 font-bold">{data.grossMarginPct}%</strong>
              </div>
            </div>

            {/* Card 3: Total Orders & AOV */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1C1A18] to-[#141312] border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Заказы & Сделки</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-serif tracking-tight">
                {data.totalOrders} <span className="text-xs font-normal text-[#A8A29E]">заказов</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#C4BDB5]">
                <span>Средний чек (AOV):</span>
                <strong className="text-purple-300 font-bold">{fmtVal(data.averageOrderKRW)}</strong>
              </div>
            </div>

            {/* Card 4: Top City & Best Brand */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1C1A18] to-[#141312] border border-white/10 relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Главный регион</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-white truncate">
                {data.geographyStats?.[0]?.city || 'Ташкент'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#60A5FA]">
                <span>Доля продаж:</span>
                <strong className="font-bold">{data.geographyStats?.[0]?.percentage || 0}%</strong>
              </div>
            </div>
          </div>

          {/* Row 1: Revenue Timeline (2/3) + Sales Geography Bar (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#D4AF37]" />
                    <span>Динамика выручки и чистой прибыли</span>
                  </h2>
                  <p className="text-[11px] text-[#A8A29E]">Сглаженный график объемов продаж во времени</p>
                </div>
              </div>
              <div ref={revenueChartRef} className="w-full h-72" />
            </div>

            <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>География продаж (Города)</span>
                </h2>
                <p className="text-[11px] text-[#A8A29E]">Где больше всего покупают косметику</p>
              </div>
              <div ref={geoChartRef} className="w-full h-72" />
            </div>
          </div>

          {/* Row 2: Brand Treemap (1/2) + 24h Heatmap (1/2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Матрица брендов и бестселлеров (Treemap)</span>
                </h2>
                <p className="text-[11px] text-[#A8A29E]">Площадь блока пропорциональна выручке бренда</p>
              </div>
              <div ref={brandTreemapRef} className="w-full h-64" />
            </div>

            <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Тепловая карта пиковых часов (24h × 7d)</span>
                </h2>
                <p className="text-[11px] text-[#A8A29E]">В какое время покупатели активнее всего заказывают</p>
              </div>
              <div ref={heatmapChartRef} className="w-full h-64" />
            </div>
          </div>

          {/* Row 3: Payment Methods (1/3) + Funnel (1/3) + Seller Radar (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Methods */}
            <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Способы оплаты (Donut)</span>
                </h2>
                <p className="text-[11px] text-[#A8A29E]">Доли Click, Payme, Kaspi, USDT и Наличных</p>
              </div>
              <div ref={paymentChartRef} className="w-full h-60" />
            </div>

            {/* Conversion Funnel */}
            <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Воронка статусов заказов</span>
                </h2>
                <p className="text-[11px] text-[#A8A29E]">Конверсия от заявки до вручения посылки</p>
              </div>
              <div ref={funnelChartRef} className="w-full h-60" />
            </div>

            {/* Seller Radar */}
            <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>Радар продавцов (Команда)</span>
                </h2>
                <p className="text-[11px] text-[#A8A29E]">Оценка работы менеджеров по 5 параметрам</p>
              </div>
              <div ref={radarChartRef} className="w-full h-60" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
