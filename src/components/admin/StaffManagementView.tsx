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
} from 'lucide-react';
import { adminService, StaffMember } from '../../services/admin/adminService';

interface StaffManagementViewProps {
  token: string;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({ token }) => {
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

  useEffect(() => {
    fetchStaff();
  }, [token]);

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
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления');
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
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
              Управление продавцами и командой
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Staff & CRM Roles
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Учетные записи менеджеров, роли доступа, назначение на заказы и показатели эффективности KPI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaff}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить сотрудника</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-bold block mb-1">Всего сотрудников</span>
            <span className="text-2xl font-bold text-white font-serif">{staff.length}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-bold block mb-1">Продавцы / Менеджеры</span>
            <span className="text-2xl font-bold text-blue-400 font-serif">
              {staff.filter((s) => s.role === 'manager').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-bold block mb-1">Логистика & Карго</span>
            <span className="text-2xl font-bold text-purple-400 font-serif">
              {staff.filter((s) => s.role === 'logistics').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени сотрудника, логину или номеру телефона..."
          className="w-full bg-[#1C1A18] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      {/* Staff List Table */}
      <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-[#A8A29E] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span className="text-xs">Загрузка команды...</span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-[#78716C]">Сотрудники не найдены</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredStaff.map((s) => {
              const r = roleLabels[s.role] || roleLabels.manager;
              return (
                <div key={s.id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                        {s.displayName?.charAt(0).toUpperCase() || s.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{s.displayName || s.username}</h3>
                          <span className="text-xs font-mono text-[#78716C]">(@{s.username})</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${r.color}`}>
                            {r.label}
                          </span>
                          {!s.isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                              Отключен
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#A8A29E]">
                          {s.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{s.phone}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <span>Заказов в работе:</span>
                            <strong className="text-white">{s.ordersCount}</strong>
                          </div>

                          <div className="flex items-center gap-1">
                            <span>Оплаченных чеков:</span>
                            <strong className="text-emerald-400">{s.paidCount}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#C4BDB5] hover:text-white border border-white/5 transition-colors"
                        title="Редактировать сотрудника"
                      >
                        <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                      </button>

                      {s.username !== 'admin' && (
                        <button
                          onClick={() => handleDeleteStaff(s.id, s.username)}
                          className="p-2 rounded-xl text-[#78716C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Удалить сотрудника"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">
                  {editingStaff ? 'Редактировать сотрудника' : 'Новый сотрудник CRM'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-[#A8A29E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Имя и фамилия (Display Name):</label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="e.g. Шахноза (Менеджер продаж)"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Логин (Username):</label>
                <input
                  type="text"
                  value={formUsername}
                  disabled={!!editingStaff}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. shakhnoza"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Телефон / WhatsApp:</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+998 90 123-45-67"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">
                  {editingStaff ? 'Новый пароль (оставьте пустым, чтобы не менять):' : 'Пароль для входа:'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Минимум 4 символа"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Роль в CRM:</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="manager">🛍 Продавец-консультант (Заказы & Чеки)</option>
                  <option value="logistics">✈️ Логист / Склад (Карго & Доставка)</option>
                  <option value="admin">👑 Суперадмин (Полный доступ & Аналитика)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-white/10 bg-[#141312] text-[#D4AF37] focus:ring-0"
                />
                <label htmlFor="isActive" className="text-white text-xs font-medium cursor-pointer">
                  Учетная запись активна (разрешен вход в CRM)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
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
    </div>
  );
};
