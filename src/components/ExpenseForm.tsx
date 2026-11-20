import React, { useEffect, useState } from 'react';
import {
  CATEGORIES,
  CURRENCY_MAP,
  getDefaultDateForMonth,
  getTodayIsoDate,
} from '../constants/finance';
import { NewExpenseInput } from '../hooks/useExpenses';
import { CurrencyCode, ExpenseCategoryId } from '../types/expense';

interface ExpenseFormProps {
  activeMonth: string;
  currency: CurrencyCode;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  onAddExpense: (input: NewExpenseInput) => void;
}

export function ExpenseForm({
  activeMonth,
  currency,
  amountInputRef,
  onAddExpense,
}: ExpenseFormProps) {
  const [amountRaw, setAmountRaw] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryId>('groceries');
  const [date, setDate] = useState<string>(() => getDefaultDateForMonth(activeMonth));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});

  useEffect(() => {
    setDate((prev) => {
      if (prev.startsWith(activeMonth)) return prev;
      return getDefaultDateForMonth(activeMonth);
    });
  }, [activeMonth]);

  const currencyMeta = CURRENCY_MAP[currency] ?? CURRENCY_MAP.USD;
  const todayIso = getTodayIsoDate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleaned = amountRaw.replace(/,/g, '').trim();
    const numericAmount = Number(cleaned);
    const nextErrors: { amount?: string; date?: string } = {};

    if (!cleaned || Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Enter an amount greater than zero.';
    } else if (numericAmount > 99999999) {
      nextErrors.amount = 'Please enter a smaller amount.';
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      nextErrors.date = 'Choose a valid calendar date.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onAddExpense({
      amount: numericAmount,
      category,
      date,
      note,
    });

    setAmountRaw('');
    setNote('');
    amountInputRef.current?.focus();
  };

  return (
    <section
      aria-labelledby="log-expense-heading"
      className="bg-white border border-[#E6E3DC] rounded-xl p-6"
    >
      <div className="mb-5">
        <h2
          id="log-expense-heading"
          className="font-editorial text-xl font-medium text-[#1F2421]"
        >
          Record an expense
        </h2>
        <p className="text-sm text-[#5E6661] mt-1">
          Log what you spent, pick a category, and keep the date accurate for your monthly summary.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Amount */}
        <div>
          <label
            htmlFor="expense-amount"
            className="block text-sm font-medium text-[#1F2421] mb-1.5"
          >
            Amount
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base text-[#5E6661]"
            >
              {currencyMeta.symbol}
            </span>
            <input
              ref={amountInputRef}
              id="expense-amount"
              name="amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={currencyMeta.decimals === 0 ? '0' : '0.00'}
              value={amountRaw}
              onChange={(e) => {
                setAmountRaw(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
              className={`w-full min-h-[48px] pl-11 pr-4 py-2.5 text-lg font-mono tabular-figures text-[#1F2421] bg-[#FAF9F6] border rounded-lg transition-colors placeholder:text-[#9AA19C] ${
                errors.amount
                  ? 'border-[#B42318] bg-[#FEF3F2]/40'
                  : 'border-[#E6E3DC] focus:bg-white focus:border-[#3D6B59]'
              }`}
            />
          </div>
          {errors.amount && (
            <p
              id="expense-amount-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-[#B42318]"
            >
              {errors.amount}
            </p>
          )}
        </div>

        {/* Category */}
        <fieldset>
          <legend className="block text-sm font-medium text-[#1F2421] mb-2">
            Category
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((item) => {
              const isSelected = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[42px] px-2.5 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap truncate cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF2EE] border-[#3D6B59] text-[#1F2421] font-semibold'
                      : 'bg-white border-[#E6E3DC] text-[#5E6661] hover:border-[#C5D8CE] hover:text-[#1F2421]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-[#767E79]">
            {CATEGORIES.find((c) => c.id === category)?.hint}
          </p>
        </fieldset>

        {/* Date */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="expense-date"
              className="block text-sm font-medium text-[#1F2421]"
            >
              Date
            </label>
            {date !== todayIso && (
              <button
                type="button"
                onClick={() => setDate(todayIso)}
                className="text-xs font-medium text-[#3D6B59] hover:text-[#2F5647] hover:underline underline-offset-4 cursor-pointer"
              >
                Set to today
              </button>
            )}
          </div>
          <input
            id="expense-date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) {
                setErrors((prev) => ({ ...prev, date: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'expense-date-error' : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-figures text-[#1F2421] bg-[#FAF9F6] border rounded-lg transition-colors ${
              errors.date
                ? 'border-[#B42318] bg-[#FEF3F2]/40'
                : 'border-[#E6E3DC] focus:bg-white focus:border-[#3D6B59]'
            }`}
          />
          {errors.date && (
            <p
              id="expense-date-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-[#B42318]"
            >
              {errors.date}
            </p>
          )}
        </div>

        {/* Optional Note */}
        <div>
          <label
            htmlFor="expense-note"
            className="block text-sm font-medium text-[#1F2421] mb-1.5"
          >
            Short note <span className="font-normal text-[#767E79]">(optional)</span>
          </label>
          <input
            id="expense-note"
            name="note"
            type="text"
            maxLength={120}
            placeholder="e.g., Neighborhood market, morning coffee"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 text-sm text-[#1F2421] bg-[#FAF9F6] border border-[#E6E3DC] rounded-lg focus:bg-white focus:border-[#3D6B59] transition-colors placeholder:text-[#9AA19C]"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-[46px] px-5 py-2.5 text-sm font-semibold text-white bg-[#3D6B59] hover:bg-[#2F5647] rounded-lg transition-colors cursor-pointer"
        >
          Save Expense
        </button>
      </form>
    </section>
  );
}
