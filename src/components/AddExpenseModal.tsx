/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Trash2, Tag, Calendar, Check, AlertCircle } from 'lucide-react';
import { Category, Expense, Language, PaymentMethod } from '../types';
import { t } from '../utils/translations';
import { getTodayDateString } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  categories: Category[];
  editingExpense?: Expense | null;
  lang: Language;
  initialDate?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  categories,
  editingExpense,
  lang,
  initialDate,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState<string>('');
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setDescription(editingExpense.description || '');
      setPaymentMethod(editingExpense.paymentMethod || 'UPI');
      setMerchant(editingExpense.merchant || '');
      setReceiptPhotoUrl(editingExpense.receiptPhotoUrl || '');
      setTags(editingExpense.tags || []);
      setErrorMsg('');
    } else {
      setAmount('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDate(initialDate || getTodayDateString());
      setDescription('');
      setPaymentMethod('UPI');
      setMerchant('');
      setReceiptPhotoUrl('');
      setTags([]);
      setErrorMsg('');
    }
  }, [editingExpense, isOpen, categories, initialDate]);

  if (!isOpen) return null;

  const handleAmountIncrement = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    let cleanTag = tagInput.trim();
    if (!cleanTag.startsWith('#')) {
      cleanTag = `#${cleanTag}`;
    }
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Receipt photo must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawParsed = parseFloat(amount);

    if (isNaN(rawParsed) || rawParsed <= 0) {
      setErrorMsg(t('amountRequired', lang));
      return;
    }

    const parsedAmount = Math.round((rawParsed + Number.EPSILON) * 100) / 100;

    if (!categoryId) {
      setErrorMsg(t('categoryRequired', lang));
      return;
    }

    if (!date) {
      setErrorMsg(t('dateRequired', lang));
      return;
    }

    if (!paymentMethod) {
      setErrorMsg(lang === 'hi' ? 'कृपया भुगतान का तरीका चुनें।' : 'Please select a payment method.');
      return;
    }

    // Now format time if not present
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onSaveExpense(
      {
        amount: parsedAmount,
        categoryId,
        date,
        time: editingExpense?.time || timeStr,
        description: description.trim() || undefined,
        paymentMethod,
        merchant: merchant.trim(),
        receiptPhotoUrl: receiptPhotoUrl || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
      editingExpense?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingExpense ? t('editExpenseTitle', lang) : t('newExpenseTitle', lang)}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Input with Rupee symbol and Quick Increments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('amountLabel', lang)} *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-emerald-500/50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 font-bold text-2xl text-slate-900 dark:text-white outline-none transition"
                autoFocus
              />
            </div>
            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountIncrement(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-700 transition shrink-0"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('categoryLabel', lang)} *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                const displayName = lang === 'hi' ? cat.nameHi : cat.nameEn;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-transform"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}20`,
                        color: isSelected ? '#ffffff' : cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <span className="text-[11px] font-medium leading-tight truncate w-full">
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('dateLabel', lang)} *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('paymentMethodLabel', lang)} *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description / Note (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('descriptionLabel', lang)}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder', lang)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Merchant / Shop Name (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('merchantLabel', lang)}
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={t('merchantPlaceholder', lang)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('tagsLabel', lang)}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t('tagsPlaceholder', lang)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Receipt Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('receiptPhotoLabel', lang)}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            {receiptPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptPhotoUrl}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Receipt attached
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  >
                    {t('changeReceipt', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptPhotoUrl('')}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 text-xs font-medium transition bg-slate-50 dark:bg-slate-800/40"
              >
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('uploadReceipt', lang)}</span>
              </button>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? t('updateExpense', lang) : t('saveExpense', lang)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
