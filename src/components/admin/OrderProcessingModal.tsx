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
  Plane,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { Order, CargoBatch, StaffMember, adminService } from '../../services/admin/adminService';

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
  const [city, setCity] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [cargoBatchId, setCargoBatchId] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const [cargoBatches, setCargoBatches] = useState<CargoBatch[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'new');
      setPaymentMethod(order.paymentMethod || '');
      setPaymentReceiptUrl(order.paymentReceiptUrl || '');
      setTrackingNumber(order.trackingNumber || '');
      setShippingAddress(order.shippingAddress || '');
      setCity(order.city || '');
      setAssignedTo(order.assignedTo || '');
      setCargoBatchId(order.cargoBatchId || 0);
      setCostPrice(order.costPrice || 0);
      setNotes(order.notes || '');
      setCustomerName(order.customerName || '');
      setPhone(order.phone || '');
    }
  }, [order]);

  useEffect(() => {
    if (isOpen && token) {
      adminService.getCargoBatches(token).then(setCargoBatches).catch(console.error);
      adminService.getStaff(token).then(setStaffList).catch(console.error);
    }
  }, [isOpen, token]);

  if (!isOpen || !order) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    try {
      const res = await adminService.uploadFile(file, token);
      setPaymentReceiptUrl(res.url);
      if (status === 'new') {
        setStatus('paid');
      }
    } catch (err: any) {
      alert(err.message || 'Ошибка загрузки файла чека');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = () => {
    if (confirm('Удалить прикрепленный чек?')) {
      setPaymentReceiptUrl('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        status,
        paymentMethod,
        paymentReceiptUrl,
        trackingNumber,
        shippingAddress,
        city,
        assignedTo,
        cargoBatchId,
        costPrice: Number(costPrice),
        notes,
        customerName,
        phone,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  const cleanWaNumber = cleanPhone.replace('+', '');

  // 1-Click WhatsApp Templates
  const handleCopyOrSendWhatsApp = (templateType: 'req' | 'shipped' | 'feedback') => {
    let msg = '';
    if (templateType === 'req') {
      msg = `Здравствуйте, ${customerName || 'клиент'}! 🌸\nВаш заказ #${order.orderNumber} на сумму ₩ ${order.totalAmount.toLocaleString()} принят в MK Cosmetics.\nРеквизиты для оплаты: Click / Kaspi / USDT.\nПосле оплаты отправьте, пожалуйста, чек в этот чат!`;
    } else if (templateType === 'shipped') {
      msg = `Здравствуйте, ${customerName}! ✈️\nВаша посылка по заказу #${order.orderNumber} отправлена из Кореи!\nТрек-номер для отслеживания: ${trackingNumber || 'Будет назначен авиа-карго'}.\nСпасибо за выбор MK Cosmetics!`;
    } else {
      msg = `Здравствуйте, ${customerName}! 💖\nВаш заказ #${order.orderNumber} успешно доставлен. Будем очень благодарны за ваш отзыв о результатах ухода! 🌟`;
    }

    if (cleanWaNumber) {
      const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    } else {
      navigator.clipboard.writeText(msg);
      setCopiedTemplate(templateType);
      setTimeout(() => setCopiedTemplate(null), 2500);
    }
  };

  // Telegram Bot Dispatch
  const [isNotifyingTg, setIsNotifyingTg] = useState(false);
  const [tgMsg, setTgMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customChatId, setCustomChatId] = useState('');

  const handleSendToTelegram = async () => {
    if (!order) return;
    setIsNotifyingTg(true);
    setTgMsg(null);
    try {
      const res = await adminService.notifyOrderTelegram(order.id, customChatId, token);
      setTgMsg({ type: 'success', text: res.message || 'Заказ успешно отправлен в Telegram!' });
    } catch (err: any) {
      setTgMsg({ type: 'error', text: err.message || 'Ошибка отправки в Telegram' });
    } finally {
      setIsNotifyingTg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1C1A18] text-[#EDE8E1] border border-white/15 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141312]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-serif">
                  Обработка заказа #{order.orderNumber}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#C4BDB5]">
                  {order.channelSource}
                </span>
              </div>
              <span className="text-[11px] text-[#A8A29E] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#78716C]" />
                Создан: {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A8A29E] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Status Workflow Selector */}
          <div>
            <label className="block text-[#A8A29E] uppercase tracking-wider font-semibold mb-2.5 text-[11px]">
              1. Статус обработки заказа:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ORDER_STATUSES.map((st) => {
                const isSelected = status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? `${st.color} shadow-lg ring-2 ring-[#D4AF37]/50 font-bold`
                        : 'border-white/5 bg-[#141312]/60 text-[#78716C] hover:text-[#C4BDB5] hover:bg-[#141312]'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{st.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{st.desc}</div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 absolute top-2 right-2 text-[#D4AF37]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Customer & Manager & Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-2xl bg-[#141312] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Клиент & Контакт
              </span>

              <div>
                <label className="text-[10px] text-[#78716C] block mb-1">Имя клиента:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#78716C] block mb-1">Телефон / WhatsApp:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>
            </div>

            {/* Manager Assignment */}
            <div className="p-4 rounded-2xl bg-[#141312] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-blue-400 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Ответственный менеджер
              </span>

              <div>
                <label className="text-[10px] text-[#78716C] block mb-1">Назначить продавца:</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="">Не назначен</option>
                  <option value="admin">admin (Главный администратор)</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.username}>
                      {s.displayName || s.username} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#78716C] block mb-1">Себестоимость закупки (₩):</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  placeholder="Закупка в Корее"
                  className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Cargo Logistics & City */}
            <div className="p-4 rounded-2xl bg-[#141312] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" />
                Карго Рейс & Город
              </span>

              <div>
                <label className="text-[10px] text-[#78716C] block mb-1">Привязать к партии Карго:</label>
                <select
                  value={cargoBatchId}
                  onChange={(e) => {
                    const bId = Number(e.target.value);
                    setCargoBatchId(bId);
                    const b = cargoBatches.find((cb) => cb.id === bId);
                    if (b?.awbNumber && !trackingNumber) {
                      setTrackingNumber(b.awbNumber);
                    }
                  }}
                  className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value={0}>Без партии / Одиночная посылка</option>
                  {cargoBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#78716C] block mb-1">Город назначения:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ташкент, Самарканд, Алматы"
                  className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Receipt Upload & Method */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1816] to-[#141312] border border-purple-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>Прием оплаты & Чек подтверждения перевода</span>
              </div>
              <span className="text-[11px] text-[#78716C]">
                Сумма к оплате:{' '}
                <strong className="text-[#D4AF37] font-serif text-sm">
                  ₩ {order.totalAmount.toLocaleString()}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-[11px] text-[#A8A29E] block font-semibold">
                  Способ оплаты (Платежная система):
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="">-- Выберите способ оплаты --</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.label}
                    </option>
                  ))}
                </select>

                {/* 1-Click WhatsApp Template Buttons */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-bold block">
                    Быстрые шаблоны WhatsApp в 1 клик:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyOrSendWhatsApp('req')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-[#C4BDB5] hover:text-white border border-white/5 text-center transition-colors"
                      title="Отправить реквизиты для оплаты"
                    >
                      💳 Реквизиты
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyOrSendWhatsApp('shipped')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-[#C4BDB5] hover:text-white border border-white/5 text-center transition-colors"
                      title="Уведомление об отправке с треком"
                    >
                      ✈️ Отправка
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyOrSendWhatsApp('feedback')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-[#C4BDB5] hover:text-white border border-white/5 text-center transition-colors"
                      title="Запрос отзыва"
                    >
                      💖 Отзыв
                    </button>
                  </div>
                  {copiedTemplate && (
                    <span className="text-[10px] text-emerald-400 block animate-fade-in">
                      ✓ Текст шаблона скопирован в буфер обмена!
                    </span>
                  )}
                </div>
              </div>

              {/* Receipt Upload / Preview Box */}
              <div>
                <label className="text-[11px] text-[#A8A29E] block font-semibold mb-2">
                  Скриншот чека / Доказательство перевода:
                </label>

                {paymentReceiptUrl ? (
                  <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={paymentReceiptUrl}
                        alt="Чек"
                        className="w-14 h-14 object-cover rounded-xl border border-white/10 bg-black cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage(paymentReceiptUrl)}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          Чек загружен
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(paymentReceiptUrl)}
                          className="text-[10px] text-purple-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Eye className="w-3 h-3" /> Посмотреть в полный экран
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="p-2 rounded-xl text-[#78716C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Удалить чек"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-purple-500/[0.03] space-y-1.5"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-purple-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[10px]">Загрузка файла на сервер...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mx-auto text-purple-400" />
                        <span className="text-xs font-bold text-white block">
                          Нажмите для загрузки чека
                        </span>
                        <span className="text-[10px] text-[#78716C] block">
                          PNG, JPG, WEBP (скриншот Click, Payme, Kaspi и др.)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Tracking & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-[#A8A29E] font-semibold block mb-1">
                Трек-номер отправления (EMS / Карго / CDEK):
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. KR198273645 / AWB-9812"
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#A8A29E] font-semibold block mb-1">
                Адрес доставки:
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Город, улица, дом, ориентир..."
                className="w-full bg-[#141312] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* 5. Order Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#141312] border border-white/5 space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#A8A29E] block">
                Состав заказа ({order.items.length} поз.):
              </span>
              <div className="divide-y divide-white/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span className="text-white truncate">{item.title}</span>
                    </div>
                    <div className="text-[#A8A29E] flex-shrink-0">
                      <strong className="text-[#D4AF37]">{item.quantity} шт.</strong>
                      {item.price > 0 && ` • ₩ ${item.price.toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Multi-Channel Dispatch (Telegram Bot & Direct WhatsApp) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17202A] to-[#121A22] border border-[#0088cc]/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Send className="w-4 h-4" />
                <span>Отправка заказа в Telegram бота & Менеджеру</span>
              </div>
              {tgMsg && (
                <span className={`text-[11px] font-bold ${tgMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tgMsg.text}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={customChatId}
                onChange={(e) => setCustomChatId(e.target.value)}
                placeholder="ID чата / группы менеджера (необязательно)"
                className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#64748B] text-xs focus:outline-none focus:border-[#0088cc]"
              />

              <button
                type="button"
                disabled={isNotifyingTg}
                onClick={handleSendToTelegram}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isNotifyingTg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isNotifyingTg ? 'Отправка...' : '📤 Отправить в Telegram'}</span>
              </button>

              {cleanWaNumber && (
                <a
                  href={`https://wa.me/${cleanWaNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
            <p className="text-[10px] text-[#64748B]">
              💡 Заказ придет в Telegram с интерактивными кнопками изменения статуса («В обработку», «Отправлен», «Доставлен») и привязкой к менеджеру.
            </p>
          </div>

          {/* 7. Manager Notes */}
          <div>
            <label className="text-[11px] text-[#A8A29E] font-semibold block mb-1">
              Внутренние заметки менеджера:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Комментарии по заказу, договоренности о доставке..."
              className="w-full bg-[#141312] border border-white/10 rounded-xl p-3 text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#141312]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="py-2.5 px-4 rounded-xl border border-white/10 text-xs font-semibold text-[#A8A29E] hover:bg-white/5 transition-colors"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="py-2.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#141312] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[#141312] border border-white/20 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Чек"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
