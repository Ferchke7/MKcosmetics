import React, { useState } from 'react';
import { Send, Download, CheckCircle2, AlertCircle, RefreshCw, X, Sparkles, Database } from 'lucide-react';

interface TelegramDummyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TelegramDummyImportModal: React.FC<TelegramDummyImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    try {
      setLoading(true);
      setResult(null);

      const token = localStorage.getItem('mk_admin_token') || '';
      const res = await fetch('/api/admin/telegram/import-dummy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setResult({
          success: true,
          message: data.message || `Успешно импортировано ${data.count || 0} товаров из Telegram!`,
          count: data.count,
        });
        if (onSuccess) onSuccess();
      } else {
        setResult({
          success: false,
          message: data.error || 'Ошибка при синхронизации товаров из Telegram.',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Ошибка сети при обращении к серверу.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#151311] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-neutral-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1B1816] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold">
            <Send className="w-5 h-5" />
            <span>Импорт Товаров из Telegram</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#25221F] hover:bg-[#302C28] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Целевой Источник Каталога</span>
            </div>
            <p className="text-white font-bold text-base">Канал @mkcosmetkor</p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Парсер автоматически извлечет оригинальные названия корейских брендов, описания, цены (KRW, UZS, USD) и HD-фотографии напрямую в базу данных SQLite.
            </p>
          </div>

          {result && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border ${
                result.success
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-semibold text-white">{result.success ? 'Успешно!' : 'Внимание'}</p>
                <p className="mt-0.5 opacity-90">{result.message}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Импортируем и обрабатываем...' : 'Запустить импорт товаров'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#1B1816] border-t border-amber-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#25221F] hover:bg-[#302C28] text-white font-medium text-xs rounded-xl transition-all"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
