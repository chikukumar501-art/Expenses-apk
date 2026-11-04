/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Wallet,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Smartphone,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Copy,
  ExternalLink,
  Fingerprint,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { BudgetConfig, Category, Expense, Language, UserSettings } from '../types';
import { formatINR } from '../utils/formatters';
import { t } from '../utils/translations';
import { CategoryIcon } from './CategoryIcon';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SecuritySetupModal } from './SecuritySetupModal';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  budgetConfig: BudgetConfig;
  onSaveBudgetConfig: (config: BudgetConfig) => void;
  categories: Category[];
  expenses: Expense[];
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onBackupJSON: () => void;
  onRestoreJSON: (jsonStr: string) => Promise<boolean>;
  onLoadDemoData: () => void;
  onClearAllExpenses: () => void;
  onLockApp?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  budgetConfig,
  onSaveBudgetConfig,
  categories,
  expenses,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onBackupJSON,
  onRestoreJSON,
  onLoadDemoData,
  onClearAllExpenses,
  onLockApp,
}) => {
  const lang = settings.language;
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  // Security Lock modal state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Local budget state
  const [overallBudget, setOverallBudget] = useState(
    budgetConfig.overallMonthlyBudget.toString()
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(() => {
    const res: Record<string, string> = {};
    Object.entries(budgetConfig.categoryBudgets).forEach(([k, v]) => {
      res[k] = v.toString();
    });
    return res;
  });
  const [budgetSavedToast, setBudgetSavedToast] = useState(false);

  // APK modal state
  const [showAPKGuide, setShowAPKGuide] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // File input ref for restore
  const restoreFileRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const catBudgetsParsed: Record<string, number> = {};
    Object.entries(categoryBudgets).forEach(([k, v]) => {
      const parsed = parseFloat(v);
      if (!isNaN(parsed) && parsed > 0) {
        catBudgetsParsed[k] = parsed;
      }
    });

    onSaveBudgetConfig({
      overallMonthlyBudget: parseFloat(overallBudget) || 0,
      categoryBudgets: catBudgetsParsed,
    });

    setBudgetSavedToast(true);
    setTimeout(() => setBudgetSavedToast(false), 3000);
  };

  const handleFileRestoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await onRestoreJSON(content);
      if (success) {
        setRestoreStatus(t('restoreSuccess', lang));
      } else {
        setRestoreStatus(t('restoreError', lang));
      }
      setTimeout(() => setRestoreStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto px-4 pt-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t('settingsTitle', lang)}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize preferences, manage budgets, export financial data & Android APK setup
        </p>
      </div>

      {/* 1. App Preferences (Language & Theme) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('appPreferences', lang)}
        </h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('languageLabel', lang)}
              </p>
              <p className="text-[11px] text-slate-400">English / हिन्दी</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button
              onClick={() => onUpdateSettings({ language: 'en' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                settings.language === 'en'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onUpdateSettings({ language: 'hi' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                settings.language === 'hi'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            {settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-purple-500" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('themeLabel', lang)}
              </p>
              <p className="text-[11px] text-slate-400">
                {settings.theme === 'dark' ? t('themeDark', lang) : t('themeLight', lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                settings.theme === 'light'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {t('themeLight', lang)}
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                settings.theme === 'dark'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {t('themeDark', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Screen Lock & Biometrics Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('securityLockTitle', lang)}
              </h3>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {t('securityLockSubtitle', lang)}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              settings.securityLockEnabled
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {settings.securityLockEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        {/* Status and Configuration Info */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Biometric Authentication:</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {settings.securityLockEnabled && settings.biometricEnabled
                ? 'Fingerprint / Face Enabled'
                : 'Off'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Security PIN:</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {settings.securityLockEnabled && settings.pinCode ? '•••• (Configured)' : 'None'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Auto-Lock Timeout:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {settings.autoLockTimeoutMinutes === 0
                ? t('autoLockImmediate', lang)
                : `${settings.autoLockTimeoutMinutes} min`}
            </span>
          </div>
        </div>

        {/* Security Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {settings.securityLockEnabled ? 'Configure Screen Lock' : 'Set Up Biometrics & PIN'}
            </span>
          </button>

          {settings.securityLockEnabled && onLockApp && (
            <button
              onClick={onLockApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('lockAppNow', lang)}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Android App (APK) & Installation Section */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white shadow-md space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('androidApkTitle', lang)}</h3>
              <p className="text-[11px] text-emerald-100/90">{t('androidApkSubtitle', lang)}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Android Native
          </span>
        </div>

        <p className="text-xs text-emerald-50 leading-relaxed">
          This application is designed specifically for Android smartphones with persistent offline
          storage, DD-MM-YYYY date formats, and Indian Rupee support.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* In-app install button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('installPwaBtn', lang)}</span>
            </button>
          )}

          <button
            onClick={() => setShowAPKGuide(true)}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t('apkBuildInstructions', lang)}</span>
          </button>
        </div>
      </div>

      {/* 3. Budget Management Form */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('budgetSettingsTitle', lang)}
            </h3>
          </div>
          {budgetSavedToast && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBudget} className="space-y-4">
          {/* Overall Monthly Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('overallBudgetLabel', lang)}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={overallBudget}
                onChange={(e) => setOverallBudget(e.target.value)}
                placeholder="25000"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t('setOverallBudgetHelper', lang)}</p>
          </div>

          {/* Category-wise Budgets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('categoryBudgetsTitle', lang)}
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const val = categoryBudgets[cat.id] || '';
                return (
                  <div key={cat.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {lang === 'hi' ? cat.nameHi : cat.nameEn}
                      </span>
                    </div>

                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={val}
                        onChange={(e) =>
                          setCategoryBudgets({
                            ...categoryBudgets,
                            [cat.id]: e.target.value,
                          })
                        }
                        placeholder="Limit"
                        className="w-full pl-6 pr-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            {t('saveBudgetBtn', lang)}
          </button>
        </form>
      </div>

      {/* 4. Data Export & Backup Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('dataExportBackup', lang)}
        </h3>

        {restoreStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{restoreStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/40 text-left transition flex items-start gap-2.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('exportCSV', lang)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('exportCSVDesc', lang)}</p>
            </div>
          </button>

          {/* Export Excel */}
          <button
            onClick={onExportExcel}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/40 text-left transition flex items-start gap-2.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('exportExcel', lang)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('exportExcelDesc', lang)}</p>
            </div>
          </button>

          {/* Generate PDF */}
          <button
            onClick={onExportPDF}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/40 text-left transition flex items-start gap-2.5"
          >
            <FileText className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('exportPDF', lang)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('exportPDFDesc', lang)}</p>
            </div>
          </button>

          {/* Backup Database JSON */}
          <button
            onClick={onBackupJSON}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/40 text-left transition flex items-start gap-2.5"
          >
            <Download className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('backupJSON', lang)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('backupJSONDesc', lang)}</p>
            </div>
          </button>
        </div>

        {/* Restore from JSON */}
        <div className="pt-2">
          <input
            ref={restoreFileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileRestoreChange}
            className="hidden"
          />
          <button
            onClick={() => restoreFileRef.current?.click()}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('restoreJSON', lang)}</span>
          </button>
        </div>
      </div>

      {/* 5. Testing & Maintenance Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('demoDataTitle', lang)}
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onLoadDemoData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('loadDemoData', lang)}</span>
          </button>

          <button
            onClick={onClearAllExpenses}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('clearAllData', lang)}</span>
          </button>
        </div>
      </div>

      {/* Android APK Build Guide Modal */}
      {showAPKGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Android APK Build & Deployment Guide
                </h3>
              </div>
              <button
                onClick={() => setShowAPKGuide(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200">
                <p className="font-bold">Instant Installation on any Android Smartphone:</p>
                <p className="mt-1">
                  Tap <strong>&ldquo;Install App on Phone&rdquo;</strong> in the browser menu or use the button in the header. The app will install directly onto your home screen with a native full-screen standalone experience, offline IndexedDB storage, and zero app store delays!
                </p>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white pt-1">
                Option 2: Generate Native Android APK using Capacitor CLI
              </h4>
              <p>
                You can wrap this Vite + React project into a native Android APK in under 2 minutes:
              </p>

              {/* Step 1 */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] relative">
                <p className="text-slate-400 mb-1"># 1. Install Capacitor in project</p>
                <code>npm i -D @capacitor/core @capacitor/cli @capacitor/android</code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm i -D @capacitor/core @capacitor/cli @capacitor/android',
                      'c1'
                    )
                  }
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] relative">
                <p className="text-slate-400 mb-1"># 2. Initialize Android Platform</p>
                <code>npx cap init &quot;My Expense Manager&quot; &quot;com.myexpensemanager.app&quot; --web-dir dist</code>
                <br />
                <code>npm run build</code>
                <br />
                <code>npx cap add android</code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npx cap init "My Expense Manager" "com.myexpensemanager.app" --web-dir dist\nnpm run build\nnpx cap add android',
                      'c2'
                    )
                  }
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'c2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] relative">
                <p className="text-slate-400 mb-1"># 3. Build Debug APK (.apk)</p>
                <code>cd android && ./gradlew assembleDebug</code>
                <br />
                <span className="text-emerald-400">
                  # Output: android/app/build/outputs/apk/debug/app-debug.apk
                </span>
                <button
                  onClick={() =>
                    copyToClipboard('cd android && ./gradlew assembleDebug', 'c3')
                  }
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'c3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] relative">
                <p className="text-slate-400 mb-1"># 4. Build Signed Release APK</p>
                <code>cd android && ./gradlew assembleRelease</code>
                <br />
                <span className="text-emerald-400">
                  # Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
                </span>
                <button
                  onClick={() =>
                    copyToClipboard('cd android && ./gradlew assembleRelease', 'c4')
                  }
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'c4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAPKGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Setup Modal */}
      <SecuritySetupModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        settings={settings}
        onSaveSecuritySettings={(sec) => onUpdateSettings(sec)}
      />
    </div>
  );
};
