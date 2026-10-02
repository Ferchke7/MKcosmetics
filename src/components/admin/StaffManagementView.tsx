import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Phone,
  CheckCircle2,
  Award,
  RefreshCw,
  Search,
  UserCheck,
  Briefcase,
  X,
  DollarSign,
  Calculator,
  Printer,
  Download,
  Calendar,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  adminService,
  StaffMember,
  PayrollReportResponse,
  StaffPayrollSummary,
} from '../../services/admin/adminService';
import { StaffPayslipModal } from './StaffPayslipModal';

interface StaffManagementViewProps {
  token: string;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({ token }) => {
  const [subTab, setSubTab] = useState<'team' | 'payroll'>('team');

  // Staff State
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'manager' | 'logistics'>('manager');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Payroll Calculation State
  const [payrollReport, setPayrollReport] = useState<PayrollReportResponse | null>(null);
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState<string>('all');
  const [commissionType, setCommissionType] = useState<'revenue' | 'margin'>('revenue');
  const [commissionRate, setCommissionRate] = useState<number>(3.0); // 3%
  const [baseSalaryUZS, setBaseSalaryUZS] = useState<number>(2500000); // 2.5M UZS
  const [kpiBonusUZS, setKpiBonusUZS] = useState<number>(500000); // 500k UZS
  const [isExportingPayroll, setIsExportingPayroll] = useState(false);

  // Payslip Modal State
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState<StaffPayrollSummary | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const list = await adminService.getStaff(token);
      setStaff(list);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setIsLoadingPayroll(true);
    try {
      const rep = await adminService.getStaffPayroll(
        {
          month: payrollMonth,
          commissionType,
          commissionRate,
          baseSalary: baseSalaryUZS,
          kpiBonus: kpiBonusUZS,
        },
        token
      );
      setPayrollReport(rep);
    } catch (err) {
      console.error('Failed to load payroll report:', err);
    } finally {
      setIsLoadingPayroll(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  useEffect(() => {
    if (subTab === 'payroll') {
      fetchPayroll();
    }
  }, [subTab, payrollMonth, commissionType, commissionRate, baseSalaryUZS, kpiBonusUZS, token]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormUsername('');
    setFormDisplayName('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('manager');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setFormUsername(s.username);
    setFormDisplayName(s.displayName);
    setFormPhone(s.phone);
    setFormPassword('');
    setFormRole(s.role);
    setFormIsActive(s.isActive);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!formDisplayName && !formUsername) {
      alert('Укажите имя или логин сотрудника');
      return;
    }
    setIsSaving(true);
    try {
      if (editingStaff) {
        await adminService.updateStaff(
          editingStaff.id,
          {
            displayName: formDisplayName,
            phone: formPhone,
            role: formRole,
            isActive: formIsActive,
            password: formPassword || undefined,
          },
          token
        );
      } else {
        if (!formUsername || !formPassword) {
          alert('Логин и пароль обязательны для нового сотрудника');
          setIsSaving(false);
          return;
        }
        await adminService.createStaff(
          {
            username: formUsername,
            displayName: formDisplayName,
            phone: formPhone,
            password: formPassword,
            role: formRole,
            isActive: formIsActive,
          },
          token
        );
      }
      setIsModalOpen(false);
      await fetchStaff();
      if (subTab === 'payroll') await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async (id: number, username: string) => {
    if (username === 'admin') {
      alert('Главного администратора нельзя удалить');
      return;
    }
    if (!confirm(`Удалить сотрудника '${username}'?`)) return;
    try {
      await adminService.deleteStaff(id, token);
      await fetchStaff();
      if (subTab === 'payroll') await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления');
    }
  };

  const handleExportPayrollCSV = async () => {
    setIsExportingPayroll(true);
    try {
      const blob = await adminService.exportStaffPayrollCSV(
        {
          month: payrollMonth,
          commissionType,
          commissionRate,
          baseSalary: baseSalaryUZS,
          kpiBonus: kpiBonusUZS,
        },
        token
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mk_payroll_${payrollMonth}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Ошибка экспорта ведомости');
    } finally {
      setIsExportingPayroll(false);
    }
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: '👑 Суперадмин', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    manager: { label: '🛍 Продавец-консультант', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
    logistics: { label: '✈️ Логист / Склад', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8B5A2B] flex items-center justify-center text-[#141312]">
              <Users className="w-4 h-4 font-bold" />
            </div>
            <h1 className="text-xl font-bold text-white font-serif">Продавцы & Зарплатная Ведомость</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              CRM Roles & Payroll
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-1">
            Управление менеджерами, расчет процентов с продаж, KPI бонусов и печать расчетных листков (PDF / Excel)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {subTab === 'team' ? (
            <button
              onClick={handleOpenAdd}
              className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить продавца</span>
            </button>
          ) : (
            <button
              onClick={handleExportPayrollCSV}
              disabled={isExportingPayroll}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Экспорт ведомости в Excel</span>
            </button>
          )}

          <button
            onClick={() => (subTab === 'team' ? fetchStaff() : fetchPayroll())}
            disabled={isLoading || isLoadingPayroll}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 transition-all disabled:opacity-50"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isLoadingPayroll ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setSubTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            subTab === 'team'
              ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
              : 'bg-white/5 text-[#A8A29E] hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Команда & Продавцы ({staff.length})</span>
        </button>

        <button
          onClick={() => setSubTab('payroll')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            subTab === 'payroll'
              ? 'bg-[#D4AF37] text-[#141312] font-bold shadow-lg shadow-[#D4AF37]/20'
              : 'bg-white/5 text-[#A8A29E] hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Зарплаты, Проценты & Расчетные Листы (Payroll)</span>
        </button>
      </div>

      {/* SUBTAB 1: TEAM MEMBERS LIST */}
      {subTab === 'team' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени, логину или телефону сотрудника..."
                className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Staff Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((s) => {
              const roleInfo = roleLabels[s.role] || { label: s.role, color: 'bg-white/5 text-white' };
              return (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold text-base">
                        {s.displayName.charAt(0).toUpperCase() || s.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{s.displayName}</h3>
                        <span className="font-mono text-xs text-[#A8A29E]">@{s.username}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {s.username !== 'admin' && (
                        <button
                          onClick={() => handleDeleteStaff(s.id, s.username)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-[#A8A29E] hover:text-red-400 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#78716C]">Роль:</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>

                    {s.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#78716C]">Телефон:</span>
                        <a href={`tel:${s.phone}`} className="text-[#D4AF37] font-mono hover:underline">
                          {s.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[#78716C]">Статус:</span>
                      <span className={`flex items-center gap-1 text-[11px] ${s.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {s.isActive ? 'Активен' : 'Отключен'}
                      </span>
                    </div>
                  </div>

                  {/* Performance Badges */}
                  <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-[#78716C] block">Всего заявок</span>
                      <strong className="text-white font-bold">{s.ordersCount}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-400 block">Оплачено / Доставлено</span>
                      <strong className="text-emerald-300 font-bold">{s.paidCount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PAYROLL & SALARY STATEMENT */}
      {subTab === 'payroll' && (
        <div className="space-y-6">
          {/* Calculation Parameters Box */}
          <div className="p-6 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Параметры и ставки расчета заработной платы
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {/* Month Selector */}
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Расчетный период:
                </label>
                <select
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="all">Весь период (All Time)</option>
                  <option value={new Date().toISOString().slice(0, 7)}>
                    Текущий месяц ({new Date().toISOString().slice(0, 7)})
                  </option>
                  <option value={new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 7)}>
                    Прошлый месяц ({new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 7)})
                  </option>
                </select>
              </div>

              {/* Commission Type */}
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  База начисления комиссии:
                </label>
                <select
                  value={commissionType}
                  onChange={(e) => {
                    const ct = e.target.value as any;
                    setCommissionType(ct);
                    if (ct === 'margin') setCommissionRate(15.0);
                    else setCommissionRate(3.0);
                  }}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="revenue">% от Выручки (Оборота)</option>
                  <option value="margin">% от Чистой Маржи (Прибыли)</option>
                </select>
              </div>

              {/* Commission Rate */}
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Ставка комиссии (%):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Base Salary */}
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  Базовый оклад (сум UZS):
                </label>
                <input
                  type="number"
                  step="100000"
                  value={baseSalaryUZS}
                  onChange={(e) => setBaseSalaryUZS(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* KPI Bonus */}
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1 font-semibold">
                  KPI Премия (за 10+ заказов):
                </label>
                <input
                  type="number"
                  step="100000"
                  value={kpiBonusUZS}
                  onChange={(e) => setKpiBonusUZS(Number(e.target.value))}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Macro Payroll Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-1">
              <span className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider">
                Закрытых заказов в периоде
              </span>
              <div className="text-2xl font-bold text-white font-serif">
                {payrollReport?.totalPaidOrders || 0} шт.
              </div>
              <p className="text-[11px] text-[#78716C]">Менеджеров в расчете: {payrollReport?.totalStaffCount || 0}</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-1">
              <span className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider">
                Совокупный оборот команды
              </span>
              <div className="text-2xl font-bold text-[#D4AF37] font-serif">
                {(payrollReport?.totalRevenueUZS || 0).toLocaleString()} сум
              </div>
              <p className="text-[11px] text-[#78716C]">Выручка по закрытым сделкам</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-1">
              <span className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider">
                Совокупная маржа команды
              </span>
              <div className="text-2xl font-bold text-emerald-400 font-serif">
                {(payrollReport?.totalMarginUZS || 0).toLocaleString()} сум
              </div>
              <p className="text-[11px] text-emerald-500/80">Валовая прибыль бизнеса</p>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-tr from-[#D4AF37]/20 to-[#1C1A18] border border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider">
                ИТОГО ФОТ К ВЫПЛАТЕ:
              </span>
              <div className="text-2xl font-bold text-white font-serif">
                {(payrollReport?.totalPayoutUZS || 0).toLocaleString()} сум
              </div>
              <p className="text-[11px] text-[#C4BDB5]">Оклады + Проценты + Премии</p>
            </div>
          </div>

          {/* Payroll Statement Table */}
          <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-[#161514] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Сводная ведомость начислений по сотрудникам
                </h3>
                <p className="text-xs text-[#A8A29E]">
                  Период: {payrollMonth === 'all' ? 'Все время' : payrollMonth} • База: {commissionType === 'margin' ? 'От маржи' : 'От выручки'} ({commissionRate}%)
                </p>
              </div>

              <button
                onClick={handleExportPayrollCSV}
                disabled={isExportingPayroll}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Выгрузить CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141312] border-b border-white/10 text-[#A8A29E] uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Сотрудник</th>
                    <th className="py-3 px-3 text-center">Заказов</th>
                    <th className="py-3 px-3">Оборот продаж</th>
                    <th className="py-3 px-3">Маржа</th>
                    <th className="py-3 px-3">Оклад</th>
                    <th className="py-3 px-3">Комиссия ({commissionRate}%)</th>
                    <th className="py-3 px-3">KPI Премия</th>
                    <th className="py-3 px-3">ИТОГО К ВЫПЛАТЕ</th>
                    <th className="py-3 px-4 text-right">Расчетный лист</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(payrollReport?.staffPayrolls || []).map((s) => (
                    <tr key={s.username} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{s.displayName}</div>
                        <div className="text-[11px] text-[#A8A29E] flex items-center gap-1.5">
                          <span>@{s.username}</span>
                          <span>•</span>
                          <span className="capitalize">{s.role}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 font-mono font-bold text-white">
                          {s.paidCount} / {s.ordersCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-white font-mono">
                        {s.totalRevenueUZS.toLocaleString()} сум
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-emerald-400 font-mono">
                        {s.totalMarginUZS.toLocaleString()} сум
                      </td>

                      <td className="py-3.5 px-3 text-[#A8A29E] font-mono">
                        {s.baseSalaryUZS.toLocaleString()} сум
                      </td>

                      <td className="py-3.5 px-3 font-bold text-green-400 font-mono">
                        +{s.commissionEarnedUZS.toLocaleString()} сум
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-[#D4AF37] font-mono">
                        {s.kpiBonusUZS > 0 ? `+${s.kpiBonusUZS.toLocaleString()} сум` : '—'}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-sm font-bold text-white font-serif block">
                          {s.totalPayoutUZS.toLocaleString()} сум
                        </span>
                        <span className="text-[10px] text-[#78716C] font-mono">
                          ≈ ₩ {s.totalPayoutKRW.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayslipStaff(s);
                            setIsPayslipOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#C49E30] text-[#141312] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Листок PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!payrollReport?.staffPayrolls || payrollReport.staffPayrolls.length === 0) && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-[#78716C]">
                        Нет данных о сотрудниках в выбранном периоде
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">
                  {editingStaff ? 'Редактировать сотрудника' : 'Новый сотрудник'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#A8A29E] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Имя сотрудника (Display Name):</label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="Например: Дильноза Каримова"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Логин в системе (Username):</label>
                <input
                  type="text"
                  disabled={editingStaff !== null}
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="dilnoza_sales"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">
                  Пароль {editingStaff && '(оставьте пустым, если не меняете)'}:
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Телефон / WhatsApp:</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Роль в CRM:</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="manager">🛍 Продавец-консультант (Manager)</option>
                  <option value="logistics">✈️ Логист / Склад (Logistics)</option>
                  <option value="admin">👑 Администратор (Admin)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37] rounded"
                />
                <label htmlFor="isActiveCheck" className="text-white cursor-pointer select-none">
                  Активный аккаунт (разрешен вход в CRM)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="py-2 px-4 rounded-xl border border-white/10 text-xs text-[#A8A29E] hover:bg-white/5"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveStaff}
                disabled={isSaving}
                className="py-2 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      <StaffPayslipModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        staff={selectedPayslipStaff}
        month={payrollMonth}
      />
    </div>
  );
};
