/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Receipt, BarChart3, LayoutGrid, Settings, Plus } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

export type NavTab = 'home' | 'transactions' | 'reports' | 'categories' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddExpense,
  lang,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-2 flex items-center justify-between h-16 relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1">{t('navHome', lang)}</span>
        </button>

        {/* Tab 2: Transactions */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'transactions'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className={`w-5 h-5 transition-transform ${activeTab === 'transactions' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1">{t('navTransactions', lang)}</span>
        </button>

        {/* Center Quick Add Expense Floating Button */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
          <button
            onClick={onOpenAddExpense}
            className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/40 flex items-center justify-center active:scale-95 transition-transform border-4 border-slate-50 dark:border-slate-950"
            aria-label="Add Expense"
            title="Add New Expense"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Reports */}
        <button
          onClick={() => onChangeTab('reports')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'reports'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className={`w-5 h-5 transition-transform ${activeTab === 'reports' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1">{t('navReports', lang)}</span>
        </button>

        {/* Tab 4: Categories */}
        <button
          onClick={() => onChangeTab('categories')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'categories'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 transition-transform ${activeTab === 'categories' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1">{t('navCategories', lang)}</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          onClick={() => onChangeTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'settings'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 transition-transform ${activeTab === 'settings' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1">{t('navSettings', lang)}</span>
        </button>
      </div>
    </nav>
  );
};
