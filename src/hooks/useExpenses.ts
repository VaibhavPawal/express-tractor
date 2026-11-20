import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildSampleExpenses,
  CATEGORIES,
  CURRENCY_MAP,
  getCurrentMonthKey,
  getDaysInMonth,
  getElapsedDaysInMonth,
} from '../constants/finance';
import {
  CategorySummaryItem,
  CurrencyCode,
  DailySummaryPoint,
  Expense,
  ExpenseCategoryId,
} from '../types/expense';

const EXPENSES_STORAGE_KEY = 'daybook_expenses_v1';
const PREFS_STORAGE_KEY = 'daybook_prefs_v1';

interface StoredPrefs {
  currency: CurrencyCode;
}

function loadInitialExpenses(): Expense[] {
  try {
    const raw = window.localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (raw === null) {
      const sample = buildSampleExpenses();
      window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(sample));
      return sample;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Expense =>
        item &&
        typeof item.id === 'string' &&
        typeof item.amount === 'number' &&
        Number.isFinite(item.amount) &&
        item.amount > 0 &&
        typeof item.category === 'string' &&
        typeof item.date === 'string',
    );
  } catch {
    return buildSampleExpenses();
  }
}

function loadInitialCurrency(): CurrencyCode {
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return 'USD';
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    if (parsed.currency && parsed.currency in CURRENCY_MAP) {
      return parsed.currency;
    }
    return 'USD';
  } catch {
    return 'USD';
  }
}

export interface NewExpenseInput {
  amount: number;
  category: ExpenseCategoryId;
  date: string;
  note: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadInitialExpenses);
  const [currency, setCurrencyState] = useState<CurrencyCode>(loadInitialCurrency);
  const [activeMonth, setActiveMonth] = useState<string>(getCurrentMonthKey);

  useEffect(() => {
    try {
      window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [expenses]);

  useEffect(() => {
    try {
      const prefs: StoredPrefs = { currency };
      window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [currency]);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
  }, []);

  const addExpense = useCallback((input: NewExpenseInput): Expense => {
    const decimals = CURRENCY_MAP[currency]?.decimals ?? 2;
    const roundedAmount =
      decimals === 0 ? Math.round(input.amount) : Math.round(input.amount * 100) / 100;

    const entry: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: roundedAmount,
      category: input.category,
      date: input.date,
      note: input.note.trim(),
      createdAt: Date.now(),
      isSample: false,
    };

    setExpenses((prev) => [entry, ...prev]);

    const entryMonth = input.date.slice(0, 7);
    if (entryMonth && entryMonth !== activeMonth) {
      setActiveMonth(entryMonth);
    }
    return entry;
  }, [activeMonth, currency]);

  const updateExpense = useCallback(
    (id: string, patch: Partial<NewExpenseInput>) => {
      setExpenses((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextAmount =
            patch.amount !== undefined
              ? Math.round(patch.amount * 100) / 100
              : item.amount;
          return {
            ...item,
            amount: nextAmount,
            category: patch.category ?? item.category,
            date: patch.date ?? item.date,
            note: patch.note !== undefined ? patch.note.trim() : item.note,
            isSample: false,
          };
        }),
      );
    },
    [],
  );

  const deleteExpense = useCallback(
    (id: string): Expense | null => {
      const target = expenses.find((e) => e.id === id) ?? null;
      if (!target) return null;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return target;
    },
    [expenses],
  );

  const restoreExpenses = useCallback((restored: Expense[]) => {
    if (restored.length === 0) return;
    setExpenses((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const toAdd = restored.filter((e) => !existingIds.has(e.id));
      return [...toAdd, ...prev];
    });
  }, []);

  const clearSampleData = useCallback((): Expense[] => {
    const removedSamples = expenses.filter((e) => e.isSample);
    if (removedSamples.length === 0) return [];
    setExpenses((prev) => prev.filter((e) => !e.isSample));
    return removedSamples;
  }, [expenses]);

  const loadSampleData = useCallback(() => {
    const samples = buildSampleExpenses();
    setExpenses((prev) => {
      const nonSample = prev.filter((e) => !e.isSample);
      return [...samples, ...nonSample];
    });
    setActiveMonth(getCurrentMonthKey());
  }, []);

  const hasSampleData = useMemo(
    () => expenses.some((item) => item.isSample),
    [expenses],
  );

  const monthEntries = useMemo(() => {
    return expenses
      .filter((item) => item.date.startsWith(activeMonth))
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      });
  }, [expenses, activeMonth]);

  const totalSpent = useMemo(
    () => monthEntries.reduce((sum, item) => sum + item.amount, 0),
    [monthEntries],
  );

  const entryCount = monthEntries.length;

  const dailyAverage = useMemo(() => {
    if (entryCount === 0) return 0;
    const elapsedDays = getElapsedDaysInMonth(activeMonth);
    return totalSpent / elapsedDays;
  }, [activeMonth, entryCount, totalSpent]);

  const activeSpendingDays = useMemo(() => {
    const unique = new Set(monthEntries.map((item) => item.date));
    return unique.size;
  }, [monthEntries]);

  const categoryBreakdown: CategorySummaryItem[] = useMemo(() => {
    const sums = new Map<ExpenseCategoryId, { total: number; count: number }>();
    for (const entry of monthEntries) {
      const prev = sums.get(entry.category) ?? { total: 0, count: 0 };
      sums.set(entry.category, {
        total: prev.total + entry.amount,
        count: prev.count + 1,
      });
    }

    return CATEGORIES.map((cat) => {
      const stat = sums.get(cat.id) ?? { total: 0, count: 0 };
      return {
        category: cat,
        total: stat.total,
        count: stat.count,
        percentage: totalSpent > 0 ? (stat.total / totalSpent) * 100 : 0,
      };
    })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthEntries, totalSpent]);

  const topCategory = categoryBreakdown[0] ?? null;

  const dailyTotals: DailySummaryPoint[] = useMemo(() => {
    const daysCount = getDaysInMonth(activeMonth);
    const byDate = new Map<string, { total: number; count: number }>();

    for (const entry of monthEntries) {
      const prev = byDate.get(entry.date) ?? { total: 0, count: 0 };
      byDate.set(entry.date, {
        total: prev.total + entry.amount,
        count: prev.count + 1,
      });
    }

    const points: DailySummaryPoint[] = [];
    for (let day = 1; day <= daysCount; day += 1) {
      const iso = `${activeMonth}-${String(day).padStart(2, '0')}`;
      const stat = byDate.get(iso) ?? { total: 0, count: 0 };
      points.push({
        day,
        date: iso,
        total: stat.total,
        count: stat.count,
      });
    }
    return points;
  }, [activeMonth, monthEntries]);

  return {
    expenses,
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
  };
}
