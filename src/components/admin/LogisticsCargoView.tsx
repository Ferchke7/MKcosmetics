import React, { useState, useEffect } from 'react';
import {
  Plane,
  Plus,
  Truck,
  Package,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRight,
  FileText,
  SlidersHorizontal,
  X,
  Layers,
} from 'lucide-react';
import { adminService, CargoBatch, Order } from '../../services/admin/adminService';

interface LogisticsCargoViewProps {
  token: string;
}

export const LogisticsCargoView: React.FC<LogisticsCargoViewProps> = ({ token }) => {
  const [batches, setBatches] = useState<CargoBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<CargoBatch | null>(null);
  const [batchOrders, setBatchOrders] = useState<Order[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<CargoBatch | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formOrigin, setFormOrigin] = useState('Seoul (ICN)');
  const [formDestination, setFormDestination] = useState('Tashkent (TAS)');
  const [formAwb, setFormAwb] = useState('');
  const [formCarrier, setFormCarrier] = useState('Asiana Cargo');
  const [formWeight, setFormWeight] = useState<number>(0);
  const [formRate, setFormRate] = useState<number>(0);
  const [formDepDate, setFormDepDate] = useState('');
  const [formArrDate, setFormArrDate] = useState('');
  const [formStatus, setFormStatus] = useState<CargoBatch['status']>('draft');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const list = await adminService.getCargoBatches(token);
      setBatches(list);
    } catch (err) {
      console.error('Failed to load cargo batches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setFormTitle(`Рейс Сеул ➔ Ташкент #${batches.length + 1}`);
    setFormOrigin('Seoul (ICN)');
    setFormDestination('Tashkent (TAS)');
    setFormAwb('');
    setFormCarrier('Asiana Air Cargo');
    setFormWeight(0);
    setFormRate(9.5);
    setFormDepDate(new Date().toISOString().split('T')[0]);
    setFormArrDate(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
    setFormStatus('draft');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: CargoBatch) => {
    setEditingBatch(b);
    setFormTitle(b.title);
    setFormOrigin(b.origin);
    setFormDestination(b.destination);
    setFormAwb(b.awbNumber);
    setFormCarrier(b.carrier);
    setFormWeight(b.weightKg);
    setFormRate(b.ratePerKg);
    setFormDepDate(b.departureDate);
    setFormArrDate(b.arrivalDate);
    setFormStatus(b.status);
    setFormNotes(b.notes);
    setIsModalOpen(true);
  };

  const handleSaveBatch = async () => {
    setIsSaving(true);
    try {
      if (editingBatch) {
        await adminService.updateCargoBatch(
          editingBatch.id,
          {
            title: formTitle,
            origin: formOrigin,
            destination: formDestination,
            awbNumber: formAwb,
            carrier: formCarrier,
            weightKg: Number(formWeight),
            ratePerKg: Number(formRate),
            departureDate: formDepDate,
            arrivalDate: formArrDate,
            status: formStatus,
            notes: formNotes,
          },
          token
        );
      } else {
        await adminService.createCargoBatch(
          {
            title: formTitle,
            origin: formOrigin,
            destination: formDestination,
            awbNumber: formAwb,
            carrier: formCarrier,
            weightKg: Number(formWeight),
            ratePerKg: Number(formRate),
            departureDate: formDepDate,
            arrivalDate: formArrDate,
            status: formStatus,
            notes: formNotes,
          },
          token
        );
      }
      setIsModalOpen(false);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения партии');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!confirm('Удалить эту карго-партию?')) return;
    try {
      await adminService.deleteCargoBatch(id, token);
      await fetchBatches();
      if (selectedBatch?.id === id) setSelectedBatch(null);
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления партии');
    }
  };

  const handleViewBatchDetails = async (b: CargoBatch) => {
    setSelectedBatch(b);
    setIsLoadingDetails(true);
    try {
      const data = await adminService.getCargoBatchById(b.id, token);
      setBatchOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const statusBadges: Record<CargoBatch['status'], { label: string; color: string }> = {
    draft: { label: '📦 Формируется в Сеуле', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    in_transit: { label: '✈️ Вылетел / В пути', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    customs: { label: '🛃 Таможенное оформление', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    arrived: { label: '🏢 Прибыл на склад выдачи', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    completed: { label: '✅ Партия полностью роздана', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.awbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
              Карго & Авиа-Логистика из Кореи
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Seoul Flight Hub
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Управление авиа-рейсами, накладными AWB, партиями посылок и групповым трекингом
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBatches}
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
            <span>Создать партию Карго</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-bold block mb-1">Всего партий</span>
            <span className="text-2xl font-bold text-white font-serif">{batches.length}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-bold block mb-1">В пути / Авиа</span>
            <span className="text-2xl font-bold text-blue-400 font-serif">
              {batches.filter((b) => b.status === 'in_transit' || b.status === 'customs').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-bold block mb-1">Общий вес партий</span>
            <span className="text-2xl font-bold text-[#D4AF37] font-serif">
              {batches.reduce((acc, b) => acc + (b.weightKg || 0), 0).toFixed(1)} <span className="text-xs font-normal text-[#A8A29E]">кг</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Package className="w-5 h-5" />
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
          placeholder="Поиск по названию рейса, коду партии (MK-CARGO-...), накладной AWB или городу..."
          className="w-full bg-[#1C1A18] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      {/* Batches Table */}
      <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-[#A8A29E] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span className="text-xs">Загрузка карго-партий...</span>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-12 text-center text-[#78716C] space-y-2">
            <Plane className="w-8 h-8 mx-auto text-[#78716C] opacity-40" />
            <p className="text-sm font-medium text-white">Партии карго не найдены</p>
            <p className="text-xs text-[#78716C]">
              Создайте первую авиа-партию для группировки клиентских посылок и контроля логистики из Кореи.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredBatches.map((b) => {
              const st = statusBadges[b.status] || statusBadges.draft;
              return (
                <div key={b.id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                          {b.batchCode}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${st.color}`}>
                          {st.label}
                        </span>
                        {b.awbNumber && (
                          <span className="text-xs font-mono text-[#D4AF37] px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                            AWB: {b.awbNumber}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">{b.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#A8A29E]">
                        <div className="flex items-center gap-1.5 text-white">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{b.origin}</span>
                          <ArrowRight className="w-3 h-3 text-[#78716C]" />
                          <span>{b.destination}</span>
                        </div>

                        {b.weightKg > 0 && (
                          <div>
                            Вес: <strong className="text-white">{b.weightKg} кг</strong>
                          </div>
                        )}

                        {b.departureDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#78716C]" />
                            <span>Вылет: {b.departureDate}</span>
                          </div>
                        )}

                        {b.arrivalDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Прибытие: {b.arrivalDate}</span>
                          </div>
                        )}
                      </div>

                      {b.notes && (
                        <p className="text-xs text-[#78716C] italic">{b.notes}</p>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewBatchDetails(b)}
                        className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#C4BDB5] hover:text-white border border-white/5 flex items-center gap-1.5 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Заказы в партии ({b.orderCount || 0})</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#C4BDB5] hover:text-white border border-white/5 transition-colors"
                        title="Редактировать партию"
                      >
                        <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                      </button>

                      <button
                        onClick={() => handleDeleteBatch(b.id)}
                        className="p-2 rounded-xl text-[#78716C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Удалить партию"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Cargo Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Plane className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">
                  {editingBatch ? 'Редактировать партию Карго' : 'Новая партия Карго'}
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
                <label className="block text-[#A8A29E] mb-1 font-semibold">Название рейса / Партии:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Пункт отправки:</label>
                  <input
                    type="text"
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Пункт назначения:</label>
                  <input
                    type="text"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Номер накладной (AWB):</label>
                  <input
                    type="text"
                    value={formAwb}
                    onChange={(e) => setFormAwb(e.target.value)}
                    placeholder="e.g. AWB-9821873"
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Карго компания:</label>
                  <input
                    type="text"
                    value={formCarrier}
                    onChange={(e) => setFormCarrier(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Вес партии (кг):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Тариф ($/кг):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Дата вылета:</label>
                  <input
                    type="date"
                    value={formDepDate}
                    onChange={(e) => setFormDepDate(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Дата прибытия:</label>
                  <input
                    type="date"
                    value={formArrDate}
                    onChange={(e) => setFormArrDate(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Статус партии:</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="draft">📦 Формируется на складе в Сеуле (Draft)</option>
                  <option value="in_transit">✈️ Вылетел / В пути (In Transit)</option>
                  <option value="customs">🛃 Таможенное оформление (Customs)</option>
                  <option value="arrived">🏢 Прибыл на склад выдачи (Arrived)</option>
                  <option value="completed">✅ Партия полностью роздана (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Заметки / Логистика:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Особенности рейса, контакты представителя в аэропорту..."
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
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
                onClick={handleSaveBatch}
                disabled={isSaving}
                className="py-2 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить партию'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Orders Detail Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedBatch.title}</h3>
                  <span className="text-[11px] font-mono text-[#A8A29E]">{selectedBatch.batchCode}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-[#A8A29E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoadingDetails ? (
                <div className="p-8 text-center text-[#A8A29E]">Загрузка заказов партии...</div>
              ) : batchOrders.length === 0 ? (
                <div className="p-8 text-center text-[#78716C] space-y-1">
                  <p className="text-xs text-white">В эту партию пока не привязаны заказы</p>
                  <p className="text-[11px] text-[#78716C]">
                    Вы можете привязать заказы в модальном окне «Обработать заказ & Чек» в разделе Заказов.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {batchOrders.map((o) => (
                    <div key={o.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{o.orderNumber}</span>
                          <span className="text-[#A8A29E] font-normal">({o.customerName})</span>
                        </div>
                        <div className="text-[11px] text-[#78716C]">{o.shippingAddress || 'Адрес не указан'}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#D4AF37]">₩ {o.totalAmount.toLocaleString()}</span>
                        <span className="block text-[10px] text-emerald-400 capitalize">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-white/10 pt-3 flex-shrink-0">
              <button
                onClick={() => setSelectedBatch(null)}
                className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
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
