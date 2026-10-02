import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, ShoppingCart, DollarSign, Phone, Send, 
  MapPin, Calendar, FileSpreadsheet, Eye, Edit3, Trash2, 
  CheckCircle2, X, Plus, Clock, MessageSquare 
} from 'lucide-react';
import { UnifiedDataGrid, Column, BulkAction } from './UnifiedDataGrid';

export interface CustomerData {
  id: number;
  name: string;
  phone: string;
  email: string;
  telegramUsername: string;
  city: string;
  deliveryAddress: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: string;
  segment: 'vip' | 'regular' | 'new' | 'inactive' | string;
  notes: string;
  createdAt: string;
}

interface CRMStats {
  totalCustomers: number;
  vipCustomers: number;
  totalRevenue: number;
  averageLTV: number;
}

export const CustomerCRMView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [activeCustomer, setActiveCustomer] = useState<CustomerData | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('mk_admin_token') || '';
      const url = selectedSegment === 'all' 
        ? '/api/admin/customers?limit=200' 
        : `/api/admin/customers?limit=200&segment=${selectedSegment}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch CRM customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedSegment]);

  const handleExportXLSX = () => {
    const token = localStorage.getItem('mk_admin_token') || '';
    const url = `/api/admin/customers/export/xlsx${selectedSegment !== 'all' ? `?segment=${selectedSegment}` : ''}`;
    window.open(url, '_blank');
  };

  const handleSaveCustomerNotes = async () => {
    if (!activeCustomer) return;
    try {
      setSavingNotes(true);
      const token = localStorage.getItem('mk_admin_token') || '';
      const res = await fetch(`/api/admin/customers/${activeCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...activeCustomer,
          notes: editNotes,
        }),
      });

      if (res.ok) {
        setActiveCustomer({ ...activeCustomer, notes: editNotes });
        setCustomers((prev) =>
          prev.map((c) => (c.id === activeCustomer.id ? { ...c, notes: editNotes } : c))
        );
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(val)) + ' сум';
  };

  // Segment Badge Helper
  const renderSegmentBadge = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Crown className="w-3 h-3 text-amber-400" />
            VIP Клиент
          </span>
        );
      case 'regular':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Постоянный
          </span>
        );
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Новый
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400">
            {segment}
          </span>
        );
    }
  };

  // Table Columns
  const columns: Column<CustomerData>[] = [
    {
      key: 'name',
      header: 'Клиент',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-white flex items-center gap-2">
            <span>{item.name}</span>
            {item.segment === 'vip' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-neutral-500" />
            <span>{item.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'segment',
      header: 'Сегмент',
      sortable: true,
      render: (item) => renderSegmentBadge(item.segment),
    },
    {
      key: 'city',
      header: 'Город / Адрес',
      sortable: true,
      render: (item) => (
        <div className="text-xs">
          <div className="font-medium text-neutral-200 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400/80" />
            <span>{item.city || 'Ташкент'}</span>
          </div>
          {item.deliveryAddress && (
            <div className="text-neutral-500 truncate max-w-[180px]">{item.deliveryAddress}</div>
          )}
        </div>
      ),
    },
    {
      key: 'totalOrders',
      header: 'Заказов',
      sortable: true,
      align: 'center',
      render: (item) => (
        <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-[#1F1C1A] border border-amber-500/10">
          {item.totalOrders} шт.
        </span>
      ),
    },
    {
      key: 'totalSpent',
      header: 'LTV Выручка',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-bold text-emerald-400">
          {formatMoney(item.totalSpent)}
        </span>
      ),
    },
    {
      key: 'averageOrderValue',
      header: 'Средний чек',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-neutral-300 text-xs">
          {formatMoney(item.averageOrderValue)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => {
              setActiveCustomer(item);
              setEditNotes(item.notes || '');
            }}
            className="p-1.5 rounded-lg bg-[#1F1C1A] hover:bg-amber-500/20 text-neutral-400 hover:text-amber-400 border border-amber-500/10 transition-all"
            title="Профиль клиента"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.phone && (
            <a
              href={`https://t.me/+${item.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-[#1F1C1A] hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all"
              title="Написать в Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top CRM Macro KPI Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181614] to-[#12110F] border border-amber-500/20 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Всего Клиентов CRM</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats.totalCustomers} чел.</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181614] to-[#12110F] border border-amber-500/20 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">VIP Клиенты</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.vipCustomers} чел.</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181614] to-[#12110F] border border-amber-500/20 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Общий LTV Оборот</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{formatMoney(stats.totalRevenue)}</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181614] to-[#12110F] border border-amber-500/20 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Средний чек LTV</p>
              <h3 className="text-2xl font-black text-white mt-1">{formatMoney(stats.averageLTV)}</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Unified DataGrid for CRM */}
      <UnifiedDataGrid
        data={customers}
        columns={columns}
        keyExtractor={(item) => item.id}
        title="CRM Клиентская База"
        subtitle="Автоматическая синхронизация при создании заказов и расчет Lifetime Value (LTV)"
        searchPlaceholder="Поиск по ФИО, телефону, городу..."
        searchFields={['name', 'phone', 'city', 'telegramUsername']}
        loading={loading}
        onRefresh={fetchCustomers}
        onExportXLSX={handleExportXLSX}
        filterSlot={
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="bg-[#1C1A18] border border-amber-500/20 text-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="all">Все сегменты</option>
              <option value="vip">VIP клиенты</option>
              <option value="regular">Постоянные</option>
              <option value="new">Новые</option>
            </select>
          </div>
        }
      />

      {/* Customer 360 Drawer Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#151311] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-neutral-200">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-[#1B1816] border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeCustomer.name}
                    {renderSegmentBadge(activeCustomer.segment)}
                  </h3>
                  <p className="text-xs text-neutral-400">Профиль клиента CRM • ID #{activeCustomer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
                className="p-2 rounded-xl bg-[#25221F] hover:bg-[#302C28] text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/10 text-center">
                  <p className="text-[11px] text-neutral-400 uppercase">Всего Заказов</p>
                  <p className="text-xl font-bold text-white mt-1">{activeCustomer.totalOrders} шт.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/10 text-center">
                  <p className="text-[11px] text-neutral-400 uppercase">Сумма LTV</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{formatMoney(activeCustomer.totalSpent)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/10 text-center">
                  <p className="text-[11px] text-neutral-400 uppercase">Средний чек</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">{formatMoney(activeCustomer.averageOrderValue)}</p>
                </div>
              </div>

              {/* Contact Information & Channels */}
              <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/10 space-y-3">
                <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">Контакты и Доставка</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-500 text-xs">Телефон:</span>
                    <p className="font-semibold text-white">{activeCustomer.phone || 'Не указан'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-xs">Город:</span>
                    <p className="font-semibold text-white">{activeCustomer.city || 'Ташкент'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-neutral-500 text-xs">Адрес доставки:</span>
                    <p className="text-neutral-300">{activeCustomer.deliveryAddress || 'Не указан'}</p>
                  </div>
                </div>

                {/* Direct Messaging */}
                <div className="pt-2 flex items-center gap-2">
                  {activeCustomer.phone && (
                    <a
                      href={`https://t.me/+${activeCustomer.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Открыть в Telegram</span>
                    </a>
                  )}
                  {activeCustomer.phone && (
                    <a
                      href={`tel:${activeCustomer.phone}`}
                      className="py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Позвонить</span>
                    </a>
                  )}
                </div>
              </div>

              {/* CRM Manager Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Заметки менеджера по клиенту</span>
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Предпочтения по брендам (Round Lab, Anua), аллергии, тип кожи..."
                  className="w-full p-3 bg-[#1C1A18] border border-amber-500/20 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSaveCustomerNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  {savingNotes ? 'Сохранение...' : 'Сохранить заметку'}
                </button>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-[#1B1816] border-t border-amber-500/20 flex justify-end">
              <button
                onClick={() => setActiveCustomer(null)}
                className="px-4 py-2 bg-[#25221F] hover:bg-[#302C28] text-white font-medium text-xs rounded-xl transition-all"
              >
                Закрыть
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
