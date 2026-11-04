/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Calendar,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Wallet,
  Sparkles,
  PieChart,
  Eye,
} from 'lucide-react';
import { BudgetConfig, Category, Expense, Language } from '../types';
import {
  formatINR,
  getFinancialYearForDate,
  getMonthDateRange,
  getTodayDateString,
  formatDisplayDate,
  getMonthName,
} from '../utils/formatters';
import { t } from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';
import { ExpenseBarChart } from './Charts';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  budgetConfig: BudgetConfig;
  lang: Language;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onViewAllTransactions: () => void;
  onViewCategoryReport: (categoryId: string) => void;
  onOpenDateFilter: (dateStr: string) => void;
  onViewReceipt: (photoUrl: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  categories,
  budgetConfig,
  lang,
  onOpenAddExpense,
  onEditExpense,
  onViewAllTransactions,
  onViewCategoryReport,
  onOpenDateFilter,
  onViewReceipt,
}) => {
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const todayStr = getTodayDateString();
  const [currentYear, currentMonth] = todayStr.split('-').map(Number);

  // 1. Calculations: Today
  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === todayStr);
  }, [expenses, todayStr]);

  const totalToday = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  // 2. Calculations: This Month (Calendar Month)
  const monthRange = useMemo(() => {
    return getMonthDateRange(currentYear, currentMonth - 1);
  }, [currentYear, currentMonth]);

  const thisMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date >= monthRange.start && e.date <= monthRange.end);
  }, [expenses, monthRange]);

  const totalThisMonth = useMemo(() => {
    return thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [thisMonthExpenses]);

  // 3. Calculations: This Financial Year (Apr - Mar)
  const currentFY = useMemo(() => {
    return getFinancialYearForDate(todayStr);
  }, [todayStr]);

  const thisYearExpenses = useMemo(() => {
    const fyStart = `${currentFY}-04-01`;
    const fyEnd = `${currentFY + 1}-03-31`;
    return expenses.filter((e) => e.date >= fyStart && e.date <= fyEnd);
  }, [expenses, currentFY]);

  const totalThisYear = useMemo(() => {
    return thisYearExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [thisYearExpenses]);

  // 4. Calculations: Category-wise spending this month & Highest Category
  const categorySummaryThisMonth = useMemo(() => {
    const totals: Record<string, { category: Category; amount: number; count: number }> = {};
    for (const exp of thisMonthExpenses) {
      const cat = categoriesMap.get(exp.categoryId) || {
        id: exp.categoryId,
        nameEn: 'Other',
        nameHi: 'अन्य',
        icon: 'MoreHorizontal',
        color: '#64748b',
        isDefault: false,
      };

      if (!totals[cat.id]) {
        totals[cat.id] = { category: cat, amount: 0, count: 0 };
      }
      totals[cat.id].amount += exp.amount;
      totals[cat.id].count += 1;
    }

    return Object.values(totals).sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses, categoriesMap]);

  const highestCategory = categorySummaryThisMonth[0] || null;

  // 5. Budget tracking
  const monthlyBudget = budgetConfig.overallMonthlyBudget || 0;
  const remainingBudget = Math.max(0, monthlyBudget - totalThisMonth);
  const budgetUtilization = monthlyBudget > 0 ? (totalThisMonth / monthlyBudget) * 100 : 0;
  const isBudgetWarning = budgetUtilization >= 80 && budgetUtilization <= 100;
  const isBudgetExceeded = totalThisMonth > monthlyBudget && monthlyBudget > 0;

  // 6. Recent 5 Transactions
  const recentTransactions = useMemo(() => {
    return expenses.slice(0, 5);
  }, [expenses]);

  // 7. Monthly Bar Chart Data (Daily totals in the current month)
  const monthlyChartData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dailyMap: Record<number, number> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap[day] = 0;
    }

    for (const exp of thisMonthExpenses) {
      const dayNum = parseInt(exp.date.split('-')[2], 10);
      if (dailyMap[dayNum] !== undefined) {
        dailyMap[dayNum] += exp.amount;
      }
    }

    return Object.entries(dailyMap).map(([day, amount]) => ({
      label: day,
      subLabel: `${getMonthName(currentMonth - 1, lang).slice(0, 3)} ${day}`,
      value: amount,
    }));
  }, [thisMonthExpenses, currentYear, currentMonth, lang]);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Budget Warning Banner if triggered */}
      {isBudgetExceeded ? (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">{t('budgetExceeded', lang)}</p>
              <p className="text-[11px] opacity-90">
                Spent {formatINR(totalThisMonth)} of {formatINR(monthlyBudget)} (+
                {formatINR(totalThisMonth - monthlyBudget)})
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
            {budgetUtilization.toFixed(0)}%
          </span>
        </div>
      ) : isBudgetWarning ? (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">{t('budgetWarning', lang)}</p>
              <p className="text-[11px] opacity-90">
                {formatINR(remainingBudget)} left for {getMonthName(currentMonth - 1, lang)}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-amber-600 text-white px-2 py-0.5 rounded-full">
            {budgetUtilization.toFixed(0)}%
          </span>
        </div>
      ) : null}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Today's Expenses */}
        <div
          onClick={() => onOpenDateFilter(todayStr)}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md relative overflow-hidden cursor-pointer hover:shadow-lg transition group active:scale-[0.99]"
          title="Click to view all expenses for Today"
        >
          <div className="flex items-center justify-between text-emerald-100 text-xs mb-1">
            <span className="font-semibold">{t('todayExpenses', lang)}</span>
            <Calendar className="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight">{formatINR(totalToday)}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-100/90 font-medium">
            <span>{todayExpenses.length} entries today</span>
            <span className="bg-emerald-800/60 px-1.5 py-0.5 rounded text-[10px]">
              {formatDisplayDate(todayStr)}
            </span>
          </div>
        </div>

        {/* Card 2: This Month */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">{t('thisMonthExpenses', lang)}</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatINR(totalThisMonth)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{getMonthName(currentMonth - 1, lang)}</span>
            <span className="font-semibold text-emerald-600">{thisMonthExpenses.length} txns</span>
          </div>
        </div>

        {/* Card 3: Financial Year */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">{t('thisYearExpenses', lang)}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatINR(totalThisYear)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>FY {currentFY}-{String((currentFY + 1) % 100).padStart(2, '0')}</span>
            <span className="font-semibold text-blue-600">{thisYearExpenses.length} txns</span>
          </div>
        </div>

        {/* Card 4: Remaining Budget */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">{t('remainingBudget', lang)}</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <div
            className={`text-xl sm:text-2xl font-black ${
              isBudgetExceeded
                ? 'text-rose-600'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatINR(remainingBudget)}
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isBudgetExceeded ? 'bg-rose-500' : isBudgetWarning ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar: Total Entries & Top Spending Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {t('totalEntries', lang)}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {expenses.length} records
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              All-Time Outflow
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(expenses.reduce((s, e) => s + e.amount, 0))}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {highestCategory ? (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: `${highestCategory.category.color}20`,
                  color: highestCategory.category.color,
                }}
              >
                <CategoryIcon name={highestCategory.category.icon} size={20} />
              </div>
            ) : null}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t('highestCategory', lang)}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {highestCategory
                  ? lang === 'hi'
                    ? highestCategory.category.nameHi
                    : highestCategory.category.nameEn
                  : 'None yet'}
              </span>
            </div>
          </div>
          {highestCategory && (
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatINR(highestCategory.amount)}
            </span>
          )}
        </div>
      </div>

      {/* Monthly Expense Chart Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t('monthlyExpenseChart', lang)}</span>
              <span className="text-xs font-normal text-slate-500">
                ({getMonthName(currentMonth - 1, lang)} {currentYear})
              </span>
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {formatINR(totalThisMonth)}
          </span>
        </div>
        <ExpenseBarChart data={monthlyChartData} height={140} />
      </div>

      {/* Today's Expenses Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('todayList', lang)}
            </h3>
            <span className="text-xs text-slate-500">({todayExpenses.length})</span>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {formatINR(totalToday)}
          </span>
        </div>

        {todayExpenses.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <p className="text-xs">{t('noExpensesToday', lang)}</p>
            <button
              onClick={onOpenAddExpense}
              className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addExpenseBtn', lang)}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {todayExpenses.map((exp) => {
              const cat = categoriesMap.get(exp.categoryId);
              return (
                <div
                  key={exp.id}
                  onClick={() => onEditExpense(exp)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl px-2 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#047857'}15`,
                        color: cat?.color || '#047857',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || 'MoreHorizontal'} size={18} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {exp.description ? exp.description : (lang === 'hi' ? cat?.nameHi : cat?.nameEn) || 'Expense'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {exp.description ? `${lang === 'hi' ? cat?.nameHi : cat?.nameEn} • ` : ''}{exp.paymentMethod}
                        {exp.merchant ? ` • ${exp.merchant}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {exp.receiptPhotoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReceipt(exp.receiptPhotoUrl!);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-600"
                        title="View Receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatINR(exp.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category-wise Expense Summary */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>{t('categorySummary', lang)}</span>
            <span className="text-xs font-normal text-slate-500">
              ({getMonthName(currentMonth - 1, lang)})
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            {categorySummaryThisMonth.length} active
          </span>
        </div>

        {categorySummaryThisMonth.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No category expenses this month</p>
        ) : (
          <div className="space-y-3">
            {categorySummaryThisMonth.slice(0, 6).map((item) => {
              const pct = totalThisMonth > 0 ? (item.amount / totalThisMonth) * 100 : 0;
              const catBudget = budgetConfig.categoryBudgets[item.category.id] || 0;
              const isOverCatBudget = catBudget > 0 && item.amount > catBudget;

              return (
                <div
                  key={item.category.id}
                  onClick={() => onViewCategoryReport(item.category.id)}
                  className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 p-2 rounded-xl transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {lang === 'hi' ? item.category.nameHi : item.category.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-400">({item.count} txns)</span>
                      {isOverCatBudget && (
                        <span className="text-[10px] text-rose-500 font-bold">Over Budget</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatINR(item.amount)}
                      </span>
                      <span className="text-[11px] text-slate-400">({pct.toFixed(1)}%)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.category.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('recentTransactions', lang)}
          </h3>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll', lang)}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <p className="text-xs">{t('noRecentTransactions', lang)}</p>
            <p className="text-[11px] mt-1">{t('addFirstExpense', lang)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentTransactions.map((exp) => {
              const cat = categoriesMap.get(exp.categoryId);
              return (
                <div
                  key={exp.id}
                  onClick={() => onEditExpense(exp)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl px-2 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#047857'}15`,
                        color: cat?.color || '#047857',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || 'MoreHorizontal'} size={18} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {exp.description ? exp.description : (lang === 'hi' ? cat?.nameHi : cat?.nameEn) || 'Expense'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {formatDisplayDate(exp.date)}
                        {exp.description ? ` • ${lang === 'hi' ? cat?.nameHi : cat?.nameEn}` : ''}
                        {exp.paymentMethod ? ` • ${exp.paymentMethod}` : ''}
                        {exp.merchant ? ` • ${exp.merchant}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatINR(exp.amount)}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
