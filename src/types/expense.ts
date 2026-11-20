export type ExpenseCategoryId =
  | 'groceries'
  | 'dining'
  | 'housing'
  | 'transport'
  | 'bills'
  | 'health'
  | 'shopping'
  | 'leisure'
  | 'other';

export interface CategoryMeta {
  id: ExpenseCategoryId;
  label: string;
  barColor: string;
  hint: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
  decimals: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategoryId;
  /** Local ISO calendar date string: YYYY-MM-DD */
  date: string;
  note: string;
  createdAt: number;
  isSample?: boolean;
}

export type ActiveView = 'daily' | 'summary';

export interface CategorySummaryItem {
  category: CategoryMeta;
  total: number;
  count: number;
  percentage: number;
}

export interface DailySummaryPoint {
  day: number;
  date: string;
  total: number;
  count: number;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'neutral' | 'error';
  action?: ToastAction;
}
