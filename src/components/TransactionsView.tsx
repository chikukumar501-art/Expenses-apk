/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Trash2,
  Edit2,
  Eye,
  Plus,
  Tag,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Category, Expense, Language, PaymentMethod } from '../types';
import { formatDisplayDate, formatINR, getTodayDateString } from '../utils/formatters';
import { t } from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsViewProps {
  expenses: Expense[];
  categories: Category[];
  lang: Language;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddExpense: (initialDate?: string) => void;
  onViewReceipt: (photoUrl: string) => void;
  onExportCSV: (filtered: Expense[]) => void;
  onExportPDF: (filtered: Expense[]) => void;
  initialDate?: string;
}

type SortField = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  expenses,
  categories,
  lang,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
  onViewReceipt,
  onExportCSV,
  onExportPDF,
  initialDate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || ''); // Single date filter
  const [sortBy, setSortBy] = useState<SortField>('date_desc');
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate !== undefined) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search filter (description, merchant, tag, category name)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((e) => {
        const cat = categoriesMap.get(e.categoryId);
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchMerchant = e.merchant?.toLowerCase().includes(q);
        const matchTag = e.tags?.some((t) => t.toLowerCase().includes(q));
        const matchCat =
          cat?.nameEn.toLowerCase().includes(q) || cat?.nameHi.toLowerCase().includes(q);
        return matchDesc || matchMerchant || matchTag || matchCat;
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.categoryId === selectedCategory);
    }

    // Payment method filter
    if (selectedPaymentMethod !== 'all') {
      result = result.filter((e) => e.paymentMethod === selectedPaymentMethod);
    }

    // Specific Date filter
    if (selectedDate) {
      result = result.filter((e) => e.date === selectedDate);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        case 'date_asc':
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [
    expenses,
    searchTerm,
    selectedCategory,
    selectedPaymentMethod,
    selectedDate,
    sortBy,
    categoriesMap,
  ]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Category breakdown for selected specific date if active
  const dateCategoryBreakdown = useMemo(() => {
    if (!selectedDate) return null;
    const catMap: Record<string, { cat: Category; amount: number; count: number }> = {};
    for (const exp of filteredExpenses) {
      const cat = categoriesMap.get(exp.categoryId) || {
        id: exp.categoryId,
        nameEn: 'Other',
        nameHi: 'अन्य',
        icon: 'MoreHorizontal',
        color: '#64748b',
        isDefault: false,
      };
      if (!catMap[cat.id]) {
        catMap[cat.id] = { cat, amount: 0, count: 0 };
      }
      catMap[cat.id].amount += exp.amount;
      catMap[cat.id].count += 1;
    }
    return Object.values(catMap).sort((a, b) => b.amount - a.amount);
  }, [selectedDate, filteredExpenses, categoriesMap]);

  const handleConfirmDelete = () => {
    if (deleteCandidateId) {
      onDeleteExpense(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('transactionsTitle', lang)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('showingResults', lang, {
              count: filteredExpenses.length,
              total: formatINR(totalFilteredAmount),
            })}
          </p>
        </div>

        {/* Quick export actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExportCSV(filteredExpenses)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 shadow-2xs"
            title="Export filtered list to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => onExportPDF(filteredExpenses)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 shadow-2xs"
            title="Generate PDF report"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => onOpenAddExpense(selectedDate || undefined)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addExpenseBtn', lang)}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder', lang)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Row: Category, Payment Method, Single Date, Sort */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">{t('filterCategory', lang)}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'hi' ? c.nameHi : c.nameEn}
            </option>
          ))}
        </select>

        {/* Payment Method Dropdown */}
        <select
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">{t('filterPaymentMethod', lang)}</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>

        {/* Date Filter (Single date picker for Date-wise Expense Management) */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            title="Filter by specific date"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              title="Clear date"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
          className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="date_desc">{t('sortDateDesc', lang)}</option>
          <option value="date_asc">{t('sortDateAsc', lang)}</option>
          <option value="amount_desc">{t('sortAmountDesc', lang)}</option>
          <option value="amount_asc">{t('sortAmountAsc', lang)}</option>
        </select>
      </div>

      {/* Date-wise Prominent Summary Banner (if a single date is selected) */}
      {selectedDate && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {t('totalOnDate', lang)} ({formatDisplayDate(selectedDate)})
              </span>
            </div>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
              {formatINR(totalFilteredAmount)}
            </span>
          </div>

          {dateCategoryBreakdown && dateCategoryBreakdown.length > 0 && (
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                {t('categorySpendingOnDate', lang)}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dateCategoryBreakdown.map((item) => (
                  <span
                    key={item.cat.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-emerald-200 dark:border-emerald-800"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.cat.color }}
                    />
                    <span>{lang === 'hi' ? item.cat.nameHi : item.cat.nameEn}:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300">
                      {formatINR(item.amount)}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedDate ? t('noExpensesOnDate', lang) : 'No transactions match your search/filters'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding an entry</p>
            <button
              onClick={() => onOpenAddExpense(selectedDate || undefined)}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              + {t('addExpenseBtn', lang)}
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const cat = categoriesMap.get(exp.categoryId);
            const isSavings = exp.categoryId === 'cat_savings';

            return (
              <div
                key={exp.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-emerald-500/40 transition flex items-center justify-between gap-3 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 truncate flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${cat?.color || '#047857'}18`,
                      color: cat?.color || '#047857',
                    }}
                  >
                    <CategoryIcon name={cat?.icon || 'MoreHorizontal'} size={20} />
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {exp.description ? exp.description : (lang === 'hi' ? cat?.nameHi : cat?.nameEn) || 'Expense'}
                      </p>
                      {isSavings && (
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          SIP / Asset
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {exp.description && (
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {lang === 'hi' ? cat?.nameHi : cat?.nameEn} •{' '}
                        </span>
                      )}
                      <span>{formatDisplayDate(exp.date)}</span>
                      {exp.time && <span> {exp.time}</span>}
                      <span> • {exp.paymentMethod}</span>
                      {exp.merchant && <span className="italic"> • {exp.merchant}</span>}
                    </p>

                    {/* Tags */}
                    {exp.tags && exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exp.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Quick Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {formatINR(exp.amount)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-100 dark:border-slate-700">
                    {exp.receiptPhotoUrl && (
                      <button
                        onClick={() => onViewReceipt(exp.receiptPhotoUrl!)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title={t('viewReceipt', lang)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title={t('edit', lang)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidateId(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title={t('delete', lang)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('deleteConfirmTitle', lang)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5">
              {t('deleteConfirmMessage', lang)}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs"
              >
                {t('confirmDeleteBtn', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
