import React, { useEffect, useState } from 'react';
import { Globe2, Users, MapPin } from 'lucide-react';
import { useLanguage } from '../../core/i18n/LanguageContext';

interface CountryItem {
  code: string;
  nameRu: string;
  nameUz: string;
  flag: string;
  visits: number;
}

interface VisitorData {
  clientIp: string;
  totalVisits: number;
  countries: CountryItem[];
}

export const CountryVisitorCounter: React.FC = () => {
  const { language, t } = useLanguage();
  const [data, setData] = useState<VisitorData>({
    clientIp: '',
    totalVisits: 0,
    countries: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function detectAndFetchStats() {
      try {
        // Track visit and get real visitor stats from Go SQLite server
        const res = await fetch('/api/visitor/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setData({
              clientIp: json.clientIp || '',
              totalVisits: json.totalVisits || 0,
              countries: json.countries || [],
            });
          }
        }
      } catch (e) {
        // Fallback to client-side IP lookup if needed
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          if (ipRes.ok) {
            const ipJson = await ipRes.json();
            if (ipJson.ip && isMounted) {
              setData((prev) => ({ ...prev, clientIp: ipJson.ip }));
            }
          }
        } catch {
          // ignore
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    detectAndFetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = data.totalVisits || data.countries.reduce((acc, c) => acc + c.visits, 0);

  return (
    <div className="rounded-2xl bg-[#1A2234] border border-[#2A344A] p-5 sm:p-6 text-white shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A344A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              {t('visitor_stats_title')}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                Live Visitor Tracking
              </span>
            </div>
          </div>
        </div>

        {/* User IP Box */}
        {data.clientIp && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-400 text-[11px]">{t('visitor_your_ip')}</span>
            <span className="text-blue-300 font-bold">{data.clientIp}</span>
          </div>
        )}
      </div>

      {/* Country List Progress Bars */}
      {data.countries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {data.countries.slice(0, 4).map((country) => {
            const percent = total > 0 ? Math.round((country.visits / total) * 100) : 0;
            const countryName = language === 'uz' ? country.nameUz : country.nameRu;

            return (
              <div
                key={country.code}
                className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#2A344A]/80 flex flex-col justify-between space-y-2 hover:border-[#3B82F6] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span className="text-xs font-bold text-gray-200 truncate max-w-[100px]">
                      {countryName}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-400">
                    {country.visits.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-[#334155] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Доля</span>
                    <span className="font-semibold text-gray-300">{percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-gray-400">
          {isLoading ? 'Загрузка гео-статистики...' : 'Статистика посещений обновляется в реальном времени'}
        </div>
      )}

      {/* Footer Total Visits */}
      <div className="mt-4 pt-3 border-t border-[#2A344A]/60 flex flex-wrap items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>{t('visitor_total_visits')} <strong className="text-white font-bold">{total.toLocaleString()}</strong></span>
        </div>
        <span className="text-[11px] text-gray-500">
          100% реальные данные без симуляций
        </span>
      </div>
    </div>
  );
};
