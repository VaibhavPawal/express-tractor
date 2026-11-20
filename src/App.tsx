/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseLedger } from './components/ExpenseLedger';
import { MonthlyGlancePanel } from './components/MonthlyGlancePanel';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import {
  CATEGORY_MAP,
  exportMonthToCsv,
  formatCurrency,
  formatMonthLabel,
} from './constants/finance';
import { NewExpenseInput, useExpenses } from './hooks/useExpenses';
import { ActiveView, ToastMessage } from './types/expense';

export default function App() {
  const {
    currency,
    setCurrency,
    activeMonth,
    setActiveMonth,
    hasSampleData,
    monthEntries,
    totalSpent,
    entryCount,
    dailyAverage,
    activeSpendingDays,
    categoryBreakdown,
    topCategory,
    dailyTotals,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpenses,
    clearSampleData,
    loadSampleData,
  } = useExpenses();

  const [activeView, setActiveView] = useState<ActiveView>('daily');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (next: Omit<ToastMessage, 'id'>, durationMs = 5000) => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      setToast({ ...next, id: String(Date.now()) });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, durationMs);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const focusExpenseForm = useCallback(() => {
    setActiveView('daily');
    window.requestAnimationFrame(() => {
      amountInputRef.current?.focus();
      amountInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, []);

  const handleAddExpense = useCallback(
    (input: NewExpenseInput) => {
      const saved = addExpense(input);
      const label = CATEGORY_MAP[saved.category]?.label ?? saved.category;
      showToast({
        text: `Saved ${formatCurrency(saved.amount, currency)} in ${label}.`,
        tone: 'success',
      });
    },
    [addExpense, currency, showToast],
  );

  const handleUpdateExpense = useCallback(
    (id: string, patch: Partial<NewExpenseInput>) => {
      updateExpense(id, patch);
      showToast({
        text: 'Expense updated.',
        tone: 'success',
      });
    },
    [showToast, updateExpense],
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      const removed = deleteExpense(id);
      if (!removed) return;
      const label = CATEGORY_MAP[removed.category]?.label ?? removed.category;
      showToast(
        {
          text: `Removed ${formatCurrency(removed.amount, currency)} (${label}).`,
          tone: 'neutral',
          action: {
            label: 'Undo',
            onClick: () => restoreExpenses([removed]),
          },
        },
        6000,
      );
    },
    [currency, deleteExpense, restoreExpenses, showToast],
  );

  const handleClearSampleData = useCallback(() => {
    const removed = clearSampleData();
    if (removed.length === 0) return;
    showToast(
      {
        text: 'Sample entries cleared. Ready for your own expenses.',
        tone: 'neutral',
        action: {
          label: 'Undo',
          onClick: () => restoreExpenses(removed),
        },
      },
      6000,
    );
  }, [clearSampleData, restoreExpenses, showToast]);

  const handleExportCsv = useCallback(() => {
    if (monthEntries.length === 0) return;
    exportMonthToCsv(activeMonth, monthEntries, currency);
    showToast({
      text: `Exported ${formatMonthLabel(activeMonth)} ledger as CSV.`,
      tone: 'success',
    });
  }, [activeMonth, currency, monthEntries, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1F2421]">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onExportCsv={handleExportCsv}
        onQuickAdd={focusExpenseForm}
        canExport={monthEntries.length > 0}
      />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <WorkspaceToolbar
          activeMonth={activeMonth}
          onChangeMonth={setActiveMonth}
          currency={currency}
          onChangeCurrency={setCurrency}
          entryCount={entryCount}
        />

        {/* Optional calm sample-data notice */}
        {hasSampleData && (
          <div className="bg-[#EBF2EE] border border-[#C5D8CE] rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <p className="text-[#1F2421]">
              Showing sample expenses so you can preview how the daily log and monthly summary work.
            </p>
            <button
              type="button"
              onClick={handleClearSampleData}
              className="self-start sm:self-auto font-semibold text-[#2F5647] hover:text-[#1F2421] underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Clear sample data
            </button>
          </div>
        )}

        {activeView === 'daily' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Daily Entry + Month Glance */}
            <div className="lg:col-span-5 space-y-6">
              <ExpenseForm
                activeMonth={activeMonth}
                currency={currency}
                amountInputRef={amountInputRef}
                onAddExpense={handleAddExpense}
              />

              <MonthlyGlancePanel
                activeMonth={activeMonth}
                totalSpent={totalSpent}
                dailyAverage={dailyAverage}
                entryCount={entryCount}
                topCategory={topCategory}
                currency={currency}
                onOpenSummary={() => setActiveView('summary')}
              />
            </div>

            {/* Right Column: Dated Expense Ledger */}
            <div className="lg:col-span-7">
              <ExpenseLedger
                title="Dated expenses"
                subtitle="Every entry shows its date, category, note, and amount."
                entries={monthEntries}
                currency={currency}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onEmptyAction={focusExpenseForm}
                emptyActionLabel="Log First Expense"
              />
            </div>
          </div>
        ) : (
          <MonthlySummaryView
            activeMonth={activeMonth}
            entries={monthEntries}
            totalSpent={totalSpent}
            entryCount={entryCount}
            dailyAverage={dailyAverage}
            activeSpendingDays={activeSpendingDays}
            categoryBreakdown={categoryBreakdown}
            topCategory={topCategory}
            dailyTotals={dailyTotals}
            currency={currency}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onLogFirstExpense={focusExpenseForm}
            onExportCsv={handleExportCsv}
          />
        )}
      </main>

      <footer className="border-t border-[#E6E3DC] mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#767E79]">
          <p>
            Daybook · Everyday personal expense ledger saved locally in your browser
          </p>
          <div className="flex items-center gap-5">
            {!hasSampleData && entryCount === 0 && (
              <button
                type="button"
                onClick={loadSampleData}
                className="text-[#5E6661] hover:text-[#1F2421] hover:underline underline-offset-4 cursor-pointer"
              >
                Load sample month
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={monthEntries.length === 0}
              className={`${
                monthEntries.length > 0
                  ? 'text-[#5E6661] hover:text-[#1F2421] hover:underline underline-offset-4 cursor-pointer'
                  : 'text-[#A0A5A1] cursor-not-allowed'
              }`}
            >
              Export {formatMonthLabel(activeMonth)} CSV
            </button>
          </div>
        </div>
      </footer>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
