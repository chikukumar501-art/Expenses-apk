/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Category, Expense, Language, ReportPeriod } from '../types';
import {
  formatINR,
  formatDisplayDate,
  getMonthName,
  getAllMonthNames,
  getMonthDateRange,
  getFinancialYearForDate,
  formatFinancialYearLabel,
  getAccurateQuarterRange,
  getTodayDateString,
  getFinancialYearDateRange,
} from '../utils/formatters';
import { t } from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';
import { CategoryPieChart, ExpenseBarChart, DailySpendingLineChart } from './Charts';

interface ReportsViewProps {
  expenses: Expense[];
  categories: Category[];
  lang: Language;
  onExportCSV: (filtered: Expense[], label: string) => void;
  onExportExcel: (filtered: Expense[], label: string) => void;
  onExportPDF: (filtered: Expense[], label: string) => void;
  initialCategoryId?: string | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  categories,
  lang,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  initialCategoryId,
}) => {
  const [activeTab, setActiveTab] = useState<ReportPeriod>(
    initialCategoryId ? 'category' : 'monthly'
  );

  const today = getTodayDateString();
  const [todayYear, todayMonth] = today.split('-').map(Number);

  // Categories map
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Available Years from data
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    set.add(todayYear);
    expenses.forEach((e) => {
      const y = parseInt(e.date.split('-')[0], 10);
      if (!isNaN(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [expenses, todayYear]);

  // Available Financial Years
  const availableFYs = useMemo(() => {
    const set = new Set<number>();
    set.add(getFinancialYearForDate(today));
    expenses.forEach((e) => {
      set.add(getFinancialYearForDate(e.date));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [expenses, today]);

  // ----------------------------------------------------
  // 1. MONTHLY REPORT STATE
  // ----------------------------------------------------
  const [selectedMonthYear, setSelectedMonthYear] = useState<number>(todayYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(todayMonth - 1); // 0-indexed

  const monthlyReport = useMemo(() => {
    const range = getMonthDateRange(selectedMonthYear, selectedMonthIndex);
    const prevMonthIdx = selectedMonthIndex === 0 ? 11 : selectedMonthIndex - 1;
    const prevYear = selectedMonthIndex === 0 ? selectedMonthYear - 1 : selectedMonthYear;
    const prevRange = getMonthDateRange(prevYear, prevMonthIdx);

    const currentMonthExpenses = expenses.filter(
      (e) => e.date >= range.start && e.date <= range.end
    );
    const prevMonthExpenses = expenses.filter(
      (e) => e.date >= prevRange.start && e.date <= prevRange.end
    );

    const currentTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const prevTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);

    // Difference %
    const diffPct =
      prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : currentTotal > 0 ? 100 : 0;

    // Daily breakdown & highest spending day
    const daysInMonth = new Date(selectedMonthYear, selectedMonthIndex + 1, 0).getDate();
    const dayTotals: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) dayTotals[d] = 0;

    currentMonthExpenses.forEach((e) => {
      const d = parseInt(e.date.split('-')[2], 10);
      dayTotals[d] = (dayTotals[d] || 0) + e.amount;
    });

    let highestDay = 1;
    let highestDayAmount = 0;
    Object.entries(dayTotals).forEach(([day, amount]) => {
      if (amount > highestDayAmount) {
        highestDayAmount = amount;
        highestDay = parseInt(day, 10);
      }
    });

    // Category breakdown
    const catMap: Record<string, { cat: Category; amount: number; count: number }> = {};
    currentMonthExpenses.forEach((e) => {
      const cat = categoriesMap.get(e.categoryId) || {
        id: e.categoryId,
        nameEn: 'Other',
        nameHi: 'अन्य',
        icon: 'MoreHorizontal',
        color: '#64748b',
        isDefault: false,
      };
      if (!catMap[cat.id]) catMap[cat.id] = { cat, amount: 0, count: 0 };
      catMap[cat.id].amount += e.amount;
      catMap[cat.id].count += 1;
    });

    const categoryList = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    const topCategory = categoryList[0] || null;

    const dailyChartData = Object.entries(dayTotals).map(([day, val]) => ({
      label: day,
      subLabel: `${getMonthName(selectedMonthIndex, lang).slice(0, 3)} ${day}`,
      value: val,
    }));

    const pieData = categoryList.map((item) => ({
      id: item.cat.id,
      label: lang === 'hi' ? item.cat.nameHi : item.cat.nameEn,
      value: item.amount,
      color: item.cat.color,
      count: item.count,
    }));

    return {
      expenses: currentMonthExpenses,
      currentTotal,
      prevTotal,
      diffPct,
      highestDay,
      highestDayAmount,
      topCategory,
      dailyAverage: daysInMonth > 0 ? currentTotal / daysInMonth : 0,
      dailyChartData,
      categoryList,
      pieData,
      rangeLabel: `${getMonthName(selectedMonthIndex, lang)} ${selectedMonthYear}`,
    };
  }, [selectedMonthYear, selectedMonthIndex, expenses, categoriesMap, lang]);

  // ----------------------------------------------------
  // 2. QUARTERLY REPORT STATE
  // ----------------------------------------------------
  const [selectedFY, setSelectedFY] = useState<number>(getFinancialYearForDate(today));
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);

  const quarterlyReport = useMemo(() => {
    const qRange = getAccurateQuarterRange(selectedFY, selectedQuarter);
    const qExpenses = expenses.filter((e) => e.date >= qRange.start && e.date <= qRange.end);
    const totalQuarter = qExpenses.reduce((s, e) => s + e.amount, 0);

    // Month-wise breakdown within quarter (3 months)
    const monthOffsets =
      selectedQuarter === 1
        ? [3, 4, 5] // Apr, May, Jun
        : selectedQuarter === 2
        ? [6, 7, 8] // Jul, Aug, Sep
        : selectedQuarter === 3
        ? [9, 10, 11] // Oct, Nov, Dec
        : [0, 1, 2]; // Jan, Feb, Mar (next calendar year)

    const monthBarData = monthOffsets.map((mIdx) => {
      const year = selectedQuarter === 4 ? selectedFY + 1 : selectedFY;
      const mRange = getMonthDateRange(year, mIdx);
      const mExpenses = expenses.filter((e) => e.date >= mRange.start && e.date <= mRange.end);
      const total = mExpenses.reduce((s, e) => s + e.amount, 0);
      return {
        label: getMonthName(mIdx, lang).slice(0, 3),
        subLabel: `${year}`,
        value: total,
      };
    });

    // Category breakdown
    const catMap: Record<string, { cat: Category; amount: number; count: number }> = {};
    qExpenses.forEach((e) => {
      const cat = categoriesMap.get(e.categoryId) || {
        id: e.categoryId,
        nameEn: 'Other',
        nameHi: 'अन्य',
        icon: 'MoreHorizontal',
        color: '#64748b',
        isDefault: false,
      };
      if (!catMap[cat.id]) catMap[cat.id] = { cat, amount: 0, count: 0 };
      catMap[cat.id].amount += e.amount;
      catMap[cat.id].count += 1;
    });

    const categoryList = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    const pieData = categoryList.map((item) => ({
      id: item.cat.id,
      label: lang === 'hi' ? item.cat.nameHi : item.cat.nameEn,
      value: item.amount,
      color: item.cat.color,
      count: item.count,
    }));

    return {
      expenses: qExpenses,
      totalQuarter,
      monthBarData,
      categoryList,
      pieData,
      rangeLabel: `${lang === 'hi' ? qRange.labelHi : qRange.labelEn} (${formatFinancialYearLabel(
        selectedFY
      )})`,
    };
  }, [selectedFY, selectedQuarter, expenses, categoriesMap, lang]);

  // ----------------------------------------------------
  // 3. YEARLY REPORT STATE
  // ----------------------------------------------------
  const [selectedYearlyFY, setSelectedYearlyFY] = useState<number>(getFinancialYearForDate(today));

  const yearlyReport = useMemo(() => {
    const fyRange = getFinancialYearDateRange(selectedYearlyFY);
    const yExpenses = expenses.filter((e) => e.date >= fyRange.start && e.date <= fyRange.end);
    const totalYear = yExpenses.reduce((s, e) => s + e.amount, 0);

    // 12 months in Indian FY: Apr (3), May (4) ... Dec (11), Jan (0), Feb (1), Mar (2)
    const fyMonths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2];
    let highestMonthIdx = 3;
    let highestMonthAmount = 0;

    const monthlyTrendData = fyMonths.map((mIdx) => {
      const yr = mIdx < 3 ? selectedYearlyFY + 1 : selectedYearlyFY;
      const mRange = getMonthDateRange(yr, mIdx);
      const mExp = expenses.filter((e) => e.date >= mRange.start && e.date <= mRange.end);
      const mTotal = mExp.reduce((s, e) => s + e.amount, 0);

      if (mTotal > highestMonthAmount) {
        highestMonthAmount = mTotal;
        highestMonthIdx = mIdx;
      }

      return {
        label: getMonthName(mIdx, lang).slice(0, 3),
        subLabel: `${yr}`,
        value: mTotal,
      };
    });

    // Category breakdown
    const catMap: Record<string, { cat: Category; amount: number; count: number }> = {};
    yExpenses.forEach((e) => {
      const cat = categoriesMap.get(e.categoryId) || {
        id: e.categoryId,
        nameEn: 'Other',
        nameHi: 'अन्य',
        icon: 'MoreHorizontal',
        color: '#64748b',
        isDefault: false,
      };
      if (!catMap[cat.id]) catMap[cat.id] = { cat, amount: 0, count: 0 };
      catMap[cat.id].amount += e.amount;
      catMap[cat.id].count += 1;
    });

    const categoryList = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    const pieData = categoryList.map((item) => ({
      id: item.cat.id,
      label: lang === 'hi' ? item.cat.nameHi : item.cat.nameEn,
      value: item.amount,
      color: item.cat.color,
      count: item.count,
    }));

    return {
      expenses: yExpenses,
      totalYear,
      averageMonthly: totalYear / 12,
      highestMonthName: getMonthName(highestMonthIdx, lang),
      highestMonthAmount,
      monthlyTrendData,
      categoryList,
      pieData,
      rangeLabel: formatFinancialYearLabel(selectedYearlyFY),
    };
  }, [selectedYearlyFY, expenses, categoriesMap, lang]);

  // ----------------------------------------------------
  // 4. CUSTOM DATE RANGE REPORT STATE
  // ----------------------------------------------------
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    // default to first day of current month
    const parts = today.split('-');
    return `${parts[0]}-${parts[1]}-01`;
  });
  const [customEndDate, setCustomEndDate] = useState<string>(today);

  const customRangeReport = useMemo(() => {
    const sDate = customStartDate <= customEndDate ? customStartDate : customEndDate;
    const eDate = customStartDate <= customEndDate ? customEndDate : customStartDate;

    const rangeExpenses = expenses.filter(
      (e) => e.date >= sDate && e.date <= eDate
    );
    const total = rangeExpenses.reduce((s, e) => s + e.amount, 0);

    // Calculate number of calendar days in range inclusive using local midnight
    const start = new Date(`${sDate}T00:00:00`);
    const end = new Date(`${eDate}T00:00:00`);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Daily breakdown & highest day
    const dayMap: Record<string, number> = {};
    rangeExpenses.forEach((e) => {
      dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
    });

    let highestDayDate = '';
    let highestDayAmt = 0;
    Object.entries(dayMap).forEach(([dStr, amt]) => {
      if (amt > highestDayAmt) {
        highestDayAmt = amt;
        highestDayDate = dStr;
      }
    });

    // Category breakdown
    const catMap: Record<string, { cat: Category; amount: number; count: number }> = {};
    rangeExpenses.forEach((e) => {
      const cat = categoriesMap.get(e.categoryId) || {
        id: e.categoryId,
        nameEn: 'Other',
        nameHi: 'अन्य',
        icon: 'MoreHorizontal',
        color: '#64748b',
        isDefault: false,
      };
      if (!catMap[cat.id]) catMap[cat.id] = { cat, amount: 0, count: 0 };
      catMap[cat.id].amount += e.amount;
      catMap[cat.id].count += 1;
    });

    const categoryList = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    const pieData = categoryList.map((item) => ({
      id: item.cat.id,
      label: lang === 'hi' ? item.cat.nameHi : item.cat.nameEn,
      value: item.amount,
      color: item.cat.color,
      count: item.count,
    }));

    return {
      expenses: rangeExpenses,
      total,
      daysCount,
      dailyAverage: total / daysCount,
      highestDayDate,
      highestDayAmt,
      categoryList,
      pieData,
      rangeLabel: `${formatDisplayDate(customStartDate)} to ${formatDisplayDate(customEndDate)}`,
    };
  }, [customStartDate, customEndDate, expenses, categoriesMap, lang]);

  // ----------------------------------------------------
  // 5. CATEGORY-WISE REPORT STATE
  // ----------------------------------------------------
  const [selectedCatId, setSelectedCatId] = useState<string>(
    initialCategoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [catTimeFilter, setCatTimeFilter] = useState<
    'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  >('month');

  const categoryReport = useMemo(() => {
    let startDate = '';
    let endDate = today;

    if (catTimeFilter === 'today') {
      startDate = today;
      endDate = today;
    } else if (catTimeFilter === 'week') {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(now.setDate(diff));
      startDate = monday.toISOString().slice(0, 10);
    } else if (catTimeFilter === 'month') {
      const mRange = getMonthDateRange(todayYear, todayMonth - 1);
      startDate = mRange.start;
      endDate = mRange.end;
    } else if (catTimeFilter === 'quarter') {
      const currentQuarter = Math.ceil(todayMonth / 3) as 1 | 2 | 3 | 4;
      const qRange = getAccurateQuarterRange(getFinancialYearForDate(today), currentQuarter);
      startDate = qRange.start;
      endDate = qRange.end;
    } else if (catTimeFilter === 'year') {
      const fyRange = getFinancialYearDateRange(getFinancialYearForDate(today));
      startDate = fyRange.start;
      endDate = fyRange.end;
    } else {
      startDate = customStartDate;
      endDate = customEndDate;
    }

    const catExpenses = expenses.filter(
      (e) => e.categoryId === selectedCatId && e.date >= startDate && e.date <= endDate
    );
    const total = catExpenses.reduce((s, e) => s + e.amount, 0);

    const catObj = categoriesMap.get(selectedCatId);

    // Group by date for daily breakdown
    const dailyMap: Record<string, number> = {};
    catExpenses.forEach((e) => {
      dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount;
    });

    const linePoints = Object.entries(dailyMap).map(([d, val]) => ({
      label: formatDisplayDate(d).slice(0, 5),
      value: val,
    }));

    return {
      category: catObj,
      expenses: catExpenses,
      total,
      count: catExpenses.length,
      linePoints,
      rangeLabel: `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`,
    };
  }, [
    selectedCatId,
    catTimeFilter,
    today,
    todayYear,
    todayMonth,
    customStartDate,
    customEndDate,
    expenses,
    categoriesMap,
  ]);

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Title and Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('navReports', lang)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-period financial summaries, trend charts & statements
          </p>
        </div>

        {/* Global Export Options for the current view */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const activeData =
                activeTab === 'monthly'
                  ? monthlyReport
                  : activeTab === 'quarterly'
                  ? quarterlyReport
                  : activeTab === 'yearly'
                  ? yearlyReport
                  : activeTab === 'custom'
                  ? customRangeReport
                  : categoryReport;
              onExportCSV(activeData.expenses, activeData.rangeLabel);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => {
              const activeData =
                activeTab === 'monthly'
                  ? monthlyReport
                  : activeTab === 'quarterly'
                  ? quarterlyReport
                  : activeTab === 'yearly'
                  ? yearlyReport
                  : activeTab === 'custom'
                  ? customRangeReport
                  : categoryReport;
              onExportPDF(activeData.expenses, activeData.rangeLabel);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            title="Generate PDF"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {(['monthly', 'quarterly', 'yearly', 'custom', 'category'] as ReportPeriod[]).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === 'monthly'
              ? t('reportMonthly', lang)
              : tab === 'quarterly'
              ? t('reportQuarterly', lang)
              : tab === 'yearly'
              ? t('reportYearly', lang)
              : tab === 'custom'
              ? t('reportCustom', lang)
              : t('reportCategory', lang);

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. MONTHLY TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Controls: Month & Year Select */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('selectMonthYear', lang)}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {getAllMonthNames(lang).map((mName, idx) => (
                  <option key={idx} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly KPI Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('monthExpensesTotal', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(monthlyReport.currentTotal)}
              </span>
              <div className="mt-2 flex items-center gap-1 text-[11px]">
                {monthlyReport.diffPct >= 0 ? (
                  <span className="text-rose-600 font-bold flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{monthlyReport.diffPct.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {monthlyReport.diffPct.toFixed(1)}%
                  </span>
                )}
                <span className="text-slate-400">vs prev mo</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('highestSpendingDay', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {monthlyReport.highestDayAmount > 0 ? `Day ${monthlyReport.highestDay}` : 'None'}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                {monthlyReport.highestDayAmount > 0
                  ? `Peak: ${formatINR(monthlyReport.highestDayAmount)}`
                  : 'No expenses recorded'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('averageDailyExpense', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(monthlyReport.dailyAverage)}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                Across {monthlyReport.expenses.length} entries
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('highestCategory', lang)}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white truncate block">
                {monthlyReport.topCategory
                  ? lang === 'hi'
                    ? monthlyReport.topCategory.cat.nameHi
                    : monthlyReport.topCategory.cat.nameEn
                  : 'None'}
              </span>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                {monthlyReport.topCategory ? formatINR(monthlyReport.topCategory.amount) : '₹0'}
              </p>
            </div>
          </div>

          {/* Daily Spending Bar Chart */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('dailyTrendChart', lang)}
            </h3>
            <ExpenseBarChart data={monthlyReport.dailyChartData} height={140} />
          </div>

          {/* Category Pie & Legend */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('categoryShare', lang)}
            </h3>
            <CategoryPieChart
              data={monthlyReport.pieData}
              total={monthlyReport.currentTotal}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. QUARTERLY TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'quarterly' && (
        <div className="space-y-4">
          {/* Controls: FY & Quarter */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('financialYear', lang)}:
              </span>
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                {availableFYs.map((fy) => (
                  <option key={fy} value={fy}>
                    {formatFinancialYearLabel(fy)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quarter Buttons Q1 - Q4 */}
            <div className="flex items-center gap-1.5">
              {([1, 2, 3, 4] as const).map((q) => {
                const isSelected = selectedQuarter === q;
                return (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Q{q}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quarterly Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <span className="text-xs font-medium text-emerald-100">
              {quarterlyReport.rangeLabel}
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1">
              {formatINR(quarterlyReport.totalQuarter)}
            </div>
            <p className="text-xs text-emerald-100/90 mt-2">
              {quarterlyReport.expenses.length} transactions recorded in this quarter
            </p>
          </div>

          {/* Month-wise breakdown within quarter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('monthWiseBreakdown', lang)}
            </h3>
            <ExpenseBarChart data={quarterlyReport.monthBarData} height={140} />
          </div>

          {/* Category Breakdown in Quarter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('categoryShare', lang)}
            </h3>
            <CategoryPieChart
              data={quarterlyReport.pieData}
              total={quarterlyReport.totalQuarter}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. YEARLY TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'yearly' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('financialYear', lang)}:
            </span>
            <select
              value={selectedYearlyFY}
              onChange={(e) => setSelectedYearlyFY(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
            >
              {availableFYs.map((fy) => (
                <option key={fy} value={fy}>
                  {formatFinancialYearLabel(fy)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('totalYearlyExpenses', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(yearlyReport.totalYear)}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                {yearlyReport.expenses.length} total entries
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('averageMonthlyExpense', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(yearlyReport.averageMonthly)}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">Per month average</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('highestSpendingMonth', lang)}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white truncate block">
                {yearlyReport.highestMonthName}
              </span>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                Peak: {formatINR(yearlyReport.highestMonthAmount)}
              </p>
            </div>
          </div>

          {/* 12 Months Trend Bar Chart */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('monthlyTrendChart', lang)}
            </h3>
            <ExpenseBarChart data={yearlyReport.monthlyTrendData} height={150} />
          </div>

          {/* Category Share in Year */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('categoryShare', lang)}
            </h3>
            <CategoryPieChart data={yearlyReport.pieData} total={yearlyReport.totalYear} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. CUSTOM DATE RANGE TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          {/* Start and End Date Inputs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              {t('customRangeTitle', lang)}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t('startDate', lang)}:
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t('endDate', lang)}:
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Custom Range KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('periodTotal', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(customRangeReport.total)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('transactionsCount', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {customRangeReport.expenses.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('dailyAverage', lang)}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(customRangeReport.dailyAverage)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t('highestSpendingDay', lang)}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white truncate block">
                {customRangeReport.highestDayAmt > 0 && customRangeReport.highestDayDate
                  ? formatDisplayDate(customRangeReport.highestDayDate)
                  : 'None'}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                {customRangeReport.highestDayAmt > 0
                  ? formatINR(customRangeReport.highestDayAmt)
                  : 'No expenses'}
              </span>
            </div>
          </div>

          {/* Category Breakdown in Custom Range */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('categoryShare', lang)}
            </h3>
            <CategoryPieChart
              data={customRangeReport.pieData}
              total={customRangeReport.total}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. CATEGORY-WISE TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'category' && (
        <div className="space-y-4">
          {/* Category selector & timeframe pills */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('selectCategory', lang)}:
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'hi' ? c.nameHi : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Time filters: Today, This Week, This Month, This Quarter, This Year */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'today', label: t('timeFilterToday', lang) },
                { id: 'week', label: t('timeFilterWeek', lang) },
                { id: 'month', label: t('timeFilterMonth', lang) },
                { id: 'quarter', label: t('timeFilterQuarter', lang) },
                { id: 'year', label: t('timeFilterYear', lang) },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setCatTimeFilter(tf.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    catTimeFilter === tf.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Category Header Card */}
          {categoryReport.category && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: `${categoryReport.category.color}20`,
                    color: categoryReport.category.color,
                  }}
                >
                  <CategoryIcon name={categoryReport.category.icon} size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'hi'
                      ? categoryReport.category.nameHi
                      : categoryReport.category.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400">{categoryReport.rangeLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900 dark:text-white block">
                  {formatINR(categoryReport.total)}
                </span>
                <span className="text-xs text-slate-400">
                  {categoryReport.count} transactions
                </span>
              </div>
            </div>
          )}

          {/* Trend chart of category spending */}
          {categoryReport.linePoints.length >= 2 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Spending Trend
              </h4>
              <DailySpendingLineChart data={categoryReport.linePoints} height={140} />
            </div>
          )}

          {/* List of individual transactions in this category */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t('transactionsInCategory', lang)} ({categoryReport.count})
            </h4>

            {categoryReport.expenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No transactions recorded for this category in the selected timeframe.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {categoryReport.expenses.map((exp) => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {exp.description
                          ? exp.description
                          : (lang === 'hi'
                              ? categoryReport.category?.nameHi
                              : categoryReport.category?.nameEn) || 'Expense'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDisplayDate(exp.date)} • {exp.paymentMethod}
                        {exp.merchant ? ` • ${exp.merchant}` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
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
};
