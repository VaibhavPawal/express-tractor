import React, { useMemo, useState } from 'react';
import { Check, Pencil, Search, Trash2, X } from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MAP,
  formatCurrency,
  formatShortDate,
} from '../constants/finance';
import { NewExpenseInput } from '../hooks/useExpenses';
import {
  CurrencyCode,
  Expense,
  ExpenseCategoryId,
} from '../types/expense';

interface ExpenseLedgerProps {
  title: string;
  subtitle?: string;
  entries: Expense[];
  currency: CurrencyCode;
  onUpdateExpense: (id: string, patch: Partial<NewExpenseInput>) => void;
  onDeleteExpense: (id: string) => void;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  activeFilterLabel?: string | null;
  onClearExternalFilter?: () => void;
  showSearchAndFilter?: boolean;
}

interface EditDraft {
  date: string;
  category: ExpenseCategoryId;
  note: string;
  amountRaw: string;
}

export function ExpenseLedger({
  title,
  subtitle,
  entries,
  currency,
  onUpdateExpense,
  onDeleteExpense,
  onEmptyAction,
  emptyActionLabel = 'Log First Expense',
  activeFilterLabel = null,
  onClearExternalFilter,
  showSearchAndFilter = true,
}: ExpenseLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryId | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const presentCategories = useMemo(() => {
    const used = new Set(entries.map((e) => e.category));
    return CATEGORIES.filter((cat) => used.has(cat.id));
  }, [entries]);

  const effectiveCategory = useMemo(() => {
    if (selectedCategory === 'all') return 'all';
    return presentCategories.some((cat) => cat.id === selectedCategory)
      ? selectedCategory
      : 'all';
  }, [presentCategories, selectedCategory]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (effectiveCategory !== 'all' && entry.category !== effectiveCategory) {
        return false;
      }
      if (!q) return true;
      const catLabel = CATEGORY_MAP[entry.category]?.label.toLowerCase() ?? '';
      return (
        entry.note.toLowerCase().includes(q) ||
        catLabel.includes(q) ||
        formatShortDate(entry.date).toLowerCase().includes(q) ||
        entry.date.includes(q)
      );
    });
  }, [entries, searchQuery, effectiveCategory]);

  const filteredTotal = useMemo(
    () => filteredEntries.reduce((sum, item) => sum + item.amount, 0),
    [filteredEntries],
  );

  const startEdit = (entry: Expense) => {
    setEditingId(entry.id);
    setDraft({
      date: entry.date,
      category: entry.category,
      note: entry.note,
      amountRaw: String(entry.amount),
    });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setEditError(null);
  };

  const commitEdit = (id: string) => {
    if (!draft) return;
    const numeric = Number(draft.amountRaw.replace(/,/g, '').trim());
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setEditError('Amount must be greater than zero.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      setEditError('Please choose a valid date.');
      return;
    }
    onUpdateExpense(id, {
      date: draft.date,
      category: draft.category,
      note: draft.note,
      amount: numeric,
    });
    cancelEdit();
  };

  const hasLocalFilter = effectiveCategory !== 'all' || searchQuery.trim().length > 0;

  return (
    <section
      aria-labelledby="ledger-heading"
      className="bg-white border border-[#E6E3DC] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-[#E6E3DC]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2
              id="ledger-heading"
              className="font-editorial text-xl font-medium text-[#1F2421]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[#5E6661] mt-0.5">{subtitle}</p>
            )}
          </div>

          {filteredEntries.length > 0 && (
            <div className="text-sm text-[#5E6661] flex items-center gap-2 shrink-0">
              <span>
                {filteredEntries.length}{' '}
                {filteredEntries.length === 1 ? 'entry' : 'entries'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-figures font-medium text-[#1F2421]">
                {formatCurrency(filteredTotal, currency)}
              </span>
            </div>
          )}
        </div>

        {/* External cross-filter indicator (from Monthly Summary chart/category click) */}
        {activeFilterLabel && onClearExternalFilter && (
          <div className="mt-3 pt-3 border-t border-[#E6E3DC] flex items-center justify-between gap-4 text-sm">
            <span className="text-[#5E6661]">
              Showing expenses for{' '}
              <strong className="font-semibold text-[#1F2421]">
                {activeFilterLabel}
              </strong>
            </span>
            <button
              type="button"
              onClick={onClearExternalFilter}
              className="text-sm font-medium text-[#3D6B59] hover:text-[#2F5647] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
            >
              Show all entries
            </button>
          </div>
        )}

        {/* Search + Category Filter Controls */}
        {showSearchAndFilter && entries.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-[#767E79] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by note, category, or date"
                aria-label="Search expenses"
                className="w-full min-h-[40px] pl-10 pr-4 py-2 text-sm text-[#1F2421] bg-[#FAF9F6] border border-[#E6E3DC] rounded-lg focus:bg-white focus:border-[#3D6B59] transition-colors placeholder:text-[#8E9691]"
              />
            </div>

            {presentCategories.length > 1 && (
              <div
                role="group"
                aria-label="Filter by category"
                className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  aria-pressed={effectiveCategory === 'all'}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    effectiveCategory === 'all'
                      ? 'bg-[#1F2421] text-white'
                      : 'bg-[#FAF9F6] text-[#5E6661] hover:text-[#1F2421] hover:bg-[#EFECE5]'
                  }`}
                >
                  All
                </button>
                {presentCategories.map((cat) => {
                  const active = effectiveCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      aria-pressed={active}
                      className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#3D6B59] text-white'
                          : 'bg-[#FAF9F6] text-[#5E6661] hover:text-[#1F2421] hover:bg-[#EFECE5]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {entries.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-editorial text-lg text-[#1F2421]">
            No expenses logged for this month yet
          </p>
          <p className="text-sm text-[#5E6661] mt-1.5 max-w-md mx-auto">
            Add your first purchase with its date and category, and your running ledger and monthly summary will build automatically.
          </p>
          {onEmptyAction && (
            <button
              type="button"
              onClick={onEmptyAction}
              className="mt-5 inline-flex items-center justify-center min-h-[42px] px-5 py-2 text-sm font-semibold text-white bg-[#3D6B59] hover:bg-[#2F5647] rounded-lg transition-colors cursor-pointer"
            >
              {emptyActionLabel}
            </button>
          )}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#1F2421]">
            No matching expenses found
          </p>
          <p className="text-sm text-[#5E6661] mt-1">
            Try clearing your search or category filter to view all entries for this month.
          </p>
          {hasLocalFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 min-h-[40px] px-4 py-2 text-sm font-medium text-[#3D6B59] hover:text-[#2F5647] hover:underline underline-offset-4 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E6E3DC] bg-[#FAF9F6]/70 text-xs font-medium text-[#5E6661]">
                <th scope="col" className="py-3 pl-6 pr-3 whitespace-nowrap">
                  Date
                </th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">
                  Category
                </th>
                <th scope="col" className="py-3 px-3">
                  Note
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-right whitespace-nowrap"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="py-3 pl-2 pr-6 text-right whitespace-nowrap"
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3DC]">
              {filteredEntries.map((entry) => {
                const isEditing = editingId === entry.id && draft !== null;
                const categoryLabel =
                  CATEGORY_MAP[entry.category]?.label ?? entry.category;

                if (isEditing && draft) {
                  return (
                    <tr key={entry.id} className="bg-[#FAF9F6]">
                      <td colSpan={5} className="p-4 sm:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                          <div className="sm:col-span-3">
                            <label className="block text-xs text-[#5E6661] mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={draft.date}
                              onChange={(e) =>
                                setDraft({ ...draft, date: e.target.value })
                              }
                              className="w-full min-h-[40px] px-2.5 py-1.5 text-sm font-mono tabular-figures bg-white border border-[#D5D0C6] rounded-md"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-xs text-[#5E6661] mb-1">
                              Category
                            </label>
                            <select
                              value={draft.category}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  category: e.target.value as ExpenseCategoryId,
                                })
                              }
                              className="w-full min-h-[40px] px-2.5 py-1.5 text-sm bg-white border border-[#D5D0C6] rounded-md"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-4">
                            <label className="block text-xs text-[#5E6661] mb-1">
                              Note
                            </label>
                            <input
                              type="text"
                              value={draft.note}
                              maxLength={120}
                              placeholder="Optional note"
                              onChange={(e) =>
                                setDraft({ ...draft, note: e.target.value })
                              }
                              className="w-full min-h-[40px] px-2.5 py-1.5 text-sm bg-white border border-[#D5D0C6] rounded-md"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs text-[#5E6661] mb-1">
                              Amount
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={draft.amountRaw}
                              onChange={(e) =>
                                setDraft({ ...draft, amountRaw: e.target.value })
                              }
                              className="w-full min-h-[40px] px-2.5 py-1.5 text-sm font-mono tabular-figures bg-white border border-[#D5D0C6] rounded-md"
                            />
                          </div>
                        </div>

                        {editError && (
                          <p
                            role="alert"
                            className="mt-2 text-xs font-medium text-[#B42318]"
                          >
                            {editError}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-medium text-[#5E6661] hover:text-[#1F2421] bg-white border border-[#E6E3DC] rounded-md cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => commitEdit(entry.id)}
                            className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3D6B59] hover:bg-[#2F5647] rounded-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Save</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={entry.id}
                    className="group hover:bg-[#FAF9F6]/80 transition-colors"
                  >
                    <td className="py-3.5 pl-6 pr-3 text-sm font-mono tabular-figures text-[#5E6661] whitespace-nowrap">
                      {formatShortDate(entry.date)}
                    </td>
                    <td className="py-3.5 px-3 text-sm font-medium text-[#1F2421] whitespace-nowrap">
                      {categoryLabel}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-[#5E6661] max-w-[260px] truncate">
                      {entry.note ? (
                        entry.note
                      ) : (
                        <span className="text-[#9AA19C]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-sm font-mono tabular-figures font-medium text-[#1F2421] text-right whitespace-nowrap">
                      {formatCurrency(entry.amount, currency)}
                    </td>
                    <td className="py-2 pl-2 pr-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(entry)}
                          aria-label={`Edit ${categoryLabel} expense on ${formatShortDate(entry.date)}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[#767E79] hover:text-[#1F2421] hover:bg-[#EFECE5] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(entry.id)}
                          aria-label={`Delete ${categoryLabel} expense on ${formatShortDate(entry.date)}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[#767E79] hover:text-[#B42318] hover:bg-[#FEF3F2] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
