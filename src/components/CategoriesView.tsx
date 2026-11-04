/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Wallet,
} from 'lucide-react';
import { Category, Expense, Language } from '../types';
import { formatDisplayDate, formatINR } from '../utils/formatters';
import { t } from '../utils/translations';
import { CategoryIcon, AVAILABLE_ICONS } from './CategoryIcon';

interface CategoriesViewProps {
  categories: Category[];
  expenses: Expense[];
  lang: Language;
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onViewCategoryReport: (categoryId: string) => void;
  onOpenAddExpenseWithCategory: (categoryId: string) => void;
}

const COLOR_PALETTE = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#64748b', // slate
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  expenses,
  lang,
  onSaveCategory,
  onDeleteCategory,
  onViewCategoryReport,
  onOpenAddExpenseWithCategory,
}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Modal State for Add / Edit Category
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [icon, setIcon] = useState('ShoppingCart');
  const [color, setColor] = useState('#10b981');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteWarningMsg, setDeleteWarningMsg] = useState('');

  // Calculate stats for all categories
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number; items: Expense[] }>();

    for (const cat of categories) {
      map.set(cat.id, { total: 0, count: 0, items: [] });
    }

    for (const exp of expenses) {
      const stat = map.get(exp.categoryId);
      if (stat) {
        stat.total += exp.amount;
        stat.count += 1;
        stat.items.push(exp);
      }
    }

    return map;
  }, [categories, expenses]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setNameEn('');
    setNameHi('');
    setIcon('ShoppingCart');
    setColor('#10b981');
    setMonthlyBudget('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNameEn(cat.nameEn);
    setNameHi(cat.nameHi);
    setIcon(cat.icon);
    setColor(cat.color);
    setMonthlyBudget(cat.monthlyBudget ? cat.monthlyBudget.toString() : '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setErrorMsg('Category name in English is required.');
      return;
    }

    const newCategory: Category = {
      id: editingCategory ? editingCategory.id : `cat_custom_${Date.now()}`,
      nameEn: nameEn.trim(),
      nameHi: nameHi.trim() || nameEn.trim(),
      icon,
      color,
      isDefault: editingCategory ? editingCategory.isDefault : false,
      monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
    };

    onSaveCategory(newCategory);
    setIsModalOpen(false);
  };

  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);

  const handleDeleteClick = (cat: Category) => {
    const stat = categoryStats.get(cat.id);
    const count = stat ? stat.count : 0;

    // Requirement 4: Prevent accidental deletion of categories containing expense records!
    if (count > 0) {
      setDeleteWarningMsg(t('categoryHasExpensesAlert', lang, { count }));
      return;
    }

    setConfirmDeleteCat(cat);
  };

  const handleConfirmDeleteCategory = () => {
    if (confirmDeleteCat) {
      onDeleteCategory(confirmDeleteCat.id);
      setConfirmDeleteCat(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCategoryId(expandedCategoryId === id ? null : id);
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Header and Add Category Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('categoriesTitle', lang)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {categories.length} categories active ({categories.filter((c) => !c.isDefault).length} custom)
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewCategory', lang)}</span>
        </button>
      </div>

      {/* Deletion Warning Dialog */}
      {deleteWarningMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Deletion Blocked</p>
              <p className="mt-0.5">{deleteWarningMsg}</p>
            </div>
          </div>
          <button
            onClick={() => setDeleteWarningMsg('')}
            className="text-rose-600 hover:text-rose-800 font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Accordion / Grid */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const stat = categoryStats.get(cat.id) || { total: 0, count: 0, items: [] };
          const isExpanded = expandedCategoryId === cat.id;
          const displayName = lang === 'hi' ? cat.nameHi : cat.nameEn;

          return (
            <div
              key={cat.id}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs transition"
            >
              {/* Category Card Header */}
              <div
                onClick={() => toggleExpand(cat.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {displayName}
                      </h3>
                      {cat.isDefault ? (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                          {t('defaultBadge', lang)}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          {t('customBadge', lang)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {stat.count} {t('txCount', lang).toLowerCase()}
                      {cat.monthlyBudget && ` • Budget: ${formatINR(cat.monthlyBudget)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {formatINR(stat.total)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t('totalSpent', lang)}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Category Expanded View with Individual Entries & Actions */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                  {/* Category Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewCategoryReport(cat.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Analytics Report</span>
                      </button>
                      <button
                        onClick={() => onOpenAddExpenseWithCategory(cat.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add for this category</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs flex items-center gap-1"
                        title={t('editCategory', lang)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('edit', lang)}</span>
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                          title={t('deleteCategory', lang)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('delete', lang)}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Individual Expense Entries List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {t('individualEntries', lang)} ({stat.items.length})
                    </h4>

                    {stat.items.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        No expenses logged for {displayName} yet.
                      </p>
                    ) : (
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60 max-h-56 overflow-y-auto">
                        {stat.items.map((exp) => (
                          <div
                            key={exp.id}
                            className="p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="truncate pr-2">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {exp.description ? exp.description : displayName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {formatDisplayDate(exp.date)} • {exp.paymentMethod}
                                {exp.merchant ? ` • ${exp.merchant}` : ''}
                              </p>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0">
                              {formatINR(exp.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCategory ? t('editCategory', lang) : t('addNewCategory', lang)}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 pt-3">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('categoryNameEn', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Gym & Fitness, House Maid, Education..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('categoryNameHi', lang)}
                </label>
                <input
                  type="text"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  placeholder="उदा. जिम और फिटनेस, नौकरानी, शिक्षा..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('categoryIcon', lang)}
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {AVAILABLE_ICONS.map((icName) => (
                    <button
                      key={icName}
                      type="button"
                      onClick={() => setIcon(icName)}
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        icon === icName
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CategoryIcon name={icName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('categoryColor', lang)}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-emerald-500 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Monthly Budget */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('categoryBudget', lang)}
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="₹ 5,000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs"
                >
                  {t('saveCategory', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Deletion Confirmation Modal */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Custom Category?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete &ldquo;{lang === 'hi' ? confirmDeleteCat.nameHi : confirmDeleteCat.nameEn}&rdquo;?
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCat(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t('cancel', lang)}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
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
