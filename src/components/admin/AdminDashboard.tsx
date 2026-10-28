import React, { useState } from 'react';
import {
  Store,
  LogOut,
  KeyRound,
  Shield,
  X,
  RefreshCw,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { CatalogSyncView } from './CatalogSyncView';
import { VisitorLiveLogsView } from './VisitorLiveLogsView';

interface AdminDashboardProps {
  onBackToShop: () => void;
  posts?: any[];
  onRefreshFeed?: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToShop }) => {
  const { token, logout, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'sync' | 'visitors'>('sync');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Пароль должен содержать не менее 4 символов' });
      return;
    }
    setIsChangingPass(true);
    setPasswordMsg(null);
    try {
      await changePassword(newPassword);
      setPasswordMsg({ type: 'success', text: 'Пароль успешно обновлен!' });
      setNewPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordMsg(null);
      }, 1500);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Ошибка смены пароля' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B0A] text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 bg-[#141210] border-b border-amber-500/10 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-black font-serif shadow-md shadow-amber-500/20">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white text-base tracking-wide">
                MK COSMETICS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                СИНХРОНИЗАЦИЯ КАТАЛОГА
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Центр управления витриной, b-catalog и Excel-базой
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="Сменить пароль администратора"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Пароль</span>
          </button>

          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white border border-white/10 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">В магазин</span>
          </button>

          <button
            onClick={logout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 transition-colors flex items-center gap-1.5"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Выход</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-header / Tabs */}
      <div className="bg-[#12100E] border-b border-amber-500/10 px-4 sm:px-8 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sync'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${activeTab === 'sync' ? 'text-amber-400' : ''}`} />
            Синхронизация каталога
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'visitors'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Globe2 className={`w-3.5 h-3.5 ${activeTab === 'visitors' ? 'text-amber-400' : ''}`} />
            Посетители & География
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'sync' ? (
          <CatalogSyncView token={token || ''} />
        ) : (
          <VisitorLiveLogsView token={token || ''} />
        )}
      </main>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A18] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordMsg(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-lg font-bold text-white">
                Смена пароля администратора
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 4 символа"
                  className="w-full bg-[#12100E] border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  autoFocus
                />
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordMsg(null);
                  }}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="btn-gold px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {isChangingPass ? 'Сохранение...' : 'Обновить пароль'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
