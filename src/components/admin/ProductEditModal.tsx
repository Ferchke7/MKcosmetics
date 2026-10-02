import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TelegramPost } from '../../core/types/telegram';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: TelegramPost | null;
  onSave: (productData: any) => Promise<void>;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const isEditing = !!product;

  const [productTitle, setProductTitle] = useState('');
  const [brand, setBrand] = useState('K-Beauty');
  const [text, setText] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isBestseller, setIsBestseller] = useState(false);
  
  // Prices
  const [krw, setKrw] = useState<string>('');
  const [rub, setRub] = useState<string>('');
  const [usd, setUsd] = useState<string>('');
  const [uzs, setUzs] = useState<string>('');
  const [kzt, setKzt] = useState<string>('');

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Tags
  const [tagsStr, setTagsStr] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setProductTitle(product.productTitle || '');
      setBrand(product.brand || 'K-Beauty');
      setText(product.text || '');
      setDiscountPercent(product.discountPercent || 0);
      setIsBestseller(!!product.isBestseller);
      setKrw(product.prices?.krw ? String(product.prices.krw) : '');
      setRub(product.prices?.rub ? String(product.prices.rub) : '');
      setUsd(product.prices?.usd ? String(product.prices.usd) : '');
      setUzs(product.prices?.uzs ? String(product.prices.uzs) : '');
      setKzt(product.prices?.kzt ? String(product.prices.kzt) : '');
      setPhotos(product.photos || []);
      setTagsStr(product.tags ? product.tags.join(', ') : '');
    } else {
      setProductTitle('');
      setBrand('K-Beauty');
      setText('');
      setDiscountPercent(0);
      setIsBestseller(false);
      setKrw('');
      setRub('');
      setUsd('');
      setUzs('');
      setKzt('');
      setPhotos([]);
      setTagsStr('');
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && !photos.includes(newPhotoUrl.trim())) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle.trim()) {
      setError('Укажите название товара');
      return;
    }

    setIsSaving(true);
    setError(null);

    const prices: any = {};
    if (krw && !isNaN(Number(krw))) prices.krw = parseInt(krw, 10);
    if (rub && !isNaN(Number(rub))) prices.rub = parseInt(rub, 10);
    if (usd && !isNaN(Number(usd))) prices.usd = parseFloat(usd);
    if (uzs && !isNaN(Number(uzs))) prices.uzs = parseInt(uzs, 10);
    if (kzt && !isNaN(Number(kzt))) prices.kzt = parseInt(kzt, 10);

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const payload: any = {
      ...(product || {}),
      id: product?.id,
      productTitle: productTitle.trim(),
      brand: brand.trim(),
      text: text.trim(),
      prices,
      photos,
      tags,
      discountPercent: Number(discountPercent) || 0,
      isBestseller,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const commonBrands = [
    'MEDI-PEEL', 'LANEIGE', 'SULWHASOO', 'ROUND LAB', 'ANUA', 'TORRIDEN',
    'COSRX', 'Dr.Jart+', 'MISSHA', 'INNISFREE', 'SOME BY MI', 'BEAUTY OF JOSEON',
    'NUMBUZIN', 'SKIN1004', 'MANYO', 'HERA', 'WHOO', 'FARMSTAY', 'MASIL', 'LADOR', 'K-Beauty',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161514]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                {isEditing ? 'Редактировать товар' : 'Добавить новый товар'}
              </h2>
              <p className="text-xs text-[#A8A29E]">
                {isEditing ? `ID: ${product?.id}` : 'Ручное добавление в базу SQLite'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A8A29E] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5">
                Название товара *
              </label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="MEDI-PEEL Peptide 9 Volume Bio Tox Ampoule"
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5">
                Бренд
              </label>
              <input
                type="text"
                list="brands-list"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <datalist id="brands-list">
                {commonBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Multi-currency Prices */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-2">
              Цены в валютах
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              <div>
                <span className="block text-[11px] text-[#A8A29E] mb-1">₩ Вон (KRW)</span>
                <input
                  type="number"
                  value={krw}
                  onChange={(e) => setKrw(e.target.value)}
                  placeholder="24000"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <span className="block text-[11px] text-[#A8A29E] mb-1">₽ Рубли (RUB)</span>
                <input
                  type="number"
                  value={rub}
                  onChange={(e) => setRub(e.target.value)}
                  placeholder="1650"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <span className="block text-[11px] text-[#A8A29E] mb-1">$ Доллары (USD)</span>
                <input
                  type="number"
                  step="0.1"
                  value={usd}
                  onChange={(e) => setUsd(e.target.value)}
                  placeholder="18.5"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <span className="block text-[11px] text-[#A8A29E] mb-1">Сум (UZS)</span>
                <input
                  type="number"
                  value={uzs}
                  onChange={(e) => setUzs(e.target.value)}
                  placeholder="235000"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <span className="block text-[11px] text-[#A8A29E] mb-1">₸ Тенге (KZT)</span>
                <input
                  type="number"
                  value={kzt}
                  onChange={(e) => setKzt(e.target.value)}
                  placeholder="8500"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Badges & Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5">
                Скидка (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-[#D4AF37]"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isBestseller"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-[#141312]"
              />
              <label htmlFor="isBestseller" className="text-sm font-medium text-white cursor-pointer select-none">
                🌟 Отметить как Хит / Бестселлер
              </label>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-2">
              Фотографии товара
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://... или ссылка на фото"
                className="flex-1 bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#D4AF37]"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить фото
              </button>
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-black">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-white/10 rounded-2xl text-center text-xs text-[#78716C] flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Фотографии не добавлены</span>
              </div>
            )}
          </div>

          {/* Description & Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5">
              Описание / Текст поста
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Полное описание продукта..."
              className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] mb-1.5">
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="сыворотка, пептиды, антивозрастной, medi-peel"
              className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#D4AF37]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8A29E] hover:text-white hover:bg-white/5 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#C49E30] text-[#141312] text-xs font-bold transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#141312] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
