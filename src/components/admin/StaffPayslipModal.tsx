import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Building2,
  DollarSign,
  User,
  Calendar,
  Award,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import { StaffPayrollSummary } from '../../services/admin/adminService';

interface StaffPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffPayrollSummary | null;
  month: string;
}

export const StaffPayslipModal: React.FC<StaffPayslipModalProps> = ({
  isOpen,
  onClose,
  staff,
  month,
}) => {
  if (!isOpen || !staff) return null;

  const handlePrint = () => {
    window.print();
  };

  const periodDisplay = month === 'all' || !month ? 'За весь период' : month;
  const docNumber = `MK-PAY-${month.replace('-', '')}-${staff.Username || staff.DisplayName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0 print:z-[9999]">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible;
          }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20mm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative max-w-3xl w-full bg-[#1C1A18] text-[#EDE8E1] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-8 print:my-0 print:max-w-none print:w-full print:rounded-none print:border-none print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161514]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Расчетный лист по заработной плате</h2>
              <p className="text-[11px] text-[#A8A29E]">Печать и сохранение в PDF формат А4</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#C49E30] text-[#141312] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Распечатать / Сохранить PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8A29E] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-payslip" className="p-8 space-y-6 bg-white text-black font-sans print:p-0">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-black/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-lg bg-black text-[#D4AF37] flex items-center justify-center font-serif font-black text-base">
                  MK
                </div>
                <div>
                  <h1 className="font-serif font-black text-lg tracking-wider text-black">
                    MK KOREA COSMETICS
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                    Прямые поставки корейской косметики • Оптово-розничный отдел
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-800 rounded font-mono text-xs font-bold border border-gray-300">
                РАСЧЕТНЫЙ ЛИСТОК
              </span>
              <div className="text-[11px] text-gray-600 font-mono pt-1">
                № {docNumber}
              </div>
              <div className="text-[11px] text-gray-500">
                Период: <strong>{periodDisplay}</strong>
              </div>
              <div className="text-[10px] text-gray-400">
                Дата формирования: {new Date().toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>

          {/* Employee Info Block */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Сотрудник / Получатель:</span>
              <strong className="text-sm font-bold text-black block">{staff.DisplayName}</strong>
              <span className="text-gray-600 font-mono text-[11px]">Логин в системе: @{staff.Username}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Должность и отдел:</span>
              <span className="font-bold text-gray-900 block capitalize">
                {staff.Role === 'admin' ? 'Администратор' : staff.Role === 'manager' ? 'Менеджер по продажам' : 'Логист'}
              </span>
              {staff.Phone && <span className="text-gray-600 font-mono text-[11px] block">{staff.Phone}</span>}
            </div>
          </div>

          {/* Sales Performance Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              1. Показатели продаж за расчетный период:
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Обработано заказов</span>
                <strong className="text-sm text-black font-bold">{staff.OrdersCount} шт.</strong>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Закрыто / Оплачено</span>
                <strong className="text-sm text-green-700 font-bold">{staff.PaidCount} шт.</strong>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Личный оборот продаж</span>
                <strong className="text-sm text-black font-bold font-mono">
                  {staff.TotalRevenueUZS.toLocaleString()} сум
                </strong>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Маржа по заказам</span>
                <strong className="text-sm text-emerald-700 font-bold font-mono">
                  {staff.TotalMarginUZS.toLocaleString()} сум
                </strong>
              </div>
            </div>
          </div>

          {/* Payroll Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              2. Структура начислений заработной платы:
            </h3>
            <table className="w-full text-xs text-left border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Статья начисления</th>
                  <th className="py-2 px-3 text-center">База расчета</th>
                  <th className="py-2 px-3 text-center">Ставка / %</th>
                  <th className="py-2 px-3 text-right">Начислено (сум UZS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    Базовый оклад (Фиксированная часть)
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-500">1 мес / факт</td>
                  <td className="py-2.5 px-3 text-center text-gray-500">100%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                    {staff.BaseSalaryUZS.toLocaleString()} сум
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    Комиссионное вознаграждение ({staff.CommissionType === 'margin' ? 'от маржи' : 'от выручки'})
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                    {staff.CommissionType === 'margin'
                      ? `${staff.TotalMarginUZS.toLocaleString()} сум`
                      : `${staff.TotalRevenueUZS.toLocaleString()} сум`}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                    {staff.CommissionRatePct}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-green-700">
                    +{staff.CommissionEarnedUZS.toLocaleString()} сум
                  </td>
                </tr>

                {staff.KpiBonusUZS > 0 && (
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      Премия за выполнение KPI (план &gt;= 10 заказов)
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{staff.PaidCount} зак.</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">Бонус</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-green-700">
                      +{staff.KpiBonusUZS.toLocaleString()} сум
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-100 font-bold text-sm border-t-2 border-black/20">
                  <td colSpan={3} className="py-3 px-3 uppercase text-black font-black">
                    ИТОГО К ВЫПЛАТЕ НА РУКИ:
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-base text-black">
                    {staff.TotalPayoutUZS.toLocaleString()} сум
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Order Details Preview (up to 8 items) */}
          {staff.Orders && staff.Orders.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                3. Реестр закрытых заказов сотрудника ({staff.Orders.length} поз.):
              </h3>
              <table className="w-full text-[11px] text-left border border-gray-200">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[9px]">
                  <tr>
                    <th className="py-1.5 px-2">Заказ</th>
                    <th className="py-1.5 px-2">Дата</th>
                    <th className="py-1.5 px-2">Клиент</th>
                    <th className="py-1.5 px-2">Город</th>
                    <th className="py-1.5 px-2 text-right">Сумма (сум)</th>
                    <th className="py-1.5 px-2 text-right">Маржа (сум)</th>
                    <th className="py-1.5 px-2 text-center">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(staff?.Orders || []).slice(0, 8).map((o) => (
                    <tr key={o.id}>
                      <td className="py-1.5 px-2 font-mono font-bold">{o.OrderNumber}</td>
                      <td className="py-1.5 px-2 text-gray-500">{new Date(o.Date).toLocaleDateString()}</td>
                      <td className="py-1.5 px-2 font-medium">{o.CustomerName || 'Клиент'}</td>
                      <td className="py-1.5 px-2 text-gray-500">{o.City || '—'}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold">{o.TotalUZS.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-green-700 font-semibold">{o.MarginUZS.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-center text-[10px] text-gray-600 uppercase">{o.Status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(staff?.Orders || []).length > 8 && (
                <p className="text-[10px] text-gray-400 italic text-right mt-1">
                  ...и еще {staff.Orders.length - 8} заказов в полном отчете
                </p>
              )}
            </div>
          )}

          {/* Signatures Block */}
          <div className="pt-6 mt-6 border-t-2 border-black/10 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <span className="font-bold text-gray-800 block uppercase text-[10px]">
                Руководитель / Генеральный Директор:
              </span>
              <div className="pt-4 border-b border-black/40 flex justify-between text-gray-400 text-[10px]">
                <span>(Подпись)</span>
                <span>/ М. П. /</span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-bold text-gray-800 block uppercase text-[10px]">
                Сотрудник (Ознакомлен и получил):
              </span>
              <div className="pt-4 border-b border-black/40 flex justify-between text-gray-400 text-[10px]">
                <span>{staff.DisplayName}</span>
                <span>(Подпись)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
