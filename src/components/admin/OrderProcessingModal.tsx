import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Truck,
  DollarSign,
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Trash2,
  Loader2,
  Eye,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Order, adminService } from '../../services/admin/adminService';

interface OrderProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (updatedOrder: Partial<Order>) => Promise<void>;
  token: string;
}

const PAYMENT_METHODS = [
  { id: 'Click', label: '💳 Click (Узбекистан)' },
  { id: 'Payme', label: '💳 Payme (Узбекистан)' },
  { id: 'Uzcard/Humo', label: '💳 Uzcard / Humo' },
  { id: 'Kaspi', label: '💳 Kaspi.kz (Казахстан)' },
  { id: 'Sber/Tinkoff', label: '💳 Сбербанк / Т-Банк (РФ)' },
  { id: 'USDT', label: '🪙 USDT (TRC-20 / TON)' },
  { id: 'Cash', label: '💵 Наличные при получении' },
  { id: 'BankTransfer', label: '🏦 Банковский перевод (KRW/USD)' },
];

const ORDER_STATUSES = [
  { id: 'new', label: '🟡 Новый', desc: 'Заявка только поступила', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { id: 'processing', label: '🔵 В обработке', desc: 'Менеджер связался / Собирается', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { id: 'paid', label: '🟣 Оплачен', desc: 'Деньги получены и проверены', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { id: 'shipped', label: '🚚 Отправлен', desc: 'Посылка выехала из Кореи', color: 'border-orange-500/30 text-orange-400 bg-orange-500/10' },
  { id: 'delivered', label: '🟢 Доставлен', desc: 'Заказ успешно вручен клиенту', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { id: 'cancelled', label: '⚪ Отменен', desc: 'Заказ аннулирован', color: 'border-zinc-500/30 text-zinc-400 bg-zinc-500/10' },
];

export const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({
  isOpen,
  onClose,
  order,
  onSave,
  token,
}) => {
  const [status, setStatus] = useState<Order['status']>('new');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'new');
      setPaymentMethod(order.paymentMethod || '');
      setPaymentReceiptUrl(order.paymentReceiptUrl || '');
      setTrackingNumber(order.trackingNumber || '');
      setShippingAddress(order.shippingAddress || '');
      setNotes(order.notes || '');
      setCustomerName(order.customerName || '');
      setPhone(order.phone || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    try {
      const res = await adminService.uploadFile(file, token);
      setPaymentReceiptUrl(res.url);
      // Auto-set status to paid if still new
      if (status === 'new') {
        setStatus('paid');
      }
    } catch (err: any) {
      alert(err.message || 'Ошибка загрузки чека');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = () => {
    setPaymentReceiptUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        status,
        paymentMethod,
        paymentReceiptUrl,
        trackingNumber,
        shippingAddress,
        notes,
        customerName,
        phone,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения данных заказа');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="bg-[#181615] text-[#EDE8E1] border border-white/10 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1C1A18] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8B5A2B] text-black font-bold flex items-center justify-center font-serif text-sm shadow-md">
                MK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-serif">
                    Обработка заказа #{order.orderNumber}
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#D4AF37] border border-white/5">
                    {order.channelSource || order.type}
                  </span>
                </div>
                <p className="text-xs text-[#78716C] flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Создан: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#78716C] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Status Workflow Selector */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[#A8A29E] font-bold">
                Статус заказа & Этап воронки
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ORDER_STATUSES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      status === st.id
                        ? `${st.color} ring-2 ring-[#D4AF37] font-bold shadow-lg`
                        : 'border-white/5 bg-white/[0.02] text-[#A8A29E] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{st.label}</div>
                    <div className="text-[10px] text-[#78716C] mt-0.5 leading-tight">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Proof & Receipt Upload Section */}
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <h4 className="text-xs uppercase font-bold text-white tracking-wider">
                    Подтверждение оплаты (Чек / Скриншот)
                  </h4>
                </div>
                {paymentReceiptUrl && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Чек прикреплен
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[11px] text-[#A8A29E] mb-1.5 font-medium">
                    Способ оплаты
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="">-- Выберите способ оплаты --</option>
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload or Receipt Action */}
                <div>
                  <label className="block text-[11px] text-[#A8A29E] mb-1.5 font-medium">
                    Скриншот или фото чека
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />

                  {paymentReceiptUrl ? (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/10">
                      <div
                        onClick={() => setPreviewImage(paymentReceiptUrl)}
                        className="w-11 h-11 rounded-lg overflow-hidden border border-white/10 cursor-pointer relative group flex-shrink-0 bg-black"
                      >
                        <img
                          src={paymentReceiptUrl}
                          alt="Чек"
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">Чек оплаты</div>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(paymentReceiptUrl)}
                          className="text-[10px] text-[#D4AF37] hover:underline"
                        >
                          Посмотреть фото
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="p-1.5 text-[#78716C] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                        title="Удалить чек"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-[#D4AF37] text-xs font-semibold text-[#D4AF37] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Загрузка чека...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Прикрепить фото чека</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Logistics & Tracking Number */}
            <div className="p-5 rounded-3xl bg-[#1C1A18] border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-xs uppercase font-bold text-white tracking-wider">
                  Доставка и Трек-номер
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#A8A29E] mb-1.5 font-medium">
                    Международный трек-номер посылки
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Например: EMS-KR849201948, CDEK..."
                    className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#A8A29E] mb-1.5 font-medium">
                    Адрес / Город доставки
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Ташкент, ул. Амира Темура..."
                    className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Customer Details & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1.5 font-medium">
                  Имя покупателя
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A8A29E] mb-1.5 font-medium">
                  Телефон / WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-[#141312] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                  />
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors flex items-center justify-center flex-shrink-0"
                      title="Написать клиенту в WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase font-bold text-[#A8A29E]">
                    Товары в заказе ({order.items.length} поз.)
                  </span>
                  <span className="font-serif font-bold text-white text-sm">
                    Итого: ₩ {order.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs"
                    >
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover bg-black flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[10px] text-[#78716C] flex-shrink-0">
                          MK
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{item.title}</div>
                        <div className="text-[11px] text-[#78716C]">
                          Кол-во: <strong className="text-[#D4AF37]">{item.quantity} шт.</strong>
                          {item.price > 0 && ` • ₩ ${item.price.toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manager Notes */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8A29E] font-bold mb-1.5">
                Внутренние заметки менеджера / продавца
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Заметки по согласованию с клиентом, нюансы доставки, время звонка..."
                className="w-full bg-[#141312] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37] leading-relaxed"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8A29E] hover:bg-white/5 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#C49E30] text-[#141312] text-xs font-bold transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Сохранить изменения</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox Receipt Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Чек об оплате"
              className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Открыть в новой вкладке</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
