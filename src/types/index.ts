/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaymentMethod = 'Cash' | 'UPI' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string; // ISO format YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  paymentMethod: PaymentMethod;
  merchant?: string;
  receiptPhotoUrl?: string; // base64 or object URL
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  color: string;
  isDefault: boolean;
  monthlyBudget?: number;
}

export interface BudgetConfig {
  overallMonthlyBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> monthly budget
}

export type Language = 'en' | 'hi';

export type AppTheme = 'light' | 'dark' | 'system';

export interface UserSettings {
  language: Language;
  theme: AppTheme;
  userName: string;
  currencySymbol: string;
  autoBackupNotice?: boolean;
  securityLockEnabled: boolean;
  biometricEnabled: boolean;
  pinCode?: string;
  autoLockTimeoutMinutes: number; // 0 = immediately on app switch/blur, 1, 5, 15
  lastUnlockedAt?: number;
}

export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom' | 'category';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface FinancialQuarter {
  name: string; // Q1, Q2, Q3, Q4
  labelEn: string;
  labelHi: string;
  startMonth: number; // 0-indexed (3 for April)
  endMonth: number;
  yearOffset: number; // 0 for same calendar year, 1 for next (Q4 is Jan-Mar next year)
}
