import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Layers,
  Calculator,
  Download,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  Package,
  Plane,
  Truck,
  Users,
  Calendar,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  Building2,
  HelpCircle,
} from 'lucide-react';
import {
  adminService,
  UnitEconomicsData,
  ProductUnitStat,
  AbcXyzItem,
  PnLPeriod,
  CohortData,
  UnitSaleLedgerItem,
} from '../../services/admin/adminService';

interface SalesUnitEconomicsViewProps {
  token: string;
}

type SubTab = 'overview' | 'products' | 'abc_xyz' | 'pnl' | 'cohorts' | 'simulator' | 'ledger';

export const SalesUnitEconomicsView: React.FC<SalesUnitEconomicsViewProps> = ({ token }) => {
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [currency, setCurrency] = useState<'KRW' | 'UZS' | 'USD'>('KRW');
  const [data, setData] = useState<UnitEconomicsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Products table state
  const [productSearch, setProductSearch] = useState<string>('');
  const [marginFilter, setMarginFilter] = useState<string>('all');
  const [productSort, setProductSort] = useState<'profit' | 'marginPct' | 'units' | 'revenue'>('profit');

  // ABC/XYZ state
  const [selectedMatrixCode, setSelectedMatrixCode] = useState<string>('all');

  // Simulator state
  const [simPurchaseKRW, setSimPurchaseKRW] = useState<number>(15000);
  const [simWeightGrams, setSimWeightGrams] = useState<number>(150);
  const [simCargoRateUSD, setSimCargoRateUSD] = useState<number>(8.5); // $ / kg
  const [simTargetMarginPct, setSimTargetMarginPct] = useState<number>(40); // 40% margin
  const [simAcquiringFeePct, setSimAcquiringFeePct] = useState<number>(2.5); // 2.5%
  const [simPackagingKRW, setSimPackagingKRW] = useState<number>(500); // 500 KRW packaging

  // Ledger state
  const [ledgerSearch, setLedgerSearch] = useState<string>('');

  // Chart DOM refs
  const waterfallRef = useRef<HTMLDivElement | null>(null);
  const pnlChartRef = useRef<HTMLDivElement | null>(null);
  const cohortChartRef = useRef<HTMLDivElement | null>(null);
  const chartInstances = useRef<echarts.ECharts[]>([]);

  const fetchUnitEconomics = async () => {
    setIsLoading(true);
    try {
      const resp = await adminService.getUnitEconomics(periodDays, token);
      setData(resp);
    } catch (err) {
      console.error('Failed to load unit economics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitEconomics();
  }, [periodDays, token]);

  // Currency multiplier helper (base in KRW)
  const formatVal = (krwVal: number): string => {
    if (isNaN(krwVal)) return '0';
    if (currency === 'UZS') {
      const uzs = Math.round(krwVal * 9.5);
      return `${uzs.toLocaleString()} сум`;
    }
    if (currency === 'USD') {
      const usd = (krwVal / 1350).toFixed(2);
      return `$ ${usd}`;
    }
    return `₩ ${Math.round(krwVal).toLocaleString()}`;
  };

  // ECharts render hook
  useEffect(() => {
    // Dispose previous
    chartInstances.current.forEach((c) => c.dispose());
    chartInstances.current = [];

    if (!data || isLoading) return;

    // 1. Waterfall Chart
    if (waterfallRef.current && subTab === 'overview') {
      const wfChart = echarts.init(waterfallRef.current, 'dark');
      chartInstances.current.push(wfChart);

      const items = data.waterfallData || [];
      const titles = items.map((i) => i.name);
      const values = items.map((i) => {
        let v = Number(i.value) || 0;
        if (currency === 'UZS') v = Math.round(v * 9.5);
        if (currency === 'USD') v = Math.round((v / 1350) * 100) / 100;
        return v;
      });

      // ECharts waterfall base and step values
      const placeholder: number[] = [];
      const positiveSteps: number[] = [];
      const negativeSteps: number[] = [];
      let accum = 0;

      items.forEach((item, idx) => {
        const val = values[idx];
        if (item.type === 'total') {
          placeholder.push(0);
          positiveSteps.push(val);
          negativeSteps.push(0);
          accum = val;
        } else if (item.type === 'subtraction') {
          const absVal = Math.abs(val);
          accum -= absVal;
          placeholder.push(Math.max(0, accum));
          positiveSteps.push(0);
          negativeSteps.push(absVal);
        } else {
          // Result
          placeholder.push(0);
          positiveSteps.push(val);
          negativeSteps.push(0);
        }
      });

      wfChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any[]) => {
            const tar = params.find((p) => p.value !== '-' && p.value > 0);
            if (!tar) return '';
            return `<div style="font-size:12px;font-weight:bold;color:#fff;">${tar.name}<br/><span style="color:#D4AF37;">${formatVal(
              items[tar.dataIndex]?.value || 0
            )}</span></div>`;
          },
        },
        grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: titles,
          axisLabel: { color: '#C4BDB5', fontSize: 11, interval: 0, rotate: 15 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#78716C',
            fontSize: 10,
            formatter: (v: number) => {
              if (currency === 'UZS') return (v / 1000000).toFixed(1) + 'M';
              if (currency === 'USD') return '$' + v;
              return (v / 1000).toFixed(0) + 'k';
            },
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        },
        series: [
          {
            name: 'Placeholder',
            type: 'bar',
            stack: 'Total',
            itemStyle: { borderColor: 'transparent', color: 'transparent' },
            emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
            data: placeholder,
          },
          {
            name: 'Позитив / Доход',
            type: 'bar',
            stack: 'Total',
            label: { show: true, position: 'top', color: '#10B981', fontSize: 10, formatter: '{c}' },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#D4AF37' },
                { offset: 1, color: '#8B5A2B' },
              ]),
              borderRadius: [6, 6, 0, 0],
            },
            data: positiveSteps,
          },
          {
            name: 'Расход / Издержки',
            type: 'bar',
            stack: 'Total',
            label: { show: true, position: 'bottom', color: '#F87171', fontSize: 10, formatter: '-{c}' },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#EF4444' },
                { offset: 1, color: '#991B1B' },
              ]),
              borderRadius: [0, 0, 6, 6],
            },
            data: negativeSteps,
          },
        ],
      });
    }

    // 2. P&L Statement Stacked Bar
    if (pnlChartRef.current && subTab === 'pnl') {
      const pnlChart = echarts.init(pnlChartRef.current, 'dark');
      chartInstances.current.push(pnlChart);

      const pnlData = data.pnlStatements || [];
      const labels = pnlData.map((p) => p.periodLabel);
      const revs = pnlData.map((p) => p.netRevenueKRW);
      const costs = pnlData.map((p) => p.cogsKRW + p.logisticsKRW);
      const profits = pnlData.map((p) => p.operatingProfit);

      pnlChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['Чистая выручка', 'Себестоимость + Карго', 'Операционная прибыль'], textStyle: { color: '#C4BDB5' } },
        grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
        xAxis: { type: 'category', data: labels, axisLabel: { color: '#C4BDB5' } },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#78716C' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        },
        series: [
          {
            name: 'Чистая выручка',
            type: 'bar',
            itemStyle: { color: '#D4AF37', borderRadius: [4, 4, 0, 0] },
            data: revs,
          },
          {
            name: 'Себестоимость + Карго',
            type: 'bar',
            itemStyle: { color: '#EF4444', borderRadius: [4, 4, 0, 0] },
            data: costs,
          },
          {
            name: 'Операционная прибыль',
            type: 'line',
            smooth: true,
            itemStyle: { color: '#10B981' },
            lineStyle: { width: 3, color: '#10B981' },
            data: profits,
          },
        ],
      });
    }

    // 3. Cohort Retention Decay Line
    if (cohortChartRef.current && subTab === 'cohorts') {
      const coChart = echarts.init(cohortChartRef.current, 'dark');
      chartInstances.current.push(coChart);

      const cohorts = data.cohorts || [];
      const seriesList = cohorts.map((c, idx) => {
        const colors = ['#D4AF37', '#38BDF8', '#A78BFA', '#34D399', '#FB923C', '#F472B6'];
        return {
          name: `Когорта ${c.cohortMonth}`,
          type: 'line',
          smooth: true,
          data: c.retentionRates || [],
          lineStyle: { width: 2.5, color: colors[idx % colors.length] },
          itemStyle: { color: colors[idx % colors.length] },
        };
      });

      coChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', formatter: '{b}<br/>{a0}: {c0}%' },
        legend: { textStyle: { color: '#C4BDB5' }, top: 0 },
        grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['M0 (Старт)', 'M+1 (1 мес)', 'M+2 (2 мес)', 'M+3 (3 мес)', 'M+4 (4 мес)', 'M+5 (5 мес)'],
          axisLabel: { color: '#C4BDB5' },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#78716C', formatter: '{value}%' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          max: 100,
        },
        series: seriesList,
      });
    }

    const handleResize = () => chartInstances.current.forEach((c) => c.resize());
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstances.current.forEach((c) => c.dispose());
    };
  }, [data, subTab, currency, isLoading]);

  // Handle Export CSV
  const handleDownloadLedger = async () => {
    setIsExporting(true);
    try {
      const blob = await adminService.exportUnitSalesLedger(periodDays, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mk_sales_ledger_${periodDays}days_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Ошибка экспорта журнала продаж');
    } finally {
      setIsExporting(false);
    }
  };

  // Simulator calculations
  const simWeightKg = simWeightGrams / 1000.0;
  const simCargoKRW = simWeightKg * simCargoRateUSD * 1350.0;
  const simTotalCostKRW = simPurchaseKRW + simCargoKRW + simPackagingKRW;
  // Recommended Retail = TotalCost / (1 - (TargetMargin% + Acquiring%)/100)
  const simMarginDecimal = (simTargetMarginPct + simAcquiringFeePct) / 100.0;
  const simRetailKRW = simMarginDecimal < 1.0 ? simTotalCostKRW / (1.0 - simMarginDecimal) : simTotalCostKRW * 1.8;
  const simUnitProfitKRW = simRetailKRW - simTotalCostKRW - (simRetailKRW * (simAcquiringFeePct / 100.0));
  const simMarkupPct = simTotalCostKRW > 0 ? ((simRetailKRW - simTotalCostKRW) / simTotalCostKRW) * 100 : 0;

  // Filtered Products
  const filteredProducts = (data?.productsEconomics || []).filter((p) => {
    const matchSearch =
      !productSearch.trim() ||
      p.productTitle.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.productId.toLowerCase().includes(productSearch.toLowerCase());

    const matchMargin =
      marginFilter === 'all' ||
      p.marginClass === marginFilter;

    return matchSearch && matchMargin;
  }).sort((a, b) => {
    if (productSort === 'profit') return b.totalMarginKRW - a.totalMarginKRW;
    if (productSort === 'marginPct') return b.grossMarginPct - a.grossMarginPct;
    if (productSort === 'units') return b.unitsSold - a.unitsSold;
    return b.totalRevenueKRW - a.totalRevenueKRW;
  });

  // Filtered ABC/XYZ
  const filteredAbcXyz = (data?.abcXyzMatrix || []).filter((item) => {
    if (selectedMatrixCode === 'all') return true;
    return item.matrixCode === selectedMatrixCode || item.abcGroup === selectedMatrixCode || item.xyzGroup === selectedMatrixCode;
  });

  // Filtered Ledger
  const filteredLedger = (data?.recentLedger || []).filter((item) => {
    if (!ledgerSearch.trim()) return true;
    const q = ledgerSearch.toLowerCase();
    return (
      item.orderNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.productTitle.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.assignedTo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header & Global Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1C1A18] border border-white/10 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8B5A2B] flex items-center justify-center text-[#141312]">
              <TrendingUp className="w-4 h-4 font-bold" />
            </div>
            <h1 className="text-xl font-bold text-white font-serif">Продажи & Юнит-Экономика</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ERP Analytics
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-1">
            Позиционный расчет маржинальности, себестоимости закупки из Кореи, ABC/XYZ анализ и P&L отчет
          </p>
        </div>

        {/* Currency & Period Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-[#141312] border border-white/10 rounded-2xl p-1">
            {(['KRW', 'UZS', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currency === curr
                    ? 'bg-[#D4AF37] text-[#141312] shadow-md shadow-[#D4AF37]/20'
                    : 'text-[#A8A29E] hover:text-white'
                }`}
              >
                {curr === 'KRW' ? '₩ Вон' : curr === 'UZS' ? 'Сум' : '$ USD'}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-[#141312] border border-white/10 rounded-2xl p-1">
            {[
              { days: 7, label: '7д' },
              { days: 30, label: '30д' },
              { days: 90, label: '90д' },
              { days: 365, label: '1 год' },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => setPeriodDays(p.days)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  periodDays === p.days
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-[#78716C] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchUnitEconomics}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 transition-all disabled:opacity-50"
            title="Обновить расчеты"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownloadLedger}
            disabled={isExporting}
            className="py-2 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Журнал</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'overview', label: '💎 Сводка & Waterfall', icon: TrendingUp },
          { id: 'products', label: '📊 Таблица товаров', icon: Package },
          { id: 'abc_xyz', label: '🎯 Матрица ABC / XYZ', icon: Layers },
          { id: 'pnl', label: '📈 P&L Прибыли и Убытки', icon: BarChart3 },
          { id: 'cohorts', label: '👥 Когорты & LTV', icon: Users },
          { id: 'simulator', label: '🧮 Симулятор ценообразования', icon: Calculator },
          { id: 'ledger', label: '📜 Журнал продаж (Ledger)', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as SubTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                subTab === tab.id
                  ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-white/5 text-[#A8A29E] hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW & WATERFALL */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Macro KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Profit & Margin % */}
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[#A8A29E]">
                <span className="text-xs uppercase tracking-wider font-semibold">Валовая прибыль</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-serif">
                {formatVal(data?.summary.totalGrossProfitKRW || 0)}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {data?.summary.overallMarginPct || 0}% маржа
                </span>
                <span className="text-[#78716C]">за {periodDays} дней</span>
              </div>
            </div>

            {/* Average Selling Price per Unit */}
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[#A8A29E]">
                <span className="text-xs uppercase tracking-wider font-semibold">Выручка на 1 шт (Unit)</span>
                <Package className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-bold text-[#D4AF37] font-serif">
                {formatVal(data?.summary.avgSellingPriceKRW || 0)}
              </div>
              <p className="text-[11px] text-[#78716C]">
                Всего продано: <strong className="text-white">{data?.summary.totalUnitsSold || 0} шт.</strong>
              </p>
            </div>

            {/* Average Purchase Cost & Cargo per Unit */}
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[#A8A29E]">
                <span className="text-xs uppercase tracking-wider font-semibold">Закупка + Карго на шт</span>
                <Plane className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white font-serif">
                {formatVal((data?.summary.avgCostPriceKRW || 0) + (data?.summary.avgCargoCostPerUnitKRW || 0))}
              </div>
              <div className="text-[11px] text-[#A8A29E] flex items-center gap-2">
                <span>Закупка: {formatVal(data?.summary.avgCostPriceKRW || 0)}</span>
                <span>•</span>
                <span>Авиа: {formatVal(data?.summary.avgCargoCostPerUnitKRW || 0)}</span>
              </div>
            </div>

            {/* Unit Contribution Margin */}
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[#A8A29E]">
                <span className="text-xs uppercase tracking-wider font-semibold">Маржа с 1 шт (Unit)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-serif">
                +{formatVal(data?.summary.avgMarginPerUnitKRW || 0)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A8A29E]">
                <span>Наценка к себестоимости:</span>
                <strong className="text-white">+{data?.summary.overallMarkupPct || 0}%</strong>
              </div>
            </div>
          </div>

          {/* Waterfall Chart Box */}
          <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Водопад маржинальности (Unit Economics Waterfall)
                </h2>
                <p className="text-xs text-[#A8A29E]">
                  Структура вычета расходов: от валовой выручки каталога до чистой операционной прибыли
                </p>
              </div>
              <span className="text-xs text-[#D4AF37] font-mono font-semibold">
                Период: {periodDays} дней
              </span>
            </div>

            <div ref={waterfallRef} className="w-full h-80 sm:h-96" />
          </div>

          {/* Top Products Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider block">
                  Самый прибыльный товар (Top Profit)
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                  {data?.summary.topProfitableProduct || '—'}
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider block">
                  Лидер продаж по объему (Top Volume)
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                  {data?.summary.topVolumeProduct || '—'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PRODUCTS UNIT ECONOMICS TABLE */}
      {subTab === 'products' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Поиск товара по названию, бренду, артикулу..."
                className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <select
                value={marginFilter}
                onChange={(e) => setMarginFilter(e.target.value)}
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Все уровни маржи</option>
                <option value="high">🟢 Высокая маржа (&gt;45%)</option>
                <option value="standard">🟡 Стандартная маржа (25-45%)</option>
                <option value="low">🟠 Низкая маржа (10-25%)</option>
                <option value="loss">🔴 Убыточная / &lt;10%</option>
              </select>
            </div>

            <div>
              <select
                value={productSort}
                onChange={(e) => setProductSort(e.target.value as any)}
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="profit">Сортировка: По валовой прибыли</option>
                <option value="marginPct">Сортировка: По рентабельности %</option>
                <option value="units">Сортировка: По объему (шт)</option>
                <option value="revenue">Сортировка: По выручке</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] border-b border-white/10 text-[#A8A29E] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Товар & Бренд</th>
                    <th className="py-3.5 px-3 text-center">Продано</th>
                    <th className="py-3.5 px-3">Цена продажи</th>
                    <th className="py-3.5 px-3">Закупка Корея</th>
                    <th className="py-3.5 px-3">Авиа-Карго</th>
                    <th className="py-3.5 px-3">Маржа на 1 шт</th>
                    <th className="py-3.5 px-3">Итого прибыль</th>
                    <th className="py-3.5 px-4 text-right">Рентабельность %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((p) => {
                    const statusColors: Record<string, string> = {
                      high: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      standard: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      low: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                      loss: 'bg-red-500/10 text-red-400 border-red-500/30',
                    };

                    return (
                      <tr key={p.productId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/10">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-[#78716C]">
                                  MK
                                </div>
                              )}
                            </div>
                            <div className="max-w-xs">
                              <div className="font-semibold text-white truncate">{p.productTitle}</div>
                              <div className="text-[11px] text-[#D4AF37] flex items-center gap-1.5 mt-0.5">
                                <span>{p.brand}</span>
                                <span className="text-[#78716C]">•</span>
                                <span className="font-mono text-[#78716C] text-[10px]">ID: {p.productId}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-white">
                          <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                            {p.unitsSold} шт
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-white">
                          {formatVal(p.avgSellingPriceKRW)}
                        </td>

                        <td className="py-3 px-3 text-[#A8A29E]">
                          {formatVal(p.avgCostPriceKRW)}
                        </td>

                        <td className="py-3 px-3 text-sky-400">
                          {formatVal(p.avgCargoPerUnitKRW)}
                        </td>

                        <td className="py-3 px-3 font-bold text-emerald-400">
                          +{formatVal(p.unitMarginKRW)}
                        </td>

                        <td className="py-3 px-3 font-bold text-[#D4AF37] font-serif">
                          {formatVal(p.totalMarginKRW)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[p.marginClass] || ''}`}>
                            {p.grossMarginPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#78716C]">
                        Товары по заданным фильтрам не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ABC / XYZ PORTFOLIO MATRIX */}
      {subTab === 'abc_xyz' && (
        <div className="space-y-6">
          {/* Explanation Header */}
          <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                ABC Анализ (Вклад в выручку / прибыль)
              </h3>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                <strong>Группа A</strong> (80% выручки) — локомотивы ассортимента.<br />
                <strong>Группа B</strong> (15% выручки) — надежная середина.<br />
                <strong>Группа C</strong> (5% выручки) — длинный хвост, неликвиды.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                XYZ Анализ (Стабильность спроса)
              </h3>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                <strong>Группа X</strong> (CV &lt; 15%) — стабильный регулярный спрос.<br />
                <strong>Группа Y</strong> (CV 15-30%) — умеренные сезонные колебания.<br />
                <strong>Группа Z</strong> (CV &gt; 30%) — единичный случайный спрос.
              </p>
            </div>
          </div>

          {/* 3x3 Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { code: 'AX', title: '💎 Группа AX', desc: 'Ключевые хиты, стабильный спрос', rec: 'Всегда держать большой складской запас!' },
              { code: 'AY', title: '📈 Группа AY', desc: 'Высокая прибыль, сезонность', rec: 'Закупать партиями к началу пиков.' },
              { code: 'AZ', title: '⚡ Группа AZ', desc: 'Высокий чек, нерегулярный спрос', rec: 'Возить быстрым авиа-карго под заказ.' },
              { code: 'BX', title: '📦 Группа BX', desc: 'Поддерживающий ассортимент', rec: 'Плановые стабильные закупки.' },
              { code: 'BY', title: '🔄 Группа BY', desc: 'Средний спрос с колебаниями', rec: 'Оптимизировать размеры партий.' },
              { code: 'BZ', title: '⚠️ Группа BZ', desc: 'Нерегулярный средний спрос', rec: 'Закупать небольшими объемами.' },
              { code: 'CX', title: '🏷️ Группа CX', desc: 'Стабильные низкодоходные', rec: 'Рассмотреть повышение розничной цены.' },
              { code: 'CY', title: '📉 Группа CY', desc: 'Низкая выручка и колебания', rec: 'Сокращать складские остатки.' },
              { code: 'CZ', title: '🚫 Группа CZ', desc: 'Аутсайдеры / Неликвид', rec: 'Распродать со скидкой, вывести из базы.' },
            ].map((cell) => {
              const count = data?.abcXyzCounts?.[cell.code] || 0;
              const isSelected = selectedMatrixCode === cell.code;
              return (
                <div
                  key={cell.code}
                  onClick={() => setSelectedMatrixCode(isSelected ? 'all' : cell.code)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                      : 'bg-[#1C1A18] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white/10 text-white">
                      {cell.code}
                    </span>
                    <span className="text-xs font-bold text-[#D4AF37]">
                      {count} товаров
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{cell.title}</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1">{cell.desc}</p>
                  <div className="mt-3 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[10px] text-emerald-400 font-medium">
                    {cell.rec}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filtered Matrix Product List */}
          <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white">
                Товары в матрице {selectedMatrixCode !== 'all' ? `(${selectedMatrixCode})` : '(Все группы)'}
              </h3>
              <span className="text-xs text-[#A8A29E]">Найдено: {filteredAbcXyz.length} поз.</span>
            </div>

            <div className="divide-y divide-white/5">
              {filteredAbcXyz.map((item) => (
                <div key={item.productId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 max-w-md">
                    <div className="font-semibold text-white">{item.productTitle}</div>
                    <div className="text-[11px] text-[#78716C] flex items-center gap-2">
                      <span className="text-[#D4AF37]">{item.brand}</span>
                      <span>•</span>
                      <span>Доля в выручке: <strong>{item.revenueSharePct}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-[#78716C] block uppercase">Выручка:</span>
                      <span className="font-bold text-white font-serif">{formatVal(item.revenueKRW)}</span>
                    </div>

                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30">
                      {item.matrixCode}
                    </span>
                  </div>
                </div>
              ))}
              {filteredAbcXyz.length === 0 && (
                <p className="py-6 text-center text-[#78716C]">Нет товаров в выбранной группе</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: P&L INCOME STATEMENT */}
      {subTab === 'pnl' && (
        <div className="space-y-6">
          {/* P&L Chart */}
          <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Динамика P&L: Выручка, Себестоимость и Прибыль по периодам
            </h2>
            <div ref={pnlChartRef} className="w-full h-80" />
          </div>

          {/* P&L Statements Table */}
          <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-[#161514] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Отчет о прибылях и убытках (Income Statement Table)
              </h3>
              <span className="text-xs text-[#A8A29E]">Валюта: {currency}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141312] border-b border-white/10 text-[#A8A29E] text-[10px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Период</th>
                    <th className="py-3 px-3 text-center">Заказов / Штук</th>
                    <th className="py-3 px-3">Валовая выручка</th>
                    <th className="py-3 px-3">Себестоимость COGS</th>
                    <th className="py-3 px-3">Авиа-Карго</th>
                    <th className="py-3 px-3">Комиссии & Эквайринг</th>
                    <th className="py-3 px-3">Валовая прибыль</th>
                    <th className="py-3 px-3">Операционная прибыль</th>
                    <th className="py-3 px-4 text-right">Рентабельность %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.pnlStatements || []).map((row) => (
                    <tr key={row.periodLabel} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-bold text-white">{row.periodLabel}</td>
                      <td className="py-3 px-3 text-center text-[#C4BDB5]">
                        {row.ordersCount} зак. / {row.unitsCount} шт.
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">{formatVal(row.netRevenueKRW)}</td>
                      <td className="py-3 px-3 text-[#EF4444]">{formatVal(row.cogsKRW)}</td>
                      <td className="py-3 px-3 text-sky-400">{formatVal(row.logisticsKRW)}</td>
                      <td className="py-3 px-3 text-[#A8A29E]">{formatVal(row.commissionsKRW)}</td>
                      <td className="py-3 px-3 font-bold text-[#D4AF37]">{formatVal(row.grossProfitKRW)}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400 font-serif">
                        {formatVal(row.operatingProfit)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                          {row.netMarginPct?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: COHORTS & LTV */}
      {subTab === 'cohorts' && (
        <div className="space-y-6">
          {/* Cohort Retention Line Chart */}
          <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Кривые удержания когорт (Cohort Retention Rate Decay)
            </h2>
            <div ref={cohortChartRef} className="w-full h-80" />
          </div>

          {/* Cohort Table */}
          <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-[#161514] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Матрица удержания когорт (Customer Retention % by Month)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-[#141312] border-b border-white/10 text-[#A8A29E] text-[10px] uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left">Когорта (Месяц)</th>
                    <th className="py-3 px-3">Новых клиентов</th>
                    <th className="py-3 px-3">Выручка когорты</th>
                    <th className="py-3 px-3">LTV на клиента</th>
                    <th className="py-3 px-3">M0</th>
                    <th className="py-3 px-3">M+1</th>
                    <th className="py-3 px-3">M+2</th>
                    <th className="py-3 px-3">M+3</th>
                    <th className="py-3 px-3">M+4</th>
                    <th className="py-3 px-3">M+5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.cohorts || []).map((c) => (
                    <tr key={c.cohortMonth} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-left font-mono font-bold text-white">{c.cohortMonth}</td>
                      <td className="py-3 px-3 font-semibold text-white">{c.newCustomersCount}</td>
                      <td className="py-3 px-3 font-bold text-[#D4AF37]">{formatVal(c.totalRevenueKRW)}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{formatVal(c.avgCustomerLtvKRW)}</td>
                      {(c.retentionRates || []).map((rate, idx) => {
                        const alpha = Math.min(1, Math.max(0.1, rate / 100));
                        return (
                          <td key={idx} className="py-3 px-2">
                            <span
                              className="inline-block w-12 py-1 rounded-md text-[11px] font-bold"
                              style={{
                                backgroundColor: `rgba(212, 175, 55, ${alpha * 0.4})`,
                                color: rate > 40 ? '#D4AF37' : '#EDE8E1',
                              }}
                            >
                              {rate}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: UNIT PRICING SIMULATOR */}
      {subTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Параметры закупки & логистики</h2>
            </div>

            {/* Quick Category Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#A8A29E] font-semibold">Быстрые пресеты категорий:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Крем для лица', cost: 18000, weight: 150, margin: 45 },
                  { name: 'Сыворотка', cost: 14000, weight: 100, margin: 50 },
                  { name: 'Кушон / Тон', cost: 22000, weight: 120, margin: 40 },
                  { name: 'Патчи под глаза', cost: 9000, weight: 180, margin: 45 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSimPurchaseKRW(p.cost);
                      setSimWeightGrams(p.weight);
                      setSimTargetMarginPct(p.margin);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-left font-medium text-[#C4BDB5] hover:text-white border border-white/5 transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Закупочная цена в Корее (₩ KRW):
                </label>
                <input
                  type="number"
                  value={simPurchaseKRW}
                  onChange={(e) => setSimPurchaseKRW(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Вес единицы товара (граммы):
                </label>
                <input
                  type="number"
                  value={simWeightGrams}
                  onChange={(e) => setSimWeightGrams(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Тариф авиа-карго ($ / кг):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={simCargoRateUSD}
                  onChange={(e) => setSimCargoRateUSD(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  <span>Желаемая маржинальность:</span>
                  <span className="text-[#D4AF37] font-bold">{simTargetMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="75"
                  value={simTargetMarginPct}
                  onChange={(e) => setSimTargetMarginPct(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Эквайринг & комиссия менеджера (%):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={simAcquiringFeePct}
                  onChange={(e) => setSimAcquiringFeePct(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#1C1A18] border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Результаты калькуляции розничной цены и маржи
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Recommended Retail Price */}
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 space-y-1">
                  <span className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider">
                    Рекомендуемая цена продажи:
                  </span>
                  <div className="text-3xl font-bold text-[#D4AF37] font-serif">
                    ₩ {Math.round(simRetailKRW).toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    ≈ {Math.round(simRetailKRW * 9.5).toLocaleString()} сум
                  </div>
                </div>

                {/* Net Profit per Unit */}
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                    Чистая прибыль с 1 шт:
                  </span>
                  <div className="text-3xl font-bold text-emerald-400 font-serif">
                    +₩ {Math.round(simUnitProfitKRW).toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    ≈ +{Math.round(simUnitProfitKRW * 9.5).toLocaleString()} сум
                  </div>
                </div>
              </div>

              {/* Breakdown Detail */}
              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-[#A8A29E]">Полная себестоимость единицы (Landed Cost):</span>
                  <strong className="text-white">₩ {Math.round(simTotalCostKRW).toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-[#A8A29E]">Доля авиа-логистики в себестоимости:</span>
                  <strong className="text-sky-400">₩ {Math.round(simCargoKRW).toLocaleString()} ({(simCargoKRW/simTotalCostKRW*100).toFixed(1)}%)</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-[#A8A29E]">Торговая наценка к себестоимости (Markup %):</span>
                  <strong className="text-emerald-400 font-bold">+{simMarkupPct.toFixed(1)}%</strong>
                </div>
              </div>

              {/* Batch Profit Potential */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
                  Прогноз прибыли при партии:
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#78716C] block">10 штук</span>
                    <strong className="text-xs text-white">₩ {Math.round(simUnitProfitKRW * 10).toLocaleString()}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#78716C] block">50 штук</span>
                    <strong className="text-xs text-[#D4AF37]">₩ {Math.round(simUnitProfitKRW * 50).toLocaleString()}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#78716C] block">100 штук</span>
                    <strong className="text-xs text-emerald-400">₩ {Math.round(simUnitProfitKRW * 100).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: UNIT SALES LEDGER */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Поиск по чеку (MK-...), клиенту, товару, городу или менеджеру..."
                className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              onClick={handleDownloadLedger}
              disabled={isExporting}
              className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт в Excel (.csv)</span>
            </button>
          </div>

          <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] border-b border-white/10 text-[#A8A29E] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Чек / Номер</th>
                    <th className="py-3 px-3">Дата</th>
                    <th className="py-3 px-3">Клиент & Город</th>
                    <th className="py-3 px-3">Товар</th>
                    <th className="py-3 px-2 text-center">Кол-во</th>
                    <th className="py-3 px-3">Цена</th>
                    <th className="py-3 px-3">Себестоимость</th>
                    <th className="py-3 px-3">Маржа</th>
                    <th className="py-3 px-3">Менеджер</th>
                    <th className="py-3 px-4 text-right">Рентабельность</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLedger.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-bold text-white">{item.orderNumber}</td>
                      <td className="py-3 px-3 text-[#78716C]">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{item.customerName || 'Клиент'}</div>
                        {item.city && <span className="text-[10px] text-[#A8A29E]">{item.city}</span>}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-white">{item.productTitle}</td>
                      <td className="py-3 px-2 text-center font-bold text-[#D4AF37]">{item.quantity} шт</td>
                      <td className="py-3 px-3 font-semibold text-white">{formatVal(item.unitPriceKRW)}</td>
                      <td className="py-3 px-3 text-[#EF4444]">{formatVal(item.unitCostKRW)}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">+{formatVal(item.totalMarginKRW)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#C4BDB5] text-[10px] border border-white/5">
                          {item.assignedTo || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{item.marginPct}%</td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#78716C]">
                        Записи в журнале продаж не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
