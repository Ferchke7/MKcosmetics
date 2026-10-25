import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalogApi';
import { formatKrw } from '../ui/Price';
import { CatalogProduct } from '../../core/types/catalog';
import {
  RefreshCw,
  Search,
  ExternalLink,
  Check,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  FileSpreadsheet,
  UploadCloud,
  FileUp,
  Clock,
  Image as ImageIcon,
  CheckCheck,
} from 'lucide-react';

interface CatalogSyncViewProps {
  token: string;
}

export const CatalogSyncView: React.FC<CatalogSyncViewProps> = ({ token }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [editingBrandVal, setEditingBrandVal] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status query
  const { data: statusData, isLoading: isStatusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['admin', 'catalog', 'status'],
    queryFn: () => catalogApi.adminGetStatus(token),
    staleTime: 30 * 1000,
  });

  // Products query
  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['admin', 'catalog', 'products', searchQuery],
    queryFn: () => catalogApi.adminGetProducts(token, searchQuery, 1, 100),
    staleTime: 10 * 1000,
  });

  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<any | null>(null);
  const [isPollingImport, setIsPollingImport] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 1. Direct Client-Side Sync Mutation (Bypasses server datacenter IP blocks completely!)
  const directSyncMutation = useMutation({
    mutationFn: () => catalogApi.adminDirectSync(token, (msg) => setSyncProgress(msg)),
    onSuccess: (res: any) => {
      setSyncProgress(null);
      setFeedbackMsg({
        type: 'success',
        text: `Прямая онлайн-синхронизация завершена! Обработано ${res?.total || 0} товаров (Добавлено: ${res?.added || 0}, Обновлено: ${res?.updated || 0}).`,
      });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] });
      setTimeout(() => setFeedbackMsg(null), 8000);
    },
    onError: (err: any) => {
      setSyncProgress(null);
      setFeedbackMsg({
        type: 'error',
        text: `Ошибка прямой синхронизации: ${err.message || 'Сбой соединения'}`,
      });
      setTimeout(() => setFeedbackMsg(null), 6000);
    },
  });

  // 2. Server Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => catalogApi.adminSync(token),
    onSuccess: (res) => {
      const msg = res?.async
        ? 'Синхронизация с b-catalog успешно запущена в фоновом режиме на сервере!'
        : `Серверная синхронизация завершена: ${res?.total || res?.totalProcessed || 0} товаров (Добавлено: ${res?.added || res?.created || 0}, Обновлено: ${res?.updated || 0}).`;

      setFeedbackMsg({
        type: 'success',
        text: msg,
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['catalog'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] });
      }, 2500);

      setTimeout(() => setFeedbackMsg(null), 8000);
    },
    onError: (err: any) => {
      setFeedbackMsg({
        type: 'error',
        text: `Ошибка серверной синхронизации: ${err.message || 'Сбой соединения'}`,
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    },
  });

  // 3. Excel Import Mutation with Async Background Job & Polling
  const excelImportMutation = useMutation({
    mutationFn: (file: File) => catalogApi.adminImportExcel(token, file),
    onSuccess: (res: any) => {
      setSelectedFile(null);
      setElapsedSeconds(0);
      setImportStatus(res);
      setIsPollingImport(true);
      setFeedbackMsg({
        type: 'success',
        text: `Файл успешно загружен! Распознано ${res.totalParsed || ''} товаров. Идёт параллельный HD-апскейлинг фото и запись в базу...`,
      });
    },
    onError: (err: any) => {
      setIsPollingImport(false);
      setFeedbackMsg({
        type: 'error',
        text: `Ошибка отправки файла Excel: ${err.message || 'Сбой соединения'}`,
      });
      setTimeout(() => setFeedbackMsg(null), 8000);
    },
  });

  // 4. Toggle Override Mutation
  const updateOverrideMutation = useMutation({
    mutationFn: ({ id, overrides }: { id: number; overrides: any }) =>
      catalogApi.adminUpdateOverrides(id, overrides, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
    onError: (err: any) => {
      alert(`Ошибка обновления: ${err.message}`);
    },
  });

  // 5. Effects declared AFTER all mutations are fully initialized
  useEffect(() => {
    let interval: any;
    if (isPollingImport) {
      interval = setInterval(async () => {
        try {
          const st = await catalogApi.adminGetImportStatus(token);
          setImportStatus(st);
          if (!st.isRunning) {
            setIsPollingImport(false);
            if (st.stage === 'done') {
              setFeedbackMsg({
                type: 'success',
                text: st.message || `Импорт завершён! Добавлено: ${st.added}, Обновлено: ${st.updated}, Фото HD: ${st.withPhotos}`,
              });
              queryClient.invalidateQueries({ queryKey: ['catalog'] });
              queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] });
            } else if (st.stage === 'error') {
              setFeedbackMsg({
                type: 'error',
                text: `Ошибка импорта: ${st.error || 'Сбой обработки'}`,
              });
            }
          }
        } catch (err: any) {
          console.error('Failed to poll import status:', err);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPollingImport, token, queryClient]);

  useEffect(() => {
    let interval: any;
    if (excelImportMutation.isPending || isPollingImport) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [excelImportMutation.isPending, isPollingImport]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
        setImportStatus(null);
      } else {
        alert('Пожалуйста, выберите файл таблицы Excel (.xls или .xlsx)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImportStatus(null);
    }
  };

  const handleToggleHit = (product: CatalogProduct) => {
    updateOverrideMutation.mutate({
      id: product.id,
      overrides: { isHit: !product.isHit },
    });
  };

  const handleToggleHidden = (product: CatalogProduct) => {
    updateOverrideMutation.mutate({
      id: product.id,
      overrides: { isHidden: !product.isHidden },
    });
  };

  const handleSaveBrand = (id: number) => {
    updateOverrideMutation.mutate({
      id,
      overrides: { brandOverride: editingBrandVal.trim() },
    });
    setEditingBrandId(null);
  };

  const productsList = productsData?.products || [];
  const totalInDb = statusData?.totalProducts || statusData?.total || 0;
  const hitsInDb = statusData?.totalHits || statusData?.hits || 0;
  const categoriesInDb = statusData?.totalCategories || 0;
  const lastSync = statusData?.lastSync;
  const syncLogs = statusData?.syncLogs || [];

  const isImportActive = excelImportMutation.isPending || isPollingImport || importStatus?.isRunning;
  const currentCount = importStatus?.current || 0;
  const totalParsed = importStatus?.totalParsed || 0;
  const progressPct = totalParsed > 0 ? Math.min(100, Math.round((currentCount / totalParsed) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Sync Trigger */}
      <div className="bg-[#181614] rounded-3xl border border-neutral-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-serif text-2xl font-bold text-white">
                Синхронизация каталога
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Прямая загрузка цен и остатков из <strong>b-catalog</strong> и обогащение полной базой из <strong>Excel</strong>. Все 995+ товаров остаются на витрине навсегда, даже если их нет на оперативном складе.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => directSyncMutation.mutate()}
              disabled={directSyncMutation.isPending || syncMutation.isPending || isImportActive}
              className="btn-gold px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 flex-shrink-0"
              title="Загрузка актуальных данных напрямую из b-catalog без зависимости от IP-адреса хостинга"
            >
              <RefreshCw className={`w-4 h-4 ${directSyncMutation.isPending ? 'animate-spin' : ''}`} />
              {directSyncMutation.isPending ? (syncProgress || 'Синхронизация...') : 'Синхронизировать онлайн'}
            </button>

            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || directSyncMutation.isPending || isImportActive}
              className="px-4 py-3 rounded-full border border-neutral-700 hover:border-neutral-500 text-xs uppercase tracking-wider font-medium text-neutral-300 hover:text-white bg-white/5 inline-flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0 transition-colors"
              title="Фоновая синхронизация силами сервера"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Серверный Sync
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-950/50 text-red-300 border border-red-500/30'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800">
          <div className="bg-[#12100E] p-4 rounded-2xl border border-neutral-800">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Товаров в витрине</span>
            <div className="font-mono text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              {totalInDb}
            </div>
          </div>

          <div className="bg-[#12100E] p-4 rounded-2xl border border-neutral-800">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Категорий</span>
            <div className="font-mono text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              {categoriesInDb || '—'}
            </div>
          </div>

          <div className="bg-[#12100E] p-4 rounded-2xl border border-neutral-800">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Хиты продаж</span>
            <div className="font-mono text-2xl font-bold text-amber-400 mt-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              {hitsInDb}
            </div>
          </div>

          <div className="bg-[#12100E] p-4 rounded-2xl border border-neutral-800">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Последняя синхронизация</span>
            <div className="text-xs font-mono text-neutral-300 mt-2 truncate">
              {lastSync?.finishedAt || lastSync?.at
                ? new Date(lastSync.finishedAt || lastSync.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                  ` (${lastSync.status || 'OK'})`
                : 'Не выполнялась'}
            </div>
          </div>
        </div>
      </div>

      {/* Excel Catalog Import Card with Real-time Progress & Worker Pool */}
      <div className="bg-[#181614] rounded-3xl border border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-white">
              Импорт полной базы из Excel (Бизнес.Ру / XLS)
            </h3>
            <p className="text-xs text-neutral-400">
              Загрузите файл <code className="bg-black/40 px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-300">.xls</code>. Сервер на Go извлечёт все товары и параллельно выполнит качественный HD-апскейлинг фото до 900px (Lanczos3 с контурной резкостью).
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-400/5'
              : 'border-neutral-700 hover:border-amber-400/50 bg-[#12100E]'
          }`}
        >
          <input
            type="file"
            id="excel-file-input"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1C1A18] p-4 rounded-xl border border-neutral-700">
              <div className="flex items-center gap-3 text-left">
                <FileSpreadsheet className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">{selectedFile.name}</p>
                  <p className="text-[11px] text-neutral-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} МБ • Файл готов к обработке
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isImportActive}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => excelImportMutation.mutate(selectedFile)}
                  disabled={isImportActive}
                  className="btn-gold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isImportActive ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Обработка ({elapsedSeconds}с)...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Запустить импорт в базу
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
            >
              <UploadCloud className="w-10 h-10 text-neutral-500 hover:text-amber-400 transition-colors" />
              <p className="text-xs font-medium text-neutral-200">
                Перетащите сюда файл Excel или <span className="text-amber-400 underline underline-offset-2">выберите на компьютере</span>
              </p>
              <p className="text-[11px] text-neutral-500">
                Поддерживаются экспорты Бизнес.Ру (.xls / .xlsx) размером до 100 МБ
              </p>
            </label>
          )}
        </div>

        {/* Live Process & Progress Bar during Async Import */}
        {isImportActive && (
          <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-amber-200 block">
                    {importStatus?.stage === 'saving'
                      ? 'Сохранение товаров в SQLite базу данных...'
                      : `Обработка и Lanczos3 HD-апскейлинг фото: ${currentCount} из ${totalParsed || '—'} товаров (${progressPct}%)`}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Многопоточный воркер Go обрабатывает каталог в фоновом режиме без блокировки сервера
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                ⏱️ {elapsedSeconds} сек
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-[#12100E] rounded-full h-2.5 overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, progressPct)}%` }}
              />
            </div>

            {/* Live Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#141210] border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Обработано строк</span>
                <span className="font-mono text-sm font-bold text-white">
                  {currentCount} / {totalParsed || '—'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141210] border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Прогресс</span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {progressPct}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141210] border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Фотографий HD</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {importStatus?.withPhotos || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141210] border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Стадия</span>
                <span className="font-mono text-xs font-bold text-sky-300">
                  {importStatus?.stage === 'saving' ? 'Запись в БД' : 'Lanczos3 фото'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Results Card when Complete */}
        {importStatus && importStatus.stage === 'done' && (
          <div className="mt-4 p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-white">
                    Отчёт об импорте каталога
                  </h4>
                  <p className="text-xs text-emerald-300/80">
                    {importStatus.message || 'Импорт каталога успешно завершён!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportStatus(null)}
                className="text-neutral-400 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors self-start sm:self-auto"
              >
                Закрыть отчёт ✕
              </button>
            </div>

            {/* 4 Metrics Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#141210] p-4 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Всего строк в Excel
                </span>
                <div className="font-mono text-2xl font-bold text-white mt-1">
                  {importStatus.totalParsed}
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">распознано товаров</span>
              </div>

              <div className="bg-[#141210] p-4 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider block">
                  Новых добавлено
                </span>
                <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                  +{importStatus.added}
                </div>
                <span className="text-[10px] text-emerald-500/70 mt-0.5 block">появились на витрине</span>
              </div>

              <div className="bg-[#141210] p-4 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] text-sky-400/80 uppercase tracking-wider block">
                  Обновлено в базе
                </span>
                <div className="font-mono text-2xl font-bold text-sky-300 mt-1">
                  {importStatus.updated}
                </div>
                <span className="text-[10px] text-sky-500/70 mt-0.5 block">обогащено фото/данными</span>
              </div>

              <div className="bg-[#141210] p-4 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] text-amber-400/80 uppercase tracking-wider block">
                  Фото HD (Lanczos3)
                </span>
                <div className="font-mono text-2xl font-bold text-amber-300 mt-1">
                  {importStatus.withPhotos}
                </div>
                <span className="text-[10px] text-amber-500/70 mt-0.5 block">проапскейлено до 900px</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-emerald-500/10">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Время выполнения: <strong className="text-white">{(importStatus.durationMs / 1000).toFixed(1)} сек</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Приоритет сохранён: <strong className="text-white">b-catalog &gt; Excel</strong></span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            Приоритет: <strong>b-catalog &gt; Excel</strong>. Все товары из Excel сохраняются в витрине и всегда доступны клиентам для заказа.
          </span>
        </div>
      </div>

      {/* Sync History Logs */}
      {syncLogs && syncLogs.length > 0 && (
        <div className="bg-[#181614] rounded-3xl border border-neutral-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Журнал последних синхронизаций
            </h4>
            <span className="text-[11px] text-neutral-500">История автоматических и ручных обновлений</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Дата / Время</th>
                  <th className="py-2.5 px-3">Статус</th>
                  <th className="py-2.5 px-3">Добавлено</th>
                  <th className="py-2.5 px-3">Обновлено</th>
                  <th className="py-2.5 px-3">Всего в базе</th>
                  <th className="py-2.5 px-3 text-right">Время обработки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {syncLogs.slice(0, 5).map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02] text-neutral-300">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                      {new Date(log.at || log.created_at || Date.now()).toLocaleString('ru-RU')}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.error ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          Ошибка
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Успешно
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">
                      +{log.added || 0}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">
                      {log.updated || 0}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-200">
                      {log.total || (log.added + log.updated) || 0} тов.
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-neutral-400 text-[11px]">
                      {log.durationMs ? `${(log.durationMs / 1000).toFixed(2)} с` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overrides & Products Grid */}
      <div className="bg-[#181614] rounded-3xl border border-neutral-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Управление витриной и товарами
            </h3>
            <p className="text-xs text-neutral-400">
              Быстрое включение меток «ХИТ», скрытие товаров с витрины и корректировка бренда
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или коду..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#12100E] border border-neutral-700 rounded-full focus:outline-none focus:border-amber-400 text-white placeholder-neutral-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-3">Фото</th>
                <th className="py-3 px-3">Товар / Код</th>
                <th className="py-3 px-3">Бренд</th>
                <th className="py-3 px-3 text-right">Цена (KRW)</th>
                <th className="py-3 px-3 text-center">ХИТ</th>
                <th className="py-3 px-3 text-center">Витрина</th>
                <th className="py-3 px-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {isProductsLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    Загрузка списка товаров...
                  </td>
                </tr>
              ) : productsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                productsList.map((p: CatalogProduct) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      p.isHidden ? 'opacity-40 bg-neutral-900/30' : ''
                    }`}
                  >
                    {/* Photo */}
                    <td className="py-2.5 px-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {p.photos && p.photos.length > 0 && p.photos[0].w150 ? (
                          <img
                            src={p.photos[0].w150 || p.photos[0].full}
                            alt={p.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : p.images && p.images.length > 0 ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-neutral-600" />
                        )}
                      </div>
                    </td>

                    {/* Title / Code */}
                    <td className="py-2.5 px-3 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-white line-clamp-2" title={p.title}>
                        {p.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                        {p.code && <span>Код: {p.code}</span>}
                        {p.categoryTitle && (
                          <span className="text-neutral-500">| {p.categoryTitle}</span>
                        )}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-2.5 px-3">
                      {editingBrandId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingBrandVal}
                            onChange={(e) => setEditingBrandVal(e.target.value)}
                            className="w-28 px-2 py-1 text-xs bg-neutral-900 border border-amber-400 rounded-lg text-white outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveBrand(p.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                            title="Сохранить"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingBrandId(p.id);
                            setEditingBrandVal(p.brandOverride || p.brand || '');
                          }}
                          className="text-neutral-300 hover:text-amber-400 text-left font-medium transition-colors"
                          title="Нажмите для изменения бренда"
                        >
                          {p.brandOverride || p.brand || '—'}
                          {p.brandOverride && (
                            <span className="ml-1 text-[9px] text-amber-400 font-normal">✎</span>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Price KRW */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {formatKrw(p.priceKrw)}
                    </td>

                    {/* Is Hit Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleHit(p)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          p.isHit
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                            : 'border-neutral-800 text-neutral-600 hover:text-neutral-400 hover:border-neutral-700'
                        }`}
                        title={p.isHit ? 'Снять метку ХИТ' : 'Сделать ХИТом'}
                      >
                        <Flame className={`w-4 h-4 ${p.isHit ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Is Hidden Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleHidden(p)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          p.isHidden
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                        title={p.isHidden ? 'Показать на витрине' : 'Скрыть с витрины'}
                      >
                        {p.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 inline-flex rounded-xl border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-400/40 transition-colors"
                        title="Открыть на сайте"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
