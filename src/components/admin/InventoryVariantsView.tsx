import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Search,
  Package,
  DollarSign,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import { adminService, ProductVariant } from '../../services/admin/adminService';
import { TelegramPost } from '../../core/types/telegram';

interface InventoryVariantsViewProps {
  posts: TelegramPost[];
  token: string;
}

export const InventoryVariantsView: React.FC<InventoryVariantsViewProps> = ({ posts, token }) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formProductId, setFormProductId] = useState('');
  const [formType, setFormType] = useState<ProductVariant['variantType']>('volume');
  const [formName, setFormName] = useState('50 ml');
  const [formSku, setFormSku] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formRetailPrice, setFormRetailPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
  const [formStockStatus, setFormStockStatus] = useState<ProductVariant['stockStatus']>('in_stock');
  const [isSaving, setIsSaving] = useState(false);

  const fetchVariants = async () => {
    setIsLoading(true);
    try {
      const list = await adminService.getProductVariants(undefined, token);
      setVariants(list);
    } catch (err) {
      console.error('Failed to load variants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [token]);

  const handleOpenAdd = (defaultProductId?: string) => {
    setEditingVariant(null);
    const prodId = defaultProductId || (posts.length > 0 ? posts[0].id : '');
    const selectedP = posts.find((p) => p.id === prodId);
    setFormProductId(prodId);
    setFormType('volume');
    setFormName('50 ml');
    setFormSku(prodId ? `SKU-${prodId}-50ML` : '');
    setFormCostPrice(selectedP ? Math.round(selectedP.prices.krw * 0.65) : 0);
    setFormRetailPrice(selectedP ? selectedP.prices.krw : 0);
    setFormStock(15);
    setFormStockStatus('in_stock');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: ProductVariant) => {
    setEditingVariant(v);
    setFormProductId(v.productId);
    setFormType(v.variantType);
    setFormName(v.name);
    setFormSku(v.sku);
    setFormCostPrice(v.costPrice);
    setFormRetailPrice(v.retailPrice);
    setFormStock(v.stockQuantity);
    setFormStockStatus(v.stockStatus);
    setIsModalOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!formProductId) {
      alert('Выберите товар');
      return;
    }
    setIsSaving(true);
    try {
      if (editingVariant) {
        await adminService.updateProductVariant(
          editingVariant.id,
          {
            productId: formProductId,
            variantType: formType,
            name: formName,
            sku: formSku,
            costPrice: Number(formCostPrice),
            retailPrice: Number(formRetailPrice),
            stockQuantity: Number(formStock),
            stockStatus: formStockStatus,
          },
          token
        );
      } else {
        await adminService.createProductVariant(
          {
            productId: formProductId,
            variantType: formType,
            name: formName,
            sku: formSku,
            costPrice: Number(formCostPrice),
            retailPrice: Number(formRetailPrice),
            stockQuantity: Number(formStock),
            stockStatus: formStockStatus,
          },
          token
        );
      }
      setIsModalOpen(false);
      await fetchVariants();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения инварианта');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!confirm('Удалить эту модификацию товара?')) return;
    try {
      await adminService.deleteProductVariant(id, token);
      await fetchVariants();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления');
    }
  };

  const filteredVariants = variants.filter((v) => {
    const p = posts.find((post) => post.id === v.productId);
    const matchesFilter = selectedProductFilter === 'all' || v.productId === selectedProductFilter;
    const matchesQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p?.productTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
              Склад & Инварианты товаров (SKU)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 text-emerald-400 border border-emerald-500/30">
              ERP Inventory
            </span>
          </div>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Управление фасовками (объемы, оттенки, наборы), остатками на складе и себестоимостью закупки в Корее
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchVariants}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить инвариант / SKU</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#1C1A18] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию модификации (50ml, #21), SKU или названию косметики..."
            className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">Все товары ({posts.length})</option>
            {posts.slice(0, 50).map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand ? `[${p.brand}] ` : ''}{p.productTitle.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-[#1C1A18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-[#A8A29E] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span className="text-xs">Загрузка инвариантов товаров...</span>
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="p-12 text-center text-[#78716C] space-y-2">
            <Layers className="w-8 h-8 mx-auto text-[#78716C] opacity-40" />
            <p className="text-sm font-medium text-white">Инварианты пока не созданы</p>
            <p className="text-xs text-[#78716C]">
              Вы можете добавить модификации для товаров: объемы (30ml, 50ml, 100ml), оттенки (#21, #23) или наборы с отдельной ценой и контролем склада.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredVariants.map((v) => {
              const product = posts.find((p) => p.id === v.productId);
              const margin = v.retailPrice > 0 ? Math.round(((v.retailPrice - v.costPrice) / v.retailPrice) * 100) : 0;
              const isLowStock = v.stockQuantity <= 3 && v.stockStatus === 'in_stock';

              return (
                <div key={v.id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Product & Variant Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10">
                          {v.sku || `SKU-${v.id}`}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                          {v.name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-[#A8A29E] capitalize">
                          {v.variantType === 'volume' ? 'Объем / Фасовка' : v.variantType === 'shade' ? 'Тон / Оттенок' : 'Набор'}
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Мало на складе!</span>
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-white">
                        {product ? (
                          <span>
                            {product.brand && <strong className="text-[#D4AF37] mr-1">[{product.brand}]</strong>}
                            {product.productTitle}
                          </span>
                        ) : (
                          <span className="text-[#78716C]">Товар #{v.productId}</span>
                        )}
                      </div>

                      {/* Financials & Stock */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-[#78716C] block text-[10px] uppercase">Розница:</span>
                          <span className="font-bold text-white font-serif">₩ {v.retailPrice.toLocaleString()}</span>
                        </div>

                        <div>
                          <span className="text-[#78716C] block text-[10px] uppercase">Себестоимость:</span>
                          <span className="text-[#A8A29E] font-serif">₩ {v.costPrice.toLocaleString()}</span>
                        </div>

                        <div>
                          <span className="text-[#78716C] block text-[10px] uppercase">Маржа:</span>
                          <span className="text-emerald-400 font-bold">{margin}%</span>
                        </div>

                        <div>
                          <span className="text-[#78716C] block text-[10px] uppercase">Остаток:</span>
                          <span className={`font-bold ${v.stockQuantity > 0 ? 'text-white' : 'text-red-400'}`}>
                            {v.stockQuantity} шт.
                          </span>
                        </div>

                        <div>
                          <span className="text-[#78716C] block text-[10px] uppercase">Статус склада:</span>
                          <span className={`text-[11px] font-semibold ${
                            v.stockStatus === 'in_stock' ? 'text-emerald-400' : v.stockStatus === 'pre_order' ? 'text-blue-400' : 'text-zinc-500'
                          }`}>
                            {v.stockStatus === 'in_stock' ? 'В наличии' : v.stockStatus === 'pre_order' ? 'Под заказ из Кореи' : 'Закончился'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#C4BDB5] hover:text-white border border-white/5 transition-colors"
                        title="Редактировать инвариант"
                      >
                        <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                      </button>

                      <button
                        onClick={() => handleDeleteVariant(v.id)}
                        className="p-2 rounded-xl text-[#78716C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Удалить инвариант"
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

      {/* Add / Edit Variant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">
                  {editingVariant ? 'Редактировать модификацию' : 'Новая модификация (SKU)'}
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
                <label className="block text-[#A8A29E] mb-1 font-semibold">Товар из каталога:</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand ? `[${p.brand}] ` : ''}{p.productTitle.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Тип модификации:</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <option value="volume">Объем / Фасовка (мл / гр)</option>
                    <option value="shade">Оттенок / Тон</option>
                    <option value="bundle">Набор / Комплект</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Значение (Название):</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. 50 ml или #21 Light Beige"
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1 font-semibold">Артикул / SKU:</label>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="e.g. MEDI-COL-50ML"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Розничная цена (₩):</label>
                  <input
                    type="number"
                    value={formRetailPrice}
                    onChange={(e) => setFormRetailPrice(Number(e.target.value))}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Себестоимость закупки (₩):</label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Остаток на складе (шт.):</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A8A29E] mb-1 font-semibold">Статус склада:</label>
                  <select
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value as any)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <option value="in_stock">В наличии</option>
                    <option value="pre_order">Под заказ из Кореи (5-7 дн.)</option>
                    <option value="out_of_stock">Закончился</option>
                  </select>
                </div>
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
                onClick={handleSaveVariant}
                disabled={isSaving}
                className="py-2 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить инвариант'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
