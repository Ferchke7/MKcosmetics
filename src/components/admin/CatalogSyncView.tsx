import React, { useState } from 'react';
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
  Boxes,
  Layers,
  Sparkles,
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

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => catalogApi.adminSync(token),
    onSuccess: (res) => {
      setFeedbackMsg({
        type: 'success',
        text: `Синхронизация завершена успешно! Обработано ${res?.totalProcessed || 0} товаров (Добавлено: ${res?.created || 0}, Обновлено: ${res?.updated || 0}).`,
      });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] });
      setTimeout(() => setFeedbackMsg(null), 5000);
    },
    onError: (err: any) => {
      setFeedbackMsg({
        type: 'error',
        text: `Ошибка синхронизации: ${err.message || 'Сбой соединения'}`,
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    },
  });

  // Toggle Override Mutation
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
  const totalInDb = statusData?.totalProducts || 0;
  const hitsInDb = statusData?.totalHits || 0;
  const categoriesInDb = statusData?.totalCategories || 0;
  const lastSync = statusData?.lastSync;

  return (
    <div className="space-y-6">
      {/* Top Banner / Sync Trigger */}
      <div className="bg-paper rounded-3xl border border-line p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-serif text-2xl font-normal text-ink">
                Синхронизация каталога с b-catalog
              </h2>
            </div>
            <p className="text-xs text-ink/60 mt-1 max-w-xl leading-relaxed">
              Автоматическое скачивание актуальных остатков и цен в корейской воне (KRW) из b-catalog каждые 30 минут. Ручные правки (хиты, скрытие, бренд) сохраняются при синхронизации.
            </p>
          </div>

          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="btn-gold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Синхронизация...' : 'Синхронизировать сейчас'}
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-sale/10 text-sale border border-sale/20'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-sale" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-line">
          <div className="bg-cream/50 p-4 rounded-2xl border border-line">
            <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Товаров в базе</span>
            <div className="font-mono text-2xl font-bold text-ink mt-1 flex items-center gap-2">
              <Package className="w-5 h-5 text-gold" />
              {totalInDb}
            </div>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-line">
            <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Категорий</span>
            <div className="font-mono text-2xl font-bold text-ink mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-gold" />
              {categoriesInDb}
            </div>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-line">
            <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Хиты продаж</span>
            <div className="font-mono text-2xl font-bold text-ink mt-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-sale" />
              {hitsInDb}
            </div>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-line">
            <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Последняя синхронизация</span>
            <div className="text-xs font-mono text-ink/80 mt-2 truncate">
              {lastSync?.finishedAt
                ? new Date(lastSync.finishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                  ` (${lastSync.status})`
                : 'Не выполнялась'}
            </div>
          </div>
        </div>
      </div>

      {/* Overrides & Products Grid */}
      <div className="bg-paper rounded-3xl border border-line p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
          <div>
            <h3 className="font-serif text-lg font-normal text-ink">
              Управление товарами и метками
            </h3>
            <p className="text-xs text-ink/50">
              Быстрое включение меток «ХИТ», скрытие с витрины и корректировка бренда
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или коду..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-cream/40 border border-line rounded-full focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink/50 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-3">Фото</th>
                <th className="py-3 px-3">Товар / Код</th>
                <th className="py-3 px-3">Бренд</th>
                <th className="py-3 px-3">Цена (KRW)</th>
                <th className="py-3 px-3">Остаток</th>
                <th className="py-3 px-3 text-center">Хит</th>
                <th className="py-3 px-3 text-center">Витрина</th>
                <th className="py-3 px-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {isProductsLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink/40">
                    Загрузка списка товаров...
                  </td>
                </tr>
              ) : productsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink/40">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                    {/* Photo */}
                    <td className="py-2.5 px-3">
                      <div className="w-12 h-12 rounded-xl bg-cream border border-line/60 overflow-hidden flex items-center justify-center">
                        <img
                          src={p.images?.[0] || '/placeholder.png'}
                          alt={p.name}
                          className="w-full h-full object-contain p-1"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* Title & SKU */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-medium text-ink line-clamp-1">{p.name}</div>
                      <div className="text-[10px] text-ink/40 font-mono mt-0.5">
                        Арт: {p.code || p.id} • {p.categoryName || 'Без категории'}
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
                            className="w-28 px-2 py-1 text-xs border border-gold rounded bg-paper"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveBrand(p.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingBrandId(p.id);
                            setEditingBrandVal(p.brand || '');
                          }}
                          className="cursor-pointer hover:text-gold text-ink font-semibold flex items-center gap-1 group"
                          title="Нажмите для изменения бренда"
                        >
                          <span>{p.brand || '—'}</span>
                          <span className="text-[10px] text-ink/30 opacity-0 group-hover:opacity-100">✎</span>
                        </div>
                      )}
                    </td>

                    {/* Price KRW */}
                    <td className="py-2.5 px-3 font-mono font-bold text-ink">
                      {formatKrw(p.priceKrw)}
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stock > 0
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {p.stock} шт
                      </span>
                    </td>

                    {/* Hit Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleHit(p)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.isHit
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                            : 'bg-cream text-ink/30 border-line hover:text-amber-600'
                        }`}
                        title={p.isHit ? 'Снять метку ХИТ' : 'Сделать Хитом продаж'}
                      >
                        <Flame className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Hidden Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleHidden(p)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.isHidden
                            ? 'bg-sale/15 text-sale border-sale/30'
                            : 'bg-cream text-ink/60 border-line hover:text-ink'
                        }`}
                        title={p.isHidden ? 'Товар скрыт с витрины. Нажмите чтобы показать' : 'Товар видим на витрине'}
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
                        className="p-1.5 inline-flex rounded-lg border border-line text-ink/50 hover:text-gold hover:border-gold transition-colors"
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
