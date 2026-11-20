import {
  CategoryMeta,
  CurrencyCode,
  CurrencyMeta,
  Expense,
  ExpenseCategoryId,
} from '../types/expense';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'groceries',
    label: 'Groceries',
    barColor: '#3D6B59',
    hint: 'Supermarkets, produce, pantry items',
  },
  {
    id: 'dining',
    label: 'Dining',
    barColor: '#5B8472',
    hint: 'Cafes, restaurants, takeout',
  },
  {
    id: 'housing',
    label: 'Housing',
    barColor: '#48606E',
    hint: 'Rent, home upkeep, supplies',
  },
  {
    id: 'bills',
    label: 'Bills',
    barColor: '#6C7D87',
    hint: 'Electricity, internet, phone, water',
  },
  {
    id: 'transport',
    label: 'Transport',
    barColor: '#8B7E66',
    hint: 'Transit pass, fuel, parking, rides',
  },
  {
    id: 'health',
    label: 'Health',
    barColor: '#4C7A74',
    hint: 'Pharmacy, clinic visits, fitness',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    barColor: '#7A6F63',
    hint: 'Clothing, household goods, gifts',
  },
  {
    id: 'leisure',
    label: 'Leisure',
    barColor: '#6D7E5C',
    hint: 'Books, movies, hobbies, outings',
  },
  {
    id: 'other',
    label: 'Other',
    barColor: '#969288',
    hint: 'Everyday miscellaneous spending',
  },
];

export const CATEGORY_MAP: Record<ExpenseCategoryId, CategoryMeta> =
  CATEGORIES.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<ExpenseCategoryId, CategoryMeta>,
  );

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB', decimals: 2 },
  { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN', decimals: 2 },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', locale: 'en-AU', decimals: 2 },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP', decimals: 0 },
];

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyMeta> = CURRENCIES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<CurrencyCode, CurrencyMeta>,
);

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const meta = CURRENCY_MAP[currencyCode] ?? CURRENCY_MAP.USD;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: meta.code,
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(amount);
  } catch {
    return `${meta.symbol}${amount.toFixed(meta.decimals)}`;
  }
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthKey(): string {
  return getTodayIsoDate().slice(0, 7);
}

export function parseMonthKey(monthKey: string): { year: number; monthIndex: number } {
  const [yStr, mStr] = monthKey.split('-');
  const year = Number(yStr) || new Date().getFullYear();
  const monthIndex = Math.max(0, Math.min(11, (Number(mStr) || 1) - 1));
  return { year, monthIndex };
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const shifted = new Date(year, monthIndex + delta, 1);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMonthLabel(monthKey: string): string {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const date = new Date(year, monthIndex, 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDayMonth(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getDaysInMonth(monthKey: string): number {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getDefaultDateForMonth(monthKey: string): string {
  const today = getTodayIsoDate();
  if (today.startsWith(monthKey)) {
    return today;
  }
  return `${monthKey}-01`;
}

export function getElapsedDaysInMonth(monthKey: string): number {
  const totalDays = getDaysInMonth(monthKey);
  const todayKey = getCurrentMonthKey();
  if (monthKey === todayKey) {
    return Math.max(1, new Date().getDate());
  }
  return totalDays;
}

export function buildSampleExpenses(): Expense[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const maxDay = today.getDate();

  const clampDay = (preferred: number) => {
    const safeDay = Math.max(1, Math.min(maxDay, preferred));
    return `${y}-${m}-${String(safeDay).padStart(2, '0')}`;
  };

  const now = Date.now();
  return [
    {
      id: 'sample-1',
      amount: 64.8,
      category: 'groceries',
      date: clampDay(Math.max(1, maxDay)),
      note: 'Weekly fresh produce and pantry staples',
      createdAt: now - 1000,
      isSample: true,
    },
    {
      id: 'sample-2',
      amount: 14.5,
      category: 'dining',
      date: clampDay(Math.max(1, maxDay - 1)),
      note: 'Morning coffee and bakery sandwich',
      createdAt: now - 2000,
      isSample: true,
    },
    {
      id: 'sample-3',
      amount: 42.0,
      category: 'transport',
      date: clampDay(Math.max(1, maxDay - 3)),
      note: 'Metro transit card reload',
      createdAt: now - 3000,
      isSample: true,
    },
    {
      id: 'sample-4',
      amount: 88.25,
      category: 'bills',
      date: clampDay(Math.max(1, maxDay - 5)),
      note: 'Home internet and electric share',
      createdAt: now - 4000,
      isSample: true,
    },
    {
      id: 'sample-5',
      amount: 29.4,
      category: 'health',
      date: clampDay(Math.max(1, maxDay - 7)),
      note: 'Pharmacy essentials',
      createdAt: now - 5000,
      isSample: true,
    },
    {
      id: 'sample-6',
      amount: 51.9,
      category: 'groceries',
      date: clampDay(Math.max(1, maxDay - 9)),
      note: 'Neighborhood market restock',
      createdAt: now - 6000,
      isSample: true,
    },
    {
      id: 'sample-7',
      amount: 24.0,
      category: 'leisure',
      date: clampDay(Math.max(1, maxDay - 11)),
      note: 'Paperback book and museum entry',
      createdAt: now - 7000,
      isSample: true,
    },
  ];
}

export function exportMonthToCsv(
  monthKey: string,
  entries: Expense[],
  currencyCode: CurrencyCode,
): void {
  const escapeCell = (val: string) => {
    const str = String(val ?? '');
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['Date', 'Category', 'Note', `Amount (${currencyCode})`];
  const rows = entries.map((item) => [
    item.date,
    CATEGORY_MAP[item.category]?.label ?? item.category,
    item.note,
    item.amount.toFixed(CURRENCY_MAP[currencyCode]?.decimals ?? 2),
  ]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  rows.push([
    'Monthly Total',
    '',
    `${entries.length} entries`,
    total.toFixed(CURRENCY_MAP[currencyCode]?.decimals ?? 2),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `daybook-${monthKey}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
