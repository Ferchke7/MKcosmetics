import React, { useState, useMemo } from 'react';
import { 
  Search, ChevronUp, ChevronDown, Download, FileSpreadsheet, 
  FileText, CheckSquare, Square, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, Filter, RefreshCw, Layers
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
  accessor?: (item: T) => any;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: 'gold' | 'danger' | 'default';
  onClick: (selectedItems: T[], clearSelection: () => void) => void;
}

interface UnifiedDataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchFields?: (keyof T | string)[];
  loading?: boolean;
  onRefresh?: () => void;
  onExportXLSX?: () => void;
  onExportCSV?: () => void;
  bulkActions?: BulkAction<T>[];
  filterSlot?: React.ReactNode;
  headerActionSlot?: React.ReactNode;
  emptyMessage?: string;
  initialPageSize?: number;
  rowClassName?: (item: T, index: number) => string;
}

export function UnifiedDataGrid<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Поиск по таблице...',
  searchFields,
  loading = false,
  onRefresh,
  onExportXLSX,
  onExportCSV,
  bulkActions = [],
  filterSlot,
  headerActionSlot,
  emptyMessage = 'Данные не найдены',
  initialPageSize = 10,
  rowClassName,
}: UnifiedDataGridProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter items by search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = (item as any)[field];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(term);
        });
      }
      // Fallback: search all primitive values
      return Object.values(item as any).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchFields]);

  // Sort items
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const column = columns.find((c) => c.key === sortConfig.key);
    return [...filteredData].sort((a, b) => {
      let aVal: any = column?.accessor ? column.accessor(a) : (a as any)[sortConfig.key];
      let bVal: any = column?.accessor ? column.accessor(b) : (b as any)[sortConfig.key];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Pagination calculations
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  // Sorting handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null; // reset sort
      }
      return { key, direction: 'asc' };
    });
  };

  // Selection handlers
  const allCurrentKeys = useMemo(
    () => new Set(paginatedData.map((item) => keyExtractor(item))),
    [paginatedData, keyExtractor]
  );

  const isAllCurrentSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedKeys.has(keyExtractor(item)));

  const toggleSelectAllCurrent = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isAllCurrentSelected) {
        allCurrentKeys.forEach((key) => next.delete(key));
      } else {
        allCurrentKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  const toggleSelectRow = (key: string | number) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedKeys(new Set());

  const selectedItems = useMemo(
    () => data.filter((item) => selectedKeys.has(keyExtractor(item))),
    [data, selectedKeys, keyExtractor]
  );

  return (
    <div className="bg-[#12110F] border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Header & Toolbar */}
      <div className="p-5 border-b border-amber-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#181614] via-[#141311] to-[#181614]">
        <div>
          {title && (
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {totalItems}
              </span>
            </div>
          )}
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-[#1C1A18] border border-amber-500/20 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
          </div>

          {filterSlot}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Обновить"
              className="p-2 bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/20 text-neutral-300 hover:text-amber-400 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}

          {/* Export to XLSX Button */}
          {onExportXLSX && (
            <button
              onClick={onExportXLSX}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>
          )}

          {/* Export to CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/20 text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition-all"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              <span>CSV</span>
            </button>
          )}

          {headerActionSlot}
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedKeys.size > 0 && bulkActions.length > 0 && (
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Выбрано элементов: <strong className="text-white">{selectedKeys.size}</strong> из {totalItems}</span>
            <button
              onClick={clearSelection}
              className="text-xs text-neutral-400 hover:text-white underline ml-2 transition-colors"
            >
              Снять выбор
            </button>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => action.onClick(selectedItems, clearSelection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  action.variant === 'danger'
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300'
                    : action.variant === 'gold'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                    : 'bg-[#25221F] hover:bg-[#302B27] border border-amber-500/20 text-neutral-200'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-x-auto min-h-[280px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-amber-500/10 bg-[#171513]">
              {/* Checkbox Header */}
              {bulkActions.length > 0 && (
                <th className="w-10 px-4 py-3.5 text-center">
                  <button
                    onClick={toggleSelectAllCurrent}
                    className="text-neutral-400 hover:text-amber-400 transition-colors"
                  >
                    {isAllCurrentSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.sortable ? 'cursor-pointer select-none hover:text-amber-300 transition-colors' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="flex flex-col">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                            )
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-600 opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-amber-500/5 text-sm">
            {loading ? (
              // Skeleton Loading Rows
              Array.from({ length: Math.min(pageSize, 5) }).map((_, idx) => (
                <tr key={idx} className="animate-pulse bg-[#141210]/40">
                  {bulkActions.length > 0 && <td className="px-4 py-4"><div className="w-4 h-4 bg-neutral-800 rounded" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-4 bg-neutral-800/80 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                  className="px-4 py-16 text-center text-neutral-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-neutral-600 mb-1" />
                    <p className="text-neutral-400 font-medium">{emptyMessage}</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-xs text-amber-400 hover:underline mt-1"
                      >
                        Сбросить фильтр поиска
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => {
                const key = keyExtractor(item);
                const isSelected = selectedKeys.has(key);
                const customClass = rowClassName ? rowClassName(item, rowIdx) : '';

                return (
                  <tr
                    key={key}
                    className={`group transition-colors hover:bg-amber-500/[0.04] ${
                      isSelected ? 'bg-amber-500/[0.08]' : rowIdx % 2 === 1 ? 'bg-[#151311]' : 'bg-[#12110F]'
                    } ${customClass}`}
                  >
                    {/* Checkbox Cell */}
                    {bulkActions.length > 0 && (
                      <td className="w-10 px-4 py-3 text-center">
                        <button
                          onClick={() => toggleSelectRow(key)}
                          className="text-neutral-400 hover:text-amber-400 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((col) => {
                      const cellContent = col.render
                        ? col.render(item, rowIdx)
                        : col.accessor
                        ? col.accessor(item)
                        : (item as any)[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-neutral-300 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {cellContent ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Pagination Bar */}
      <div className="p-4 border-t border-amber-500/10 bg-[#161412] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <span>
            Показано с <strong className="text-white">{totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}</strong> по{' '}
            <strong className="text-white">{Math.min(validCurrentPage * pageSize, totalItems)}</strong> из{' '}
            <strong className="text-white">{totalItems}</strong>
          </span>

          <div className="flex items-center gap-1.5 ml-2 border-l border-neutral-800 pl-3">
            <span>Показывать по:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#1C1A18] border border-amber-500/20 text-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-lg bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Первая страница"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-lg bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Предыдущая"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded-lg">
            {validCurrentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-lg bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Следующая"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-lg bg-[#1C1A18] hover:bg-[#25221F] border border-amber-500/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Последняя страница"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
