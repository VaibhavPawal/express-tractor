import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CURRENCIES,
  formatMonthLabel,
  getCurrentMonthKey,
  shiftMonthKey,
} from '../constants/finance';
import { CurrencyCode } from '../types/expense';

interface WorkspaceToolbarProps {
  activeMonth: string;
  onChangeMonth: (monthKey: string) => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  entryCount: number;
}

export function WorkspaceToolbar({
  activeMonth,
  onChangeMonth,
  currency,
  onChangeCurrency,
  entryCount,
}: WorkspaceToolbarProps) {
  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = activeMonth === currentMonthKey;

  return (
    <section
      aria-label="Month and currency controls"
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E6E3DC]"
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonthKey(activeMonth, -1))}
            aria-label="Previous month"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E6E3DC] bg-white text-[#1F2421] hover:border-[#C5D8CE] hover:bg-[#EBF2EE]/50 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#1F2421] px-2">
            {formatMonthLabel(activeMonth)}
          </h1>

          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonthKey(activeMonth, 1))}
            aria-label="Next month"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E6E3DC] bg-white text-[#1F2421] hover:border-[#C5D8CE] hover:bg-[#EBF2EE]/50 transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => onChangeMonth(currentMonthKey)}
              className="ml-1 px-3 min-h-[40px] text-sm font-medium text-[#3D6B59] hover:text-[#2F5647] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              This month
            </button>
          )}
        </div>

        <p className="text-sm text-[#5E6661] flex flex-wrap items-center gap-2">
          <span>
            {entryCount === 0
              ? 'No expenses recorded yet'
              : `${entryCount} ${entryCount === 1 ? 'expense' : 'expenses'} recorded`}
          </span>
          <span aria-hidden="true">·</span>
          <span>Saved privately on this device</span>
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-end">
        <label
          htmlFor="currency-selector"
          className="text-sm font-medium text-[#5E6661] whitespace-nowrap"
        >
          Currency
        </label>
        <select
          id="currency-selector"
          value={currency}
          onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
          className="min-h-[40px] px-3 py-2 text-sm font-medium text-[#1F2421] bg-white border border-[#E6E3DC] rounded-lg hover:border-[#C5D8CE] transition-colors cursor-pointer"
        >
          {CURRENCIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
