import React, { useState, useEffect } from 'react';
import {
  Globe2,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  Laptop,
  Smartphone,
  Compass,
  ArrowUpRight,
  Filter,
  Users,
  Eye,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { adminService, AdminVisitorLog, AdminStats } from '../../services/admin/adminService';

interface VisitorLiveLogsViewProps {
  token: string;
}

export const VisitorLiveLogsView: React.FC<VisitorLiveLogsViewProps> = ({ token }) => {
  const [logs, setLogs] = useState<AdminVisitorLog[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(100);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [logsData, statsData] = await Promise.all([
        adminService.getVisitorLogs(token, limit),
        adminService.getDashboardStats(token),
      ]);
      setLogs(logsData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Failed to load visitor logs:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 15 seconds for live tracking
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [token, limit]);

  // Parse User-Agent helper
  const parseDevice = (ua?: string) => {
    if (!ua) return { type: 'Неизвестно', icon: <Laptop className="w-3.5 h-3.5 text-neutral-400" /> };
    const lower = ua.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
      if (lower.includes('iphone')) return { type: 'iPhone / iOS', icon: <Smartphone className="w-3.5 h-3.5 text-sky-400" /> };
      if (lower.includes('android')) return { type: 'Android Mobile', icon: <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> };
      return { type: 'Mobile Phone', icon: <Smartphone className="w-3.5 h-3.5 text-amber-400" /> };
    }
    if (lower.includes('macintosh') || lower.includes('mac os')) {
      return { type: 'Mac / Safari', icon: <Laptop className="w-3.5 h-3.5 text-neutral-200" /> };
    }
    if (lower.includes('windows')) {
      return { type: 'Windows PC', icon: <Laptop className="w-3.5 h-3.5 text-sky-300" /> };
    }
    return { type: 'Компьютер / Web', icon: <Laptop className="w-3.5 h-3.5 text-neutral-400" /> };
  };

  // Format date helper
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Country filter
    if (selectedCountryFilter !== 'all' && log.countryCode !== selectedCountryFilter) {
      return false;
    }
    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.ip && log.ip.toLowerCase().includes(q)) ||
      (log.city && log.city.toLowerCase().includes(q)) ||
      (log.countryName && log.countryName.toLowerCase().includes(q)) ||
      (log.countryCode && log.countryCode.toLowerCase().includes(q)) ||
      (log.path && log.path.toLowerCase().includes(q)) ||
      (log.userAgent && log.userAgent.toLowerCase().includes(q))
    );
  });

  // Unique country codes from logs for filter dropdown
  const uniqueCountries = Array.from(new Set(logs.map((l) => l.countryCode).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Журнал посетителей (Реальные входы)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Онлайн трекинг" />
              </h2>
              <p className="text-xs text-neutral-400">
                100% реальные IP-адреса, геолокация (город, страна), тип устройства и открытые страницы
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/20 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-sm disabled:opacity-50"
            title="Обновить журнал"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Обновление...' : 'Обновить'}</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/15 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Всего входов</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {(stats?.totalVisits || logs.length).toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Зафиксировано в SQLite WAL</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/15 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Стран посещений</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {(stats?.countries?.length || uniqueCountries.length || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">География визитов</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/15 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Загружено записей</div>
            <div className="text-2xl font-black text-sky-400 font-mono mt-0.5">
              {logs.length}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Последние реальные сессии</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/15 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Автообновление</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Каждые 15 сек</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Без фейков и симуляций</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Countries Bar from Stats */}
      {stats?.countries && stats.countries.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#1C1A18] border border-amber-500/15 space-y-3">
          <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
            <span>Распределение по странам</span>
            <span className="text-[11px] text-neutral-400 lowercase font-normal">нажмите для фильтрации</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCountryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCountryFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'bg-[#25221F] text-neutral-300 hover:text-white border border-white/5'
              }`}
            >
              🌐 Все страны ({stats.totalVisits})
            </button>
            {stats.countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountryFilter(c.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCountryFilter === c.code
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-[#25221F] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.nameRu || c.code}</span>
                <span className="font-mono text-[11px] opacity-80">({c.visits})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по IP, городу, стране, странице или устройству..."
            className="w-full h-10 pl-10 pr-4 bg-[#1C1A18] border border-amber-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Limit selector */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>Показывать:</span>
          {[50, 100, 250].map((l) => (
            <button
              key={l}
              onClick={() => setLimit(l)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                limit === l
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-[#1C1A18] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#1C1A18] border border-amber-500/15 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Загрузка реальных логов из базы SQLite...
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Globe2 className="w-10 h-10 text-neutral-600 mx-auto" />
            <div className="text-sm font-semibold text-neutral-300">Записей не найдено</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? 'По вашему поисковому запросу ничего не найдено. Попробуйте сбросить фильтры.'
                : 'Пока еще нет зафиксированных визитов. При переходе пользователей по сайту они появятся здесь автоматически.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-500/10 bg-[#161412] text-neutral-400 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4">Время визита</th>
                  <th className="py-3 px-4">IP-адрес</th>
                  <th className="py-3 px-4">Откуда (Страна & Город)</th>
                  <th className="py-3 px-4">Устройство / Браузер</th>
                  <th className="py-3 px-4">Страница входа</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {filteredLogs.map((log) => {
                  const dev = parseDevice(log.userAgent);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{formatTime(log.visitedAt)}</span>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                          {log.ip || 'Неизвестен'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{log.flag || '🌐'}</span>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{log.countryName || log.countryCode || 'Не определено'}</span>
                              {log.countryCode && (
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  ({log.countryCode})
                                </span>
                              )}
                            </div>
                            {log.city ? (
                              <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{log.city}</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-neutral-500">Город не определен</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {dev.icon}
                          <span className="text-neutral-200 font-medium">{dev.type}</span>
                        </div>
                        {log.userAgent && (
                          <div
                            className="text-[10px] text-neutral-500 truncate max-w-xs mt-0.5"
                            title={log.userAgent}
                          >
                            {log.userAgent}
                          </div>
                        )}
                      </td>

                      {/* Page */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {log.path || '/'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        <div className="py-3 px-4 border-t border-amber-500/10 bg-[#161412] flex items-center justify-between text-xs text-neutral-400">
          <span>
            Показано <strong>{filteredLogs.length}</strong> из <strong>{logs.length}</strong> записей
          </span>
          <span className="text-[11px] text-neutral-500">
            Данные фиксируются при каждом обращении к API сайта
          </span>
        </div>
      </div>
    </div>
  );
};
