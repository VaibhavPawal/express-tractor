import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  formatCurrency,
  formatDayMonth,
  formatMonthLabel,
} from '../constants/finance';
import { NewExpenseInput } from '../hooks/useExpenses';
import {
  CategorySummaryItem,
  CurrencyCode,
  DailySummaryPoint,
  Expense,
  ExpenseCategoryId,
} from '../types/expense';
import { ExpenseLedger } from './ExpenseLedger';

interface MonthlySummaryViewProps {
  activeMonth: string;
  entries: Expense[];
  totalSpent: number;
  entryCount: number;
  dailyAverage: number;
  activeSpendingDays: number;
  categoryBreakdown: CategorySummaryItem[];
  topCategory: CategorySummaryItem | null;
  dailyTotals: DailySummaryPoint[];
  currency: CurrencyCode;
  onUpdateExpense: (id: string, patch: Partial<NewExpenseInput>) => void;
  onDeleteExpense: (id: string) => void;
  onLogFirstExpense: () => void;
  onExportCsv: () => void;
}

export function MonthlySummaryView({
  activeMonth,
  entries,
  totalSpent,
  entryCount,
  dailyAverage,
  activeSpendingDays,
  categoryBreakdown,
  topCategory,
  dailyTotals,
  currency,
  onUpdateExpense,
  onDeleteExpense,
  onLogFirstExpense,
  onExportCsv,
}: MonthlySummaryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryId | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DailySummaryPoint | null>(null);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedDate(null);
    setHoveredDay(null);
  }, [activeMonth]);

  const maxDailySpend = useMemo(
    () => Math.max(...dailyTotals.map((d) => d.total), 0),
    [dailyTotals],
  );

  const highestDay = useMemo(() => {
    let best: DailySummaryPoint | null = null;
    for (const point of dailyTotals) {
      if (point.total > 0 && (!best || point.total > best.total)) {
        best = point;
      }
    }
    return best;
  }, [dailyTotals]);

  const filteredStatementEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedCategory && entry.category !== selectedCategory) return false;
      if (selectedDate && entry.date !== selectedDate) return false;
      return true;
    });
  }, [entries, selectedCategory, selectedDate]);

  const activeFilterLabel = useMemo(() => {
    if (selectedCategory) {
      const found = categoryBreakdown.find(
        (c) => c.category.id === selectedCategory,
      );
      return found ? found.category.label : selectedCategory;
    }
    if (selectedDate) {
      return formatDayMonth(selectedDate);
    }
    return null;
  }, [categoryBreakdown, selectedCategory, selectedDate]);

  const inspectedDay = hoveredDay ?? (selectedDate ? dailyTotals.find((d) => d.date === selectedDate) ?? null : null);

  if (entryCount === 0) {
    return (
      <section className="bg-white border border-[#E6E3DC] rounded-xl px-6 py-16 text-center">
        <h2 className="font-editorial text-2xl font-medium text-[#1F2421]">
          Your {formatMonthLabel(activeMonth)} summary is ready when you are
        </h2>
        <p className="text-sm text-[#5E6661] mt-2 max-w-md mx-auto leading-relaxed">
          Once you record expenses in this month, you will see your total spent, category totals, daily spending rhythm, and a complete dated list right here.
        </p>
        <button
          type="button"
          onClick={onLogFirstExpense}
          className="mt-6 inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-semibold text-white bg-[#3D6B59] hover:bg-[#2F5647] rounded-lg transition-colors cursor-pointer"
        >
          Log First Expense
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* 4-Metric Headline Strip */}
      <section
        aria-label="Monthly spending overview"
        className="bg-white border border-[#E6E3DC] rounded-xl overflow-hidden"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E3DC]">
          <div className="p-6">
            <p className="text-sm text-[#5E6661]">Total spent</p>
            <p className="mt-2 font-editorial text-3xl font-medium tracking-tight text-[#1F2421] tabular-figures">
              {formatCurrency(totalSpent, currency)}
            </p>
            <p className="mt-1.5 text-xs text-[#767E79]">
              Across {activeSpendingDays}{' '}
              {activeSpendingDays === 1 ? 'day' : 'days'} with spending
            </p>
          </div>

          <div className="p-6">
            <p className="text-sm text-[#5E6661]">Expenses logged</p>
            <p className="mt-2 font-editorial text-3xl font-medium tracking-tight text-[#1F2421] tabular-figures">
              {entryCount}
            </p>
            <p className="mt-1.5 text-xs text-[#767E79]">
              Every entry saved with its date
            </p>
          </div>

          <div className="p-6 sm:border-t lg:border-t-0 border-[#E6E3DC]">
            <p className="text-sm text-[#5E6661]">Daily average</p>
            <p className="mt-2 font-editorial text-3xl font-medium tracking-tight text-[#1F2421] tabular-figures">
              {formatCurrency(dailyAverage, currency)}
            </p>
            <p className="mt-1.5 text-xs text-[#767E79]">
              Per day across this month
            </p>
          </div>

          <div className="p-6 sm:border-t lg:border-t-0 border-[#E6E3DC]">
            <p className="text-sm text-[#5E6661]">Top category</p>
            <p className="mt-2 font-editorial text-3xl font-medium tracking-tight text-[#1F2421] truncate">
              {topCategory ? topCategory.category.label : '—'}
            </p>
            <p className="mt-1.5 text-xs text-[#767E79] tabular-figures">
              {topCategory
                ? `${formatCurrency(topCategory.total, currency)} · ${Math.round(topCategory.percentage)}% of total`
                : 'No categories yet'}
            </p>
          </div>
        </div>
      </section>

      {/* Visual Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Spending by Category */}
        <section
          aria-labelledby="category-breakdown-heading"
          className="lg:col-span-5 bg-white border border-[#E6E3DC] rounded-xl p-6 flex flex-col"
        >
          <div className="flex items-baseline justify-between gap-2 mb-5">
            <div>
              <h2
                id="category-breakdown-heading"
                className="font-editorial text-xl font-medium text-[#1F2421]"
              >
                Spending by category
              </h2>
              <p className="text-xs text-[#5E6661] mt-0.5">
                Select a category to filter the dated list below
              </p>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-medium text-[#3D6B59] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <ul className="space-y-4 flex-1">
            {categoryBreakdown.map((item) => {
              const isSelected = selectedCategory === item.category.id;
              return (
                <li key={item.category.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedCategory((prev) =>
                        prev === item.category.id ? null : item.category.id,
                      );
                    }}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-2 -mx-2 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBF2EE]/80'
                        : 'hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-[#1F2421] flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden="true"
                          className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                          style={{ backgroundColor: item.category.barColor }}
                        />
                        <span className="truncate">{item.category.label}</span>
                        <span className="text-xs font-normal text-[#767E79] shrink-0">
                          {item.count} {item.count === 1 ? 'entry' : 'entries'}
                        </span>
                      </span>

                      <span className="font-mono tabular-figures text-sm text-[#1F2421] shrink-0">
                        {formatCurrency(item.total, currency)}{' '}
                        <span className="text-xs text-[#767E79]">
                          ({Math.round(item.percentage)}%)
                        </span>
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full bg-[#F1EFE9] rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-200"
                        style={{
                          width: `${Math.max(item.percentage, 2)}%`,
                          backgroundColor: item.category.barColor,
                        }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Daily Spending Rhythm */}
        <section
          aria-labelledby="daily-rhythm-heading"
          className="lg:col-span-7 bg-white border border-[#E6E3DC] rounded-xl p-6 flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
            <div>
              <h2
                id="daily-rhythm-heading"
                className="font-editorial text-xl font-medium text-[#1F2421]"
              >
                Daily spending rhythm
              </h2>
              <p className="text-xs text-[#5E6661] mt-0.5">
                Hover or select any day to inspect its recorded expenses
              </p>
            </div>

            <div className="text-xs font-mono tabular-figures text-[#1F2421] min-h-[20px]">
              {inspectedDay ? (
                <span>
                  {formatDayMonth(inspectedDay.date)} ·{' '}
                  <strong>{formatCurrency(inspectedDay.total, currency)}</strong>
                  {inspectedDay.count > 0
                    ? ` (${inspectedDay.count} ${inspectedDay.count === 1 ? 'entry' : 'entries'})`
                    : ' (no spending)'}
                </span>
              ) : highestDay ? (
                <span className="text-[#5E6661]">
                  Highest day: {formatDayMonth(highestDay.date)} ·{' '}
                  {formatCurrency(highestDay.total, currency)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Responsive Day-by-Day Bar Chart */}
          <div className="mt-4 pt-6 border-t border-[#E6E3DC]">
            <div
              role="group"
              aria-label={`Daily spending for ${formatMonthLabel(activeMonth)}`}
              className="h-52 flex items-end gap-[3px] sm:gap-1"
            >
              {dailyTotals.map((point) => {
                const ratio =
                  maxDailySpend > 0 ? point.total / maxDailySpend : 0;
                const heightPct = point.total > 0 ? Math.max(ratio * 100, 6) : 2;
                const isSelected = selectedDate === point.date;
                const hasSpend = point.total > 0;

                return (
                  <button
                    key={point.date}
                    type="button"
                    onMouseEnter={() => setHoveredDay(point)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onFocus={() => setHoveredDay(point)}
                    onBlur={() => setHoveredDay(null)}
                    onClick={() => {
                      if (!hasSpend) return;
                      setSelectedCategory(null);
                      setSelectedDate((prev) =>
                        prev === point.date ? null : point.date,
                      );
                    }}
                    disabled={!hasSpend}
                    aria-label={`${formatDayMonth(point.date)}: ${formatCurrency(point.total, currency)}`}
                    aria-pressed={isSelected}
                    className={`group relative flex-1 h-full flex flex-col justify-end items-center focus-visible:outline-offset-0 ${
                      hasSpend ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`w-full rounded-t-[2px] transition-colors ${
                        isSelected
                          ? 'bg-[#1F2421]'
                          : hasSpend
                            ? 'bg-[#3D6B59] group-hover:bg-[#2F5647]'
                            : 'bg-[#ECE9E1]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Clean sparse calendar axis */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono tabular-figures text-[#767E79]">
              <span>1</span>
              <span>8</span>
              <span>15</span>
              <span>22</span>
              <span>{dailyTotals.length}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E6E3DC] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5E6661]">
            <span>
              Select any highlighted bar to narrow the dated list below.
            </span>
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 font-medium text-[#3D6B59] hover:text-[#2F5647] hover:underline underline-offset-4 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download {formatMonthLabel(activeMonth)} CSV</span>
            </button>
          </div>
        </section>
      </div>

      {/* Full Dated Monthly Statement */}
      <ExpenseLedger
        title={`${formatMonthLabel(activeMonth)} itemized ledger`}
        subtitle="Every expense in this month with its exact date, category, and amount."
        entries={filteredStatementEntries}
        currency={currency}
        onUpdateExpense={onUpdateExpense}
        onDeleteExpense={onDeleteExpense}
        activeFilterLabel={activeFilterLabel}
        onClearExternalFilter={() => {
          setSelectedCategory(null);
          setSelectedDate(null);
        }}
        showSearchAndFilter={false}
      />
    </div>
  );
}
