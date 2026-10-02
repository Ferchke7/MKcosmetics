import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';

interface AdminLoginProps {
  onBackToShop: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToShop }) => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }

    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#121110] text-[#EDE8E1] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#8B5A2B]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top bar back link */}
      <button
        onClick={onBackToShop}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A8A29E] hover:text-[#D4AF37] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4" />
        Вернуться в магазин
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#242120] to-[#363230] border border-[#D4AF37]/30 shadow-2xl mb-4 text-[#D4AF37]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              MK COSMETICS
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              CRM Panel
            </span>
          </div>
          <p className="text-xs text-[#A8A29E]">
            Панель управления каталогом, синхронизацией и CRM
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#1C1A18]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#C4BDB5] mb-2 uppercase tracking-wider">
                Логин
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C4BDB5] mb-2 uppercase tracking-wider">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#141312] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-[#57534E] focus:outline-none focus:border-[#D4AF37] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C158] hover:to-[#C49E30] text-[#141312] font-semibold text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#141312] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Войти в систему'
              )}
            </button>
          </form>

          {/* Quick Demo Helper Button */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#D4AF37] text-xs font-medium transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Заполнить по умолчанию: <strong>admin / admin</strong></span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#78716C] mt-6">
          MK Cosmetics CRM Platform • Защищено JWT & SQLite WAL
        </p>
      </div>
    </div>
  );
};
