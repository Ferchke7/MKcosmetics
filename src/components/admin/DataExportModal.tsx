import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Filter,
  X,
  Copy,
  Check,
  Loader2,
  Table,
} from 'lucide-react';
import { adminService, Order } from '../../services/admin/adminService';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  orders: Order[];
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  token,
  orders,
}) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadXlsx = () => {
    const url = `/api/admin/orders/export/xlsx${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleDownloadCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await adminService.exportOrdersCsv(statusFilter === 'all' ? '' : statusFilter, '', token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mk_cosmetics_orders_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJson = () => {
    const filtered = orders.filter((o) => statusFilter === 'all' || o.status === statusFilter);
    const jsonStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mk_cosmetics_orders_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopyJson = () => {
    const filtered = orders.filter((o) => statusFilter === 'all' || o.status === statusFilter);
    navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCount = orders.filter((o) => statusFilter === 'all' || o.status === statusFilter).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1C1A18] text-[#EDE8E1] border border-amber-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Экспорт Реестра Заказов</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Format Selection */}
          <div>
            <label className="block text-neutral-400 mb-2 font-semibold">Формат выгрузки:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  format === 'xlsx'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${format === 'xlsx' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <div className="font-bold text-xs">Excel (.xlsx)</div>
                <div className="text-[10px] text-neutral-500">Фирменный стиль</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  format === 'csv'
                    ? 'bg-amber-500/20 border-amber-500/40 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Table className={`w-5 h-5 ${format === 'csv' ? 'text-amber-400' : 'text-neutral-500'}`} />
                <div className="font-bold text-xs">CSV Таблица</div>
                <div className="text-[10px] text-neutral-500">Для 1С и таблиц</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  format === 'json'
                    ? 'bg-sky-500/20 border-sky-500/40 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <FileCode className={`w-5 h-5 ${format === 'json' ? 'text-sky-400' : 'text-neutral-500'}`} />
                <div className="font-bold text-xs">JSON API</div>
                <div className="text-[10px] text-neutral-500">Для интеграций</div>
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-neutral-400 mb-1 font-semibold">Фильтр по статусу заказов:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#141312] border border-amber-500/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Все статусы ({orders.length} заказов)</option>
              <option value="new">🟡 Только новые заявки</option>
              <option value="processing">🔵 В обработке</option>
              <option value="paid">🟣 Оплаченные (с чеками)</option>
              <option value="shipped">🚚 Отправленные из Кореи</option>
              <option value="delivered">🟢 Доставленные клиентам</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Будет выгружено:</span>
            <strong className="text-amber-400">{filteredCount} заказов</strong>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/10">
          {format === 'json' && (
            <button
              onClick={handleCopyJson}
              className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать JSON'}</span>
            </button>
          )}

          <button
            onClick={
              format === 'xlsx'
                ? handleDownloadXlsx
                : format === 'csv'
                ? handleDownloadCsv
                : handleDownloadJson
            }
            disabled={isExporting}
            className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Скачать {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
