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
} from 'lucide-react';
import { adminService, DeepAnalyticsData } from '../../services/admin/adminService';

interface AnalyticsEChartsViewProps {
  token: string;
}

export const AnalyticsEChartsView: React.FC<AnalyticsEChartsViewProps> = ({ token }) => {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [data, setData] = useState<DeepAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCurrencyView, setSelectedCurrencyView] = useState<'UZS' | 'KRW' | 'USD'>('UZS');

  // Chart DOM refs
  const revenueChartRef = useRef<HTMLDivElement | null>(null);
  const waterfallChartRef = useRef<HTMLDivElement | null>(null);
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

  const fmtVal = (val: number) => {
    const converted = val * currencyRate;
    return Math.round(converted).toLocaleString('ru-RU') + currencySymbol;
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

    // 1. REVENUE & PROFIT DYNAMICS (Area / Line Combo)
    if (revenueChartRef.current) {
      const chart = echarts.init(revenueChartRef.current);
      chartInstances.current.push(chart);

      const timeline = data?.revenueTimeline || [];
      const dates = timeline.map((p) => (p?.date || '').slice(5));
      const revenues = timeline.map((p) => Math.round((p?.revenueKRW || 0) * currencyRate));
      const profits = timeline.map((p) => Math.round((p?.profitKRW || 0) * currencyRate));

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
                <strong style="color:#fff">${item.value.toLocaleString()} ${currencySymbol}</strong>
              </div>`;
            });
            return res;
          },
        },
        legend: {
          data: ['Выручка', 'Чистая прибыль'],
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
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#292524', type: 'dashed' } },
          axisLabel: {
            color: '#78716C',
            fontSize: 11,
            formatter: (v: number) => (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v.toLocaleString()),
          },
        },
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
            name: 'Чистая прибыль',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: profits,
            itemStyle: { color: '#10B981' },
            lineStyle: { width: 2.5, color: '#10B981' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.0)' },
              ]),
            },
          },
        ],
      });
    }

    // 2. UNIT MARGIN WATERFALL (Gross Revenue -> COGS -> Logistics -> Bonus -> Net Profit)
    if (waterfallChartRef.current) {
      const chart = echarts.init(waterfallChartRef.current);
      chartInstances.current.push(chart);

      const totalRev = Math.round((data?.totalRevenueKRW || 0) * currencyRate);
      const cogs = Math.round(totalRev * 0.55);
      const cargo = Math.round(totalRev * 0.08);
      const commission = Math.round(totalRev * 0.05);
      const netProfit = totalRev - cogs - cargo - commission;

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#1C1A18',
          borderColor: 'rgba(212,175,55,0.3)',
          textStyle: { color: '#EDE8E1', fontSize: 12 },
          formatter: (params: any) => {
            const tar = params[1] || params[0];
            return `<div style="font-weight:bold;color:#D4AF37">${tar.name}</div>
                    <div style="font-size:12px;color:#fff">${Math.abs(tar.value).toLocaleString()} ${currencySymbol}</div>`;
          },
        },
        grid: { left: '3%', right: '3%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1. Выручка', '2. Себестоимость', '3. Доставка', '4. Комиссия', '5. Чистая прибыль'],
          axisLine: { lineStyle: { color: '#292524' } },
          axisLabel: { color: '#A8A29E', fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#292524', type: 'dashed' } },
          axisLabel: {
            color: '#78716C',
            fontSize: 11,
            formatter: (v: number) => (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v.toLocaleString()),
          },
        },
        series: [
          {
            name: 'Placeholder',
            type: 'bar',
            stack: 'Total',
            itemStyle: { borderColor: 'transparent', color: 'transparent' },
            data: [0, totalRev - cogs, totalRev - cogs - cargo, totalRev - cogs - cargo - commission, 0],
          },
          {
            name: 'Сумма',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
              fontSize: 11,
              formatter: (params: any) => `${(params.value / 1000000).toFixed(1)}M`,
            },
            data: [
              { value: totalRev, itemStyle: { color: '#D4AF37' } },
              { value: cogs, itemStyle: { color: '#EF4444' } },
              { value: cargo, itemStyle: { color: '#F97316' } },
              { value: commission, itemStyle: { color: '#EAB308' } },
              { value: netProfit, itemStyle: { color: '#10B981' } },
            ],
          },
        ],
      });
    }

    // 3. TOP BRANDS & TURNOVER (Horizontal Bar Chart)
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
        grid: { left: '3%', right: '6%', bottom: '3%', top: '5%', containLabel: true },
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
              fontSize: 11,
              formatter: (p: any) => `${(p.value / 1000000).toFixed(1)}M`,
            },
          },
        ],
      });
    }

    // 4. REGIONAL SALES GEO DISTRIBUTION
    if (geoChartRef.current) {
      const chart = echarts.init(geoChartRef.current);
      chartInstances.current.push(chart);

      const cities = (data?.topCities || []).slice(0, 5);
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

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141210] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white tracking-wide">Финансовая Аналитика MK Cosmetics</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Фокусные бизнес-метрики: оборот, каскад маржинальности, топ корейских брендов и география заказов
          </p>
        </div>

        {/* Currency & Period Pickers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-[#1C1A18] p-1 border border-amber-500/20 text-xs font-semibold">
            {(['UZS', 'KRW', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrencyView(curr)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCurrencyView === curr
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl bg-[#1C1A18] p-1 border border-amber-500/20 text-xs font-semibold">
            {[
              { label: '7 дней', val: 7 },
              { label: '30 дней', val: 30 },
              { label: '90 дней', val: 90 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriodDays(p.val)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  periodDays === p.val
                    ? 'bg-[#2D2823] text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/20 text-neutral-300 hover:text-amber-400 transition-all"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Core Financial Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue & Profit Dynamics */}
        <div className="p-6 rounded-3xl bg-[#12110F] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Динамика Выручки и Чистой Прибыли</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Высокая маржа
            </span>
          </div>
          <div ref={revenueChartRef} className="w-full h-72" />
        </div>

        {/* Chart 2: Unit Margin Waterfall */}
        <div className="p-6 rounded-3xl bg-[#12110F] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Каскад Маржинальности (Waterfall)</h3>
            </div>
            <span className="text-xs text-neutral-400">Себестоимость $\to$ Чистая прибыль</span>
          </div>
          <div ref={waterfallChartRef} className="w-full h-72" />
        </div>

        {/* Chart 3: Top Brands Turnover */}
        <div className="p-6 rounded-3xl bg-[#12110F] border border-amber-500/20 shadow-xl space-y-4">
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
        <div className="p-6 rounded-3xl bg-[#12110F] border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Региональное Распределение Заказов</h3>
            </div>
            <span className="text-xs text-sky-400 font-semibold">Города Узбекистана</span>
          </div>
          <div ref={geoChartRef} className="w-full h-72" />
        </div>

      </div>
    </div>
  );
};
