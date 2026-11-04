/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { BudgetConfig, Category, Expense, UserSettings } from '../types';
import { getTodayDateString } from '../utils/formatters';

const DB_NAME = 'MyExpenseManagerDB';
const DB_VERSION = 1;

const LS_EXPENSES_KEY = 'mem_expenses_v1';
const LS_CATEGORIES_KEY = 'mem_categories_v1';
const LS_BUDGET_KEY = 'mem_budget_v1';
const LS_SETTINGS_KEY = 'mem_settings_v1';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('date', 'date', { unique: false });
        expenseStore.createIndex('categoryId', 'categoryId', { unique: false });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  // Expenses
  async getExpenses(): Promise<Expense[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction('expenses', 'readonly');
        const store = transaction.objectStore('expenses');
        const req = store.getAll();
        req.onsuccess = () => {
          let list = (req.result as Expense[]) || [];
          if (list.length === 0) {
            const lsList = this.getExpensesFromLocalStorage();
            if (lsList.length > 0) {
              list = lsList;
              try {
                const tx = db.transaction('expenses', 'readwrite');
                const st = tx.objectStore('expenses');
                for (const e of lsList) {
                  st.put(e);
                }
              } catch {
                // ignore
              }
            }
          } else {
            localStorage.setItem(LS_EXPENSES_KEY, JSON.stringify(list));
          }
          resolve(list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt));
        };
        req.onerror = () => {
          resolve(this.getExpensesFromLocalStorage());
        };
      });
    } catch {
      return this.getExpensesFromLocalStorage();
    }
  },

  getExpensesFromLocalStorage(): Expense[] {
    try {
      const raw = localStorage.getItem(LS_EXPENSES_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw) as Expense[];
      return list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  },

  async addExpense(expense: Expense): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('expenses', 'readwrite');
        const store = transaction.objectStore('expenses');
        const req = store.put(expense);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // ignore IndexedDB error and fallback
    }
    // Always persist to LocalStorage
    const current = this.getExpensesFromLocalStorage();
    const updated = [expense, ...current.filter((e) => e.id !== expense.id)];
    localStorage.setItem(LS_EXPENSES_KEY, JSON.stringify(updated));
  },

  async updateExpense(expense: Expense): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('expenses', 'readwrite');
        const store = transaction.objectStore('expenses');
        const req = store.put(expense);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // fallback
    }
    const current = this.getExpensesFromLocalStorage();
    const updated = current.map((e) => (e.id === expense.id ? expense : e));
    localStorage.setItem(LS_EXPENSES_KEY, JSON.stringify(updated));
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('expenses', 'readwrite');
        const store = transaction.objectStore('expenses');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // fallback
    }
    const current = this.getExpensesFromLocalStorage();
    const updated = current.filter((e) => e.id !== id);
    localStorage.setItem(LS_EXPENSES_KEY, JSON.stringify(updated));
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const db = await openDB();
      const dbCategories = await new Promise<Category[]>((resolve) => {
        const transaction = db.transaction('categories', 'readonly');
        const store = transaction.objectStore('categories');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (dbCategories && dbCategories.length > 0) {
        localStorage.setItem(LS_CATEGORIES_KEY, JSON.stringify(dbCategories));
        return dbCategories;
      }
    } catch {
      // fallback
    }

    const lsRaw = localStorage.getItem(LS_CATEGORIES_KEY);
    if (lsRaw) {
      try {
        const parsed = JSON.parse(lsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }

    // Initialize with default 16 categories
    await this.saveAllCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  async saveAllCategories(categories: Category[]): Promise<void> {
    localStorage.setItem(LS_CATEGORIES_KEY, JSON.stringify(categories));
    try {
      const db = await openDB();
      const transaction = db.transaction('categories', 'readwrite');
      const store = transaction.objectStore('categories');
      store.clear();
      for (const cat of categories) {
        store.put(cat);
      }
    } catch {
      // ignore
    }
  },

  async saveCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    const idx = categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      categories[idx] = category;
    } else {
      categories.push(category);
    }
    await this.saveAllCategories(categories);
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    await this.saveAllCategories(filtered);
  },

  // Budgets
  async getBudgetConfig(): Promise<BudgetConfig> {
    try {
      const raw = localStorage.getItem(LS_BUDGET_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return {
      overallMonthlyBudget: 25000,
      categoryBudgets: {
        cat_grocery: 6000,
        cat_milk: 1800,
        cat_veg_fruits: 2500,
        cat_petrol_diesel: 3500,
        cat_food_dinner: 3000,
        cat_electricity: 2000,
      },
    };
  },

  async saveBudgetConfig(config: BudgetConfig): Promise<void> {
    localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(config));
  },

  // User Settings
  async getUserSettings(): Promise<UserSettings> {
    const defaults: UserSettings = {
      language: 'en',
      theme: 'light',
      userName: 'Chiku Kumar',
      currencySymbol: '₹',
      securityLockEnabled: false,
      biometricEnabled: true,
      autoLockTimeoutMinutes: 0,
    };
    try {
      const raw = localStorage.getItem(LS_SETTINGS_KEY);
      if (raw) {
        return { ...defaults, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
    return defaults;
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  },

  // Full Database Export / Backup
  async backupFullDatabase(): Promise<string> {
    const expenses = await this.getExpenses();
    const categories = await this.getCategories();
    const budget = await this.getBudgetConfig();
    const settings = await this.getUserSettings();

    const backupPayload = {
      app: 'My Expense Manager – Daily Expense Tracker',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      expenses,
      categories,
      budget,
      settings,
    };

    return JSON.stringify(backupPayload, null, 2);
  },

  // Restore Database from JSON
  async restoreFullDatabase(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.expenses)) {
        return { success: false, message: 'Invalid backup format' };
      }

      // Restore expenses
      localStorage.setItem(LS_EXPENSES_KEY, JSON.stringify(data.expenses));
      try {
        const db = await openDB();
        const tx = db.transaction('expenses', 'readwrite');
        const st = tx.objectStore('expenses');
        st.clear();
        for (const e of data.expenses) {
          st.put(e);
        }
      } catch {
        // ignore
      }

      // Restore categories
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        await this.saveAllCategories(data.categories);
      }

      // Restore budget
      if (data.budget) {
        await this.saveBudgetConfig(data.budget);
      }

      // Restore settings
      if (data.settings) {
        await this.saveUserSettings(data.settings);
      }

      return { success: true, message: 'Database restored successfully' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Restore failed' };
    }
  },

  // Clear all expenses
  async clearAllExpenses(): Promise<void> {
    localStorage.removeItem(LS_EXPENSES_KEY);
    try {
      const db = await openDB();
      const tx = db.transaction('expenses', 'readwrite');
      tx.objectStore('expenses').clear();
    } catch {
      // ignore
    }
  },

  // Seed sample data for testing when requested
  async loadSampleDemoData(): Promise<void> {
    const today = getTodayDateString();
    const [y, m, d] = today.split('-').map(Number);

    const pad = (n: number) => String(n).padStart(2, '0');

    // Create a variety of dates across current month, previous month, and quarters
    const demoExpenses: Expense[] = [
      {
        id: 'exp_demo_1',
        amount: 850,
        categoryId: 'cat_grocery',
        date: today,
        time: '09:30',
        description: 'Morning groceries & bread',
        paymentMethod: 'UPI',
        merchant: 'Reliance Fresh',
        tags: ['#groceries', '#daily'],
        createdAt: Date.now() - 3600000 * 2,
        updatedAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'exp_demo_2',
        amount: 140,
        categoryId: 'cat_milk',
        date: today,
        time: '07:15',
        description: 'Daily milk packet (2L)',
        paymentMethod: 'Cash',
        merchant: 'Amul Dairy',
        tags: ['#milk', '#daily'],
        createdAt: Date.now() - 3600000 * 4,
        updatedAt: Date.now() - 3600000 * 4,
      },
      {
        id: 'exp_demo_3',
        amount: 2200,
        categoryId: 'cat_petrol_diesel',
        date: `${y}-${pad(m)}-${pad(Math.max(1, d - 1))}`,
        time: '18:20',
        description: 'Full tank petrol for bike & car',
        paymentMethod: 'UPI',
        merchant: 'Indian Oil Petrol Pump',
        tags: ['#fuel', '#commute'],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: 'exp_demo_4',
        amount: 450,
        categoryId: 'cat_veg_fruits',
        date: `${y}-${pad(m)}-${pad(Math.max(1, d - 2))}`,
        time: '11:00',
        description: 'Fresh vegetables, spinach & apples',
        paymentMethod: 'Cash',
        merchant: 'Local Sabzi Mandi',
        tags: ['#healthy', '#food'],
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'exp_demo_5',
        amount: 1250,
        categoryId: 'cat_food_dinner',
        date: `${y}-${pad(m)}-${pad(Math.max(1, d - 3))}`,
        time: '20:45',
        description: 'Weekend family dinner',
        paymentMethod: 'Debit Card',
        merchant: 'Barbeque Nation',
        tags: ['#dinner', '#family'],
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3,
      },
      {
        id: 'exp_demo_6',
        amount: 1850,
        categoryId: 'cat_electricity',
        date: `${y}-${pad(m)}-05`,
        time: '14:10',
        description: 'Electricity board bill payment',
        paymentMethod: 'UPI',
        merchant: 'State Electricity Board',
        tags: ['#bills', '#utility'],
        createdAt: Date.now() - 86400000 * 5,
        updatedAt: Date.now() - 86400000 * 5,
      },
      {
        id: 'exp_demo_7',
        amount: 5000,
        categoryId: 'cat_savings',
        date: `${y}-${pad(m)}-02`,
        time: '10:00',
        description: 'Monthly Index Mutual Fund SIP investment',
        paymentMethod: 'Bank Transfer',
        merchant: 'Groww / Zerodha',
        tags: ['#investment', '#sip', '#wealth'],
        createdAt: Date.now() - 86400000 * 6,
        updatedAt: Date.now() - 86400000 * 6,
      },
      {
        id: 'exp_demo_8',
        amount: 999,
        categoryId: 'cat_bills',
        date: `${y}-${pad(m)}-04`,
        time: '16:00',
        description: 'High speed fiber broadband bill',
        paymentMethod: 'Credit Card',
        merchant: 'JioFiber',
        tags: ['#wifi', '#bills'],
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now() - 86400000 * 7,
      },
    ];

    for (const exp of demoExpenses) {
      await this.addExpense(exp);
    }
  },
};
