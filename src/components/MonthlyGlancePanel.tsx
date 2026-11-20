import { ArrowRight } from 'lucide-react';
import { formatCurrency, formatMonthLabel } from '../constants/finance';
import { CategorySummaryItem, CurrencyCode } from '../types/expense';

interface MonthlyGlancePanelProps {
  activeMonth: string;
  totalSpent: number;
  dailyAverage: number;
  entryCount: number;
  topCategory: CategorySummaryItem | null;
  currency: CurrencyCode;
  onOpenSummary: () => void;
}

export function MonthlyGlancePanel({
  activeMonth,
  totalSpent,
  dailyAverage,
  entryCount,
  topCategory,
  currency,
  onOpenSummary,
}: MonthlyGlancePanelProps) {
  return (
    <section
      aria-labelledby="month-glance-heading"
      className="bg-white border border-[#E6E3DC] rounded-xl p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="month-glance-heading"
          className="text-sm font-medium text-[#5E6661]"
        >
          {formatMonthLabel(activeMonth)} total
        </h2>
        <button
          type="button"
          onClick={onOpenSummary}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#3D6B59] hover:text-[#2F5647] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
        >
          <span>Full summary</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-2 font-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#1F2421] tabular-figures">
        {formatCurrency(totalSpent, currency)}
      </p>

      <div className="mt-5 pt-4 border-t border-[#E6E3DC] grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#5E6661]">Daily average</p>
          <p className="mt-1 font-mono tabular-figures text-sm font-medium text-[#1F2421]">
            {entryCount > 0 ? formatCurrency(dailyAverage, currency) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5E6661]">Top category</p>
          <p className="mt-1 text-sm font-medium text-[#1F2421] truncate">
            {topCategory
              ? `${topCategory.category.label} · ${Math.round(topCategory.percentage)}%`
              : '—'}
          </p>
        </div>
      </div>
    </section>
  );
}
