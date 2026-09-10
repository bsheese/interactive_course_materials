import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Database, Search, X } from 'lucide-react';
import type { DatasetColumn, DatasetSpec } from '../types';

interface DatasetViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetSpec<any>;
}

const TONE_CLASS = {
  positive: 'text-[#27AE60]',
  negative: 'text-[#C0392B]',
  neutral: 'text-[#333333]',
} as const;

const rawValue = (column: DatasetColumn<any>, row: any): string | number => {
  const value = column.value ? column.value(row) : row[column.key];
  return (value ?? '') as string | number;
};

const displayValue = (column: DatasetColumn<any>, row: any): string => {
  const value = rawValue(column, row);
  return column.format ? column.format(value, row) : String(value);
};

/**
 * Generic table over a module's `DatasetSpec` — search across every column,
 * click any header to sort. Derived columns (deviations, residuals) come from
 * the module via `column.value`, so the kit never learns a unit's vocabulary.
 */
export const DatasetViewerModal: React.FC<DatasetViewerModalProps> = ({
  isOpen,
  onClose,
  dataset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>(dataset.columns[0]?.key ?? '');
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = term
      ? dataset.rows.filter((row) =>
          dataset.columns.some((column) =>
            displayValue(column, row).toLowerCase().includes(term)
          )
        )
      : [...dataset.rows];

    const column = dataset.columns.find((c) => c.key === sortKey);
    if (!column) return filtered;

    return filtered.sort((a, b) => {
      const valA = rawValue(column, a);
      const valB = rawValue(column, b);
      const cmp =
        typeof valA === 'number' && typeof valB === 'number'
          ? valA - valB
          : String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
  }, [dataset, searchTerm, sortKey, sortAsc]);

  if (!isOpen) return null;

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/20 rounded-sm w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 bg-[#ECE8E1] border-b border-[#1A1A1A]/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white rounded-sm border border-[#1A1A1A]/10 shrink-0">
              <Database className="w-5 h-5 text-[#E67E22]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">
                {dataset.title}
              </h2>
              {dataset.description && (
                <p className="text-xs text-[#666666] leading-relaxed">{dataset.description}</p>
              )}
              {dataset.summary && dataset.summary.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {dataset.summary.map((stat) => (
                    <span
                      key={stat.label}
                      className="text-[10px] font-sans text-[#4A4A4A] bg-white px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10"
                    >
                      {stat.label}{' '}
                      <span className="font-mono font-bold text-[#1A1A1A]">{stat.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#767676]" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#1A1A1A]/15 rounded-sm text-xs text-[#1A1A1A] focus:outline-none focus:border-[#E67E22] w-44 shadow-xs"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-[#4A4A4A] hover:text-[#1A1A1A] bg-white hover:bg-[#E2DDD5] border border-[#1A1A1A]/15 transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-auto flex-1 bg-white">
          <table className="w-full text-xs text-left font-mono">
            <thead className="sticky top-0 bg-[#ECE8E1] z-10 border-b border-[#1A1A1A]/15">
              <tr className="text-[#4A4A4A] text-[11px] font-sans">
                {dataset.columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => toggleSort(column.key)}
                    className={`py-2.5 px-2 cursor-pointer hover:text-[#1A1A1A] ${
                      column.numeric ? 'text-right' : ''
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1 font-bold ${
                        column.numeric ? 'justify-end' : ''
                      }`}
                    >
                      {column.label}
                      <ArrowUpDown
                        className={`w-3 h-3 ${sortKey === column.key ? 'text-[#E67E22]' : ''}`}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10 text-[#333333]">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F5F2ED] transition-colors">
                  {dataset.columns.map((column) => {
                    const tone = column.tone?.(rawValue(column, row), row) ?? 'neutral';
                    return (
                      <td
                        key={column.key}
                        className={`py-2 px-2 ${column.numeric ? 'text-right' : ''} ${
                          TONE_CLASS[tone]
                        }`}
                      >
                        {displayValue(column, row)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={dataset.columns.length}
                    className="py-8 text-center text-[#767676] font-sans"
                  >
                    No rows match "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
