import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Eye,
  EyeOff,
  ExternalLink,
  RotateCcw,
  Check,
  AlertCircle,
  Tag,
  FileSpreadsheet,
  Globe2,
  Clock,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { CatalogProduct } from '../../core/types/catalog';
import { formatKrw } from '../ui/Price';

interface ProductCatalogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct | null;
  onSave: (id: number, overrides: {
    titleOverride?: string;
    brandOverride?: string;
    priceKrwOverride?: number;
    descriptionOverride?: string;
    isHit?: boolean;
    isHidden?: boolean;
  }) => Promise<void>;
  isSaving?: boolean;
}

export const ProductCatalogEditModal: React.FC<ProductCatalogEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  isSaving = false,
}) => {
  if (!isOpen || !product) return null;

  const isExcel = product.sourceType === 'excel' || product.sourceId < 0;

  // Form states initialized with existing overrides or empty
  const [title, setTitle] = useState(product.titleOverride || product.title || '');
  const [brand, setBrand] = useState(product.brandOverride || product.brand || '');
  const [priceKrw, setPriceKrw] = useState<string>(
    product.priceKrwOverride && product.priceKrwOverride > 0
      ? String(product.priceKrwOverride)
      : String(product.priceKrw || '')
  );
  const [description, setDescription] = useState(
    product.descriptionOverride || product.description || ''
  );
  const [isHit, setIsHit] = useState(product.isHit);
  const [isHidden, setIsHidden] = useState(product.isHidden);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (product) {
      setTitle(product.titleOverride || product.title || '');
      setBrand(product.brandOverride || product.brand || '');
      setPriceKrw(
        product.priceKrwOverride && product.priceKrwOverride > 0
          ? String(product.priceKrwOverride)
          : String(product.priceKrw || '')
      );
      setDescription(product.descriptionOverride || product.description || '');
      setIsHit(product.isHit);
      setIsHidden(product.isHidden);
      setActivePhotoIdx(0);
    }
  }, [product]);

  // Original background values
  const origTitle = product.originalTitle || product.title;
  const origBrand = product.originalBrand || product.brand;
  const origPrice = product.originalPriceKrw || product.priceKrw;
  const origDescription = product.description;

  const isTitleModified = title.trim() !== origTitle;
  const isBrandModified = brand.trim() !== origBrand;
  const isPriceModified = Number(priceKrw) > 0 && Number(priceKrw) !== origPrice;
  const isDescModified = description.trim() !== origDescription;

  const handleResetToSource = () => {
    if (confirm('Сбросить все ручные правки к исходным данным автоматического источника?')) {
      setTitle(origTitle);
      setBrand(origBrand);
      setPriceKrw(String(origPrice));
      setDescription(origDescription);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(priceKrw.replace(/\D/g, ''));

    await onSave(product.id, {
      titleOverride: title.trim() !== origTitle ? title.trim() : '',
      brandOverride: brand.trim() !== origBrand ? brand.trim() : '',
      priceKrwOverride: parsedPrice > 0 && parsedPrice !== origPrice ? parsedPrice : 0,
      descriptionOverride: description.trim() !== origDescription ? description.trim() : '',
      isHit,
      isHidden,
    });
    onClose();
  };

  const photosList = product.photos && product.photos.length > 0
    ? product.photos.map((p) => p.full || p.w600 || p.w300)
    : product.images && product.images.length > 0
    ? product.images
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="bg-[#181614] border border-amber-500/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-[#141210] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isExcel ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
              {isExcel ? <FileSpreadsheet className="w-5 h-5" /> : <Globe2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-white">Редактирование товара</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isExcel ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}`}>
                  {isExcel ? 'Excel База' : 'b-catalog онлайн'}
                </span>
                {product.code && (
                  <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                    #{product.code}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Ручные переопределения защищены от затирания фоновым процессом
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-amber-400 border border-neutral-800 transition-colors"
              title="Открыть товар на витрине"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Photos & Source info */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Photo Preview */}
              <div className="aspect-square rounded-2xl bg-black/40 border border-neutral-800 overflow-hidden relative flex items-center justify-center">
                {photosList.length > 0 ? (
                  <img
                    src={photosList[activePhotoIdx] || photosList[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">Фото отсутствует</span>
                  </div>
                )}

                {/* Overrides badge on image */}
                {(isTitleModified || isBrandModified || isPriceModified || isDescModified) && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-amber-500/90 text-black text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    Есть ручные правки
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {photosList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photosList.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-14 h-14 rounded-xl border overflow-hidden flex-shrink-0 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-amber-400 shadow-md ring-2 ring-amber-400/30'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={ph} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Background Status Card */}
              <div className="p-4 rounded-2xl bg-[#12100E] border border-neutral-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    Синхронизирован:
                  </span>
                  <span className="font-mono text-neutral-300">
                    {new Date(product.syncedAt || product.updatedAt || Date.now()).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>ID в системе:</span>
                  <span className="font-mono text-neutral-300">#{product.id}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Исходный source_id:</span>
                  <span className="font-mono text-neutral-300">{product.sourceId}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Категория:</span>
                  <span className="text-amber-300/90 font-medium">{product.categoryTitle || 'Без категории'}</span>
                </div>
              </div>

              {/* Reset overrides button */}
              {(isTitleModified || isBrandModified || isPriceModified || isDescModified) && (
                <button
                  type="button"
                  onClick={handleResetToSource}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Сбросить к исходным данным источника
                </button>
              )}
            </div>

            {/* Right: Editable Fields with Side-by-Side Comparison */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Quick Toggles: IsHit & IsHidden */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsHit(!isHit)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isHit
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-[#12100E] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Flame className={`w-5 h-5 ${isHit ? 'fill-amber-400 text-amber-400' : 'text-neutral-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">ХИТ продаж</span>
                      <span className="text-[10px] text-neutral-400">Выводить в подборке на главной</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isHit ? 'bg-amber-400 border-amber-400 text-black' : 'border-neutral-700'}`}>
                    {isHit && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHidden(!isHidden)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isHidden
                      ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-sm'
                      : 'bg-[#12100E] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    {isHidden ? (
                      <EyeOff className="w-5 h-5 text-red-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-emerald-400" />
                    )}
                    <div>
                      <span className="font-bold text-xs block">
                        {isHidden ? 'Товар скрыт' : 'На витрине'}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {isHidden ? 'Не виден покупателям' : 'Доступен для заказа'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isHidden ? 'bg-red-500 border-red-500 text-white' : 'border-neutral-700'}`}>
                    {isHidden && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>

              {/* Title Input with Original Reference */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    Название товара
                    {isTitleModified && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        изменено
                      </span>
                    )}
                  </label>
                  {isTitleModified && (
                    <button
                      type="button"
                      onClick={() => setTitle(origTitle)}
                      className="text-[11px] text-neutral-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Вернуть исходное
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#12100E] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                  placeholder="Введите название товара"
                />
                {isTitleModified && (
                  <p className="text-[11px] text-neutral-500 italic bg-black/20 p-2 rounded-lg border border-neutral-800/80">
                    Исходное из источника: <strong className="text-neutral-400 not-italic">{origTitle}</strong>
                  </p>
                )}
              </div>

              {/* Brand & Price in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      Бренд
                      {isBrandModified && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          изменен
                        </span>
                      )}
                    </label>
                    {isBrandModified && (
                      <button
                        type="button"
                        onClick={() => setBrand(origBrand)}
                        className="text-[11px] text-neutral-400 hover:text-amber-300"
                      >
                        Вернуть
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#12100E] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    placeholder="Название бренда"
                  />
                  {isBrandModified && (
                    <p className="text-[11px] text-neutral-500 italic">
                      Исходный: <strong className="text-neutral-400 not-italic">{origBrand}</strong>
                    </p>
                  )}
                </div>

                {/* Price KRW */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      Цена (KRW ₩)
                      {isPriceModified && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          изменена
                        </span>
                      )}
                    </label>
                    {isPriceModified && (
                      <button
                        type="button"
                        onClick={() => setPriceKrw(String(origPrice))}
                        className="text-[11px] text-neutral-400 hover:text-amber-300"
                      >
                        Вернуть
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={priceKrw}
                    onChange={(e) => setPriceKrw(e.target.value)}
                    className="w-full bg-[#12100E] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-amber-400 outline-none"
                    placeholder="25000"
                  />
                  {isPriceModified && (
                    <p className="text-[11px] text-neutral-500 italic">
                      Исходная цена: <strong className="text-neutral-400 not-italic">{formatKrw(origPrice)}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    Описание и способ применения
                    {isDescModified && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        изменено
                      </span>
                    )}
                  </label>
                  {isDescModified && (
                    <button
                      type="button"
                      onClick={() => setDescription(origDescription)}
                      className="text-[11px] text-neutral-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Вернуть
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#12100E] border border-neutral-700 focus:border-amber-400 rounded-xl p-3.5 text-xs text-neutral-200 outline-none leading-relaxed font-sans"
                  placeholder="Подробное описание товара, состав, способ применения..."
                />
              </div>

            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
