import React from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Building2,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { DeepAnalyticsData } from '../../services/admin/adminService';

interface RevenueReportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DeepAnalyticsData | null;
  periodDays: number;
  currencyView: 'UZS' | 'KRW' | 'USD';
  onExportXLSX?: () => void;
}

export const RevenueReportPDFModal: React.FC<RevenueReportPDFModalProps> = ({
  isOpen,
  onClose,
  data,
  periodDays,
  currencyView,
  onExportXLSX,
}) => {
  if (!isOpen || !data) return null;

  const currencyRate = currencyView === 'UZS' ? 9.2 : currencyView === 'KRW' ? 1 : 0.00075;
  const currencySymbol = currencyView === 'UZS' ? ' сум' : currencyView === 'KRW' ? ' ₩' : ' $';

  const fmtVal = (val: number) => {
    const converted = (val || 0) * currencyRate;
    return Math.round(converted).toLocaleString('ru-RU') + currencySymbol;
  };

  const handlePrint = () => {
    window.print();
  };

  const nowFormatted = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalRev = data.totalRevenueKRW || 0;
  const totalUnits = (data.topBrands || []).reduce((sum, b) => sum + (b.unitsSold || 0), 0) || Math.round((data.totalOrders || 0) * 1.8);
  const totalOrders = data.totalOrders || 0;
  const avgCheck = totalOrders > 0 ? totalRev / totalOrders : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container - Printable & Screen */}
      <div className="bg-[#181614] border border-[#D4AF37]/30 text-[#EDE8E1] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 print:my-0 print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full">
        
        {/* Top Action Bar (Hidden on Print) */}
        <div className="p-4 bg-[#141210] border-b border-[#D4AF37]/20 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-black font-black flex items-center justify-center font-serif text-xs">
              MK
            </div>
            <span className="font-serif font-bold text-white text-sm">Финансовый отчет по выручке и продажам (PDF)</span>
          </div>

          <div className="flex items-center gap-2">
            {onExportXLSX && (
              <button
                onClick={onExportXLSX}
                className="py-1.5 px-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="py-1.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / Сохранить в PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-10 space-y-6 print:p-0 print:space-y-4 print:text-black">
          
          {/* Header of the Official Report */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D4AF37]/30 pb-6 print:border-black print:pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-2xl tracking-wide text-[#D4AF37] print:text-black">
                  MK KOREA COSMETIC
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 print:border-black print:text-black">
                  FINANCIAL REPORT
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 print:text-neutral-600">
                Прямые поставки сертифицированной корейской косметики • Сеул — Ташкент
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-neutral-400 print:text-neutral-700 space-y-0.5">
              <div><strong>Период:</strong> За последние {periodDays} дней</div>
              <div><strong>Сформирован:</strong> {nowFormatted}</div>
              <div><strong>Валюта отчета:</strong> {currencyView} ({currencySymbol.trim()})</div>
            </div>
          </div>

          {/* Key Financial Totals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
            <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block print:text-neutral-600">
                Общая выручка
              </span>
              <div className="text-xl font-black text-[#D4AF37] font-serif mt-1 print:text-black">
                {fmtVal(totalRev)}
              </div>
              <span className="text-[10px] text-emerald-400 print:text-emerald-700 block mt-0.5">
                За период {periodDays} дн.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block print:text-neutral-600">
                Продано товаров
              </span>
              <div className="text-xl font-black text-white font-serif mt-1 print:text-black">
                {totalUnits.toLocaleString('ru-RU')} шт.
              </div>
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block mt-0.5">
                Общий объем в штуках
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block print:text-neutral-600">
                Всего заказов
              </span>
              <div className="text-xl font-black text-white font-serif mt-1 print:text-black">
                {totalOrders}
              </div>
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block mt-0.5">
                Оформлено и доставлено
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block print:text-neutral-600">
                Средний чек
              </span>
              <div className="text-xl font-black text-[#D4AF37] font-serif mt-1 print:text-black">
                {fmtVal(avgCheck)}
              </div>
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block mt-0.5">
                На 1 заказ
              </span>
            </div>
          </div>

          {/* Section 1: Sales by Seller / Manager Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 print:border-black">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37] print:text-black" />
                <h3 className="font-bold text-sm text-white print:text-black uppercase tracking-wider">
                  Распределение продаж и выручки по продавцам
                </h3>
              </div>
              <span className="text-xs text-neutral-400 print:text-neutral-600">
                Всего сотрудников: {(data.sellersRadar || []).length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 font-semibold print:border-black print:text-neutral-700">
                    <th className="py-2 px-2">№</th>
                    <th className="py-2 px-2">Продавец / Менеджер</th>
                    <th className="py-2 px-2">Роль</th>
                    <th className="py-2 px-2 text-center">Заказов</th>
                    <th className="py-2 px-2 text-right">Выручка</th>
                    <th className="py-2 px-2 text-right">Средний чек</th>
                    <th className="py-2 px-2 text-right">Доля %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-neutral-300">
                  {(data.sellersRadar || []).map((s, idx) => {
                    const sellerRev = s.revenueKRW || 0;
                    const sharePct = totalRev > 0 ? ((sellerRev / totalRev) * 100).toFixed(1) : '0';
                    return (
                      <tr key={s.username} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="py-2.5 px-2 font-mono font-bold text-[#D4AF37] print:text-black">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-white print:text-black">{s.displayName || s.username}</div>
                          <div className="text-[10px] text-neutral-400 print:text-neutral-600">@{s.username}</div>
                        </td>
                        <td className="py-2.5 px-2 text-neutral-300 print:text-neutral-700">
                          {s.role === 'admin' ? 'Администратор' : 'Продавец-консультант'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-white print:text-black">
                          {s.ordersCount}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-[#D4AF37] print:text-black">
                          {fmtVal(sellerRev)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-neutral-300 print:text-neutral-700">
                          {fmtVal(s.avgTicketKRW || (s.ordersCount > 0 ? sellerRev / s.ordersCount : 0))}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-white print:text-black">
                          {sharePct}%
                        </td>
                      </tr>
                    );
                  })}
                  {(!data.sellersRadar || data.sellersRadar.length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-neutral-400">
                        Нет данных по продавцам за выбранный период
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Top Selling Brands & Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 pt-2">
            
            {/* Top Brands */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 print:border-black">
                <Award className="w-3.5 h-3.5 text-[#D4AF37] print:text-black" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white print:text-black">
                  Топ брендов по продажам
                </h4>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neutral-400 text-[11px] print:text-neutral-600">
                    <th className="py-1 text-left">Бренд</th>
                    <th className="py-1 text-center">Штук</th>
                    <th className="py-1 text-right">Выручка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-neutral-200">
                  {(data.topBrands || []).slice(0, 5).map((b) => (
                    <tr key={b.brand} className="py-1">
                      <td className="py-1.5 font-semibold text-white print:text-black">{b.brand}</td>
                      <td className="py-1.5 text-center text-neutral-300 print:text-neutral-700">{b.unitsSold} шт.</td>
                      <td className="py-1.5 text-right font-bold text-[#D4AF37] print:text-black">{fmtVal(b.revenueKRW)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Regional Geography */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 print:border-black">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37] print:text-black" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white print:text-black">
                  География заказов
                </h4>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neutral-400 text-[11px] print:text-neutral-600">
                    <th className="py-1 text-left">Регион</th>
                    <th className="py-1 text-center">Заказов</th>
                    <th className="py-1 text-right">Выручка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-neutral-200">
                  {(data.geographyStats || []).slice(0, 5).map((g) => (
                    <tr key={g.city} className="py-1">
                      <td className="py-1.5 font-semibold text-white print:text-black">{g.city || 'Ташкент'}</td>
                      <td className="py-1.5 text-center text-neutral-300 print:text-neutral-700">{g.ordersCount}</td>
                      <td className="py-1.5 text-right font-bold text-[#D4AF37] print:text-black">{fmtVal(g.revenueKRW)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Signatures & Official Stamp Block */}
          <div className="pt-8 mt-6 border-t border-white/10 print:border-black print:mt-4 grid grid-cols-2 gap-8 text-xs text-neutral-400 print:text-black">
            <div className="space-y-4">
              <div>Руководитель MK Cosmetics:</div>
              <div className="flex items-end gap-2 border-b border-neutral-600 print:border-black pb-1">
                <span className="font-bold text-white print:text-black">Ким Мухаббат</span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600">(подпись)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>Старший менеджер / Бухгалтер:</div>
              <div className="flex items-end gap-2 border-b border-neutral-600 print:border-black pb-1">
                <span className="font-bold text-white print:text-black">Отдел учета и продаж</span>
                <span className="text-[10px] text-neutral-500 print:text-neutral-600">(подпись)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
