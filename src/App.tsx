/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { CategoriesView } from './components/CategoriesView';
import { SettingsView } from './components/SettingsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ScreenLockOverlay } from './components/ScreenLockOverlay';
import { StorageService } from './services/storage';
import { ExportService } from './services/export';
import { BudgetConfig, Category, Expense, UserSettings } from './types';
import { DEFAULT_CATEGORIES } from './data/defaultCategories';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
    overallMonthlyBudget: 25000,
    categoryBudgets: {},
  });
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    theme: 'light',
    userName: 'User',
    currencySymbol: '₹',
    securityLockEnabled: false,
    biometricEnabled: true,
    autoLockTimeoutMinutes: 0,
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Security Lock State
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialDateForAdd, setInitialDateForAdd] = useState<string | undefined>(undefined);
  const [initialCategoryForReport, setInitialCategoryForReport] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme synchronization with document class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      const [exps, cats, bg, st] = await Promise.all([
        StorageService.getExpenses(),
        StorageService.getCategories(),
        StorageService.getBudgetConfig(),
        StorageService.getUserSettings(),
      ]);
      setExpenses(exps);
      setCategories(cats);
      setBudgetConfig(bg);
      setSettings(st);

      // Lock on launch if security is enabled
      if (st.securityLockEnabled) {
        setIsAppLocked(true);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-Lock on App Switch / Minimizing / Backgrounding
  useEffect(() => {
    if (!settings.securityLockEnabled) return;

    let backgroundedAt = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        backgroundedAt = Date.now();
      } else {
        if (backgroundedAt > 0) {
          const elapsedMinutes = (Date.now() - backgroundedAt) / 60000;
          const timeout = settings.autoLockTimeoutMinutes ?? 0;
          if (timeout === 0 || elapsedMinutes >= timeout) {
            setIsAppLocked(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.securityLockEnabled, settings.autoLockTimeoutMinutes]);

  // Categories Map
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Handlers for Expenses
  const handleSaveExpense = async (
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = Date.now();
    if (existingId) {
      const existing = expenses.find((e) => e.id === existingId);
      const updated: Expense = {
        ...expenseData,
        id: existingId,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      await StorageService.updateExpense(updated);
    } else {
      const newExp: Expense = {
        ...expenseData,
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      await StorageService.addExpense(newExp);
    }
    const fresh = await StorageService.getExpenses();
    setExpenses(fresh);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: string) => {
    await StorageService.deleteExpense(id);
    const fresh = await StorageService.getExpenses();
    setExpenses(fresh);
  };

  // Handlers for Categories
  const handleSaveCategory = async (cat: Category) => {
    await StorageService.saveCategory(cat);
    const fresh = await StorageService.getCategories();
    setCategories(fresh);
  };

  const handleDeleteCategory = async (id: string) => {
    await StorageService.deleteCategory(id);
    const fresh = await StorageService.getCategories();
    setCategories(fresh);
  };

  // Handlers for Budgets
  const handleSaveBudgetConfig = async (newConfig: BudgetConfig) => {
    await StorageService.saveBudgetConfig(newConfig);
    setBudgetConfig(newConfig);
  };

  // Handlers for User Settings
  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await StorageService.saveUserSettings(updated);
  };

  // Export handlers
  const handleExportCSV = (customList?: Expense[], label?: string) => {
    ExportService.exportToCSV(customList || expenses, categoriesMap, {
      lang: settings.language,
      dateRangeLabel: label,
    });
  };

  const handleExportExcel = (customList?: Expense[], label?: string) => {
    ExportService.exportToExcel(customList || expenses, categoriesMap, {
      lang: settings.language,
      dateRangeLabel: label,
    });
  };

  const handleExportPDF = (customList?: Expense[], label?: string) => {
    ExportService.generatePDFReport(customList || expenses, categoriesMap, {
      lang: settings.language,
      dateRangeLabel: label,
    });
  };

  const handleBackupJSON = async () => {
    const jsonStr = await StorageService.backupFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const filename = `ExpenseManager_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    ExportService.triggerDownload(blob, filename);
  };

  const handleRestoreJSON = async (jsonStr: string): Promise<boolean> => {
    const res = await StorageService.restoreFullDatabase(jsonStr);
    if (res.success) {
      await loadInitialData();
      return true;
    }
    return false;
  };

  const handleLoadDemoData = async () => {
    await StorageService.loadSampleDemoData();
    const fresh = await StorageService.getExpenses();
    setExpenses(fresh);
  };

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleClearAllExpenses = () => {
    setShowResetConfirm(true);
  };

  const confirmClearAllExpenses = async () => {
    await StorageService.clearAllExpenses();
    setExpenses([]);
    setShowResetConfirm(false);
  };

  // Cross-screen navigation actions
  const handleOpenAddExpense = (initialDate?: string) => {
    setEditingExpense(null);
    setInitialDateForAdd(initialDate);
    setIsAddExpenseOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  const handleViewCategoryReport = (categoryId: string) => {
    setInitialCategoryForReport(categoryId);
    setActiveTab('reports');
  };

  const handleOpenAddExpenseWithCategory = (categoryId: string) => {
    setEditingExpense(null);
    setInitialDateForAdd(undefined);
    setIsAddExpenseOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
            ₹
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            My Expense Manager
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Top Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        isOnline={isOnline}
        onLockApp={() => setIsAppLocked(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'home' && (
          <Dashboard
            expenses={expenses}
            categories={categories}
            budgetConfig={budgetConfig}
            lang={settings.language}
            onOpenAddExpense={() => handleOpenAddExpense()}
            onEditExpense={handleEditExpense}
            onViewAllTransactions={() => setActiveTab('transactions')}
            onViewCategoryReport={handleViewCategoryReport}
            onOpenDateFilter={(d) => {
              setSelectedDateFilter(d);
              setActiveTab('transactions');
            }}
            onViewReceipt={(url) => setViewingReceiptUrl(url)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            expenses={expenses}
            categories={categories}
            lang={settings.language}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenAddExpense={handleOpenAddExpense}
            onViewReceipt={(url) => setViewingReceiptUrl(url)}
            onExportCSV={(list) => handleExportCSV(list, 'Filtered Transactions')}
            onExportPDF={(list) => handleExportPDF(list, 'Filtered Transactions')}
            initialDate={selectedDateFilter}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            expenses={expenses}
            categories={categories}
            lang={settings.language}
            onExportCSV={(list, label) => handleExportCSV(list, label)}
            onExportExcel={(list, label) => handleExportExcel(list, label)}
            onExportPDF={(list, label) => handleExportPDF(list, label)}
            initialCategoryId={initialCategoryForReport}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            expenses={expenses}
            lang={settings.language}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onViewCategoryReport={handleViewCategoryReport}
            onOpenAddExpenseWithCategory={handleOpenAddExpenseWithCategory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            budgetConfig={budgetConfig}
            onSaveBudgetConfig={handleSaveBudgetConfig}
            categories={categories}
            expenses={expenses}
            onExportCSV={() => handleExportCSV(expenses, 'All Recorded Expenses')}
            onExportExcel={() => handleExportExcel(expenses, 'All Recorded Expenses')}
            onExportPDF={() => handleExportPDF(expenses, 'All Recorded Expenses')}
            onBackupJSON={handleBackupJSON}
            onRestoreJSON={handleRestoreJSON}
            onLoadDemoData={handleLoadDemoData}
            onClearAllExpenses={handleClearAllExpenses}
            onLockApp={() => setIsAppLocked(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'reports') {
            setInitialCategoryForReport(null);
          }
          if (tab !== 'transactions') {
            setSelectedDateFilter('');
          }
        }}
        onOpenAddExpense={() => handleOpenAddExpense()}
        lang={settings.language}
      />

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        categories={categories}
        editingExpense={editingExpense}
        lang={settings.language}
        initialDate={initialDateForAdd}
      />

      {/* Receipt Zoom / View Modal */}
      <ReceiptModal
        photoUrl={viewingReceiptUrl}
        onClose={() => setViewingReceiptUrl(null)}
      />

      {/* Biometric & PIN Screen Lock Overlay */}
      <ScreenLockOverlay
        isLocked={isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
        correctPin={settings.pinCode}
        biometricEnabled={settings.biometricEnabled}
        lang={settings.language}
      />

      {/* Database Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset All Expense Records?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete all recorded expenses? This action cannot be undone. Categories and budgets will remain safe.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAllExpenses}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
