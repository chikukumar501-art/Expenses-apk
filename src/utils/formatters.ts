/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

/**
 * Formats a number in Indian Rupees (₹) with standard Indian numbering system (Lakhs, Crores).
 * Example: 150000 -> ₹1,50,000
 */
export function formatINR(amount: number, forceDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  
  const hasDecimals = amount % 1 !== 0 || forceDecimals;
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Returns today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts YYYY-MM-DD to DD-MM-YYYY
 */
export function formatDisplayDate(isoDateString: string): string {
  if (!isoDateString) return '';
  const parts = isoDateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return isoDateString;
}

/**
 * Converts DD-MM-YYYY to YYYY-MM-DD
 */
export function parseDisplayDate(displayDateString: string): string {
  if (!displayDateString) return '';
  const parts = displayDateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return displayDateString;
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

export function getMonthName(monthIndex: number, lang: Language = 'en'): string {
  const idx = Math.max(0, Math.min(11, monthIndex));
  return lang === 'hi' ? MONTHS_HI[idx] : MONTHS_EN[idx];
}

export function getAllMonthNames(lang: Language = 'en'): string[] {
  return lang === 'hi' ? MONTHS_HI : MONTHS_EN;
}

/**
 * Indian Financial Year Helper
 * FY runs from April 1 to March 31.
 * For example, a date in October 2026 is in FY 2026-2027.
 * A date in February 2027 is also in FY 2026-2027.
 */
export function getFinancialYearForDate(isoDateString: string): number {
  const [yearStr, monthStr] = isoDateString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  // If month is Jan, Feb, Mar (1,2,3), FY started previous year
  if (month < 4) {
    return year - 1;
  }
  return year;
}

export function formatFinancialYearLabel(startYear: number): string {
  const endYear = (startYear + 1) % 100;
  return `FY ${startYear}-${String(endYear).padStart(2, '0')}`;
}

/**
 * Returns date range [YYYY-MM-DD, YYYY-MM-DD] for an Indian Financial Quarter
 * FY Start Year: e.g. 2026 for FY 2026-27
 * Q1: Apr 1 - Jun 30 (Year)
 * Q2: Jul 1 - Sep 30 (Year)
 * Q3: Oct 1 - Dec 31 (Year)
 * Q4: Jan 1 - Mar 31 (Year + 1)
 */
export function getQuarterDateRange(startYear: number, quarterIndex: 1 | 2 | 3 | 4): { start: string; end: string } {
  switch (quarterIndex) {
    case 1:
      return { start: `${startYear}-04-01`, end: `${startYear}-06-30` };
    case 2:
      return { start: `${startYear}-07-01`, end: `${startYear}-09-30` };
    case 3:
      return { start: `${startYear}-10-01`, end: `${startYear}-12-31` };
    case 4: {
      const nextYear = startYear + 1;
      return { start: `${nextYear}-01-01`, end: `${nextYear}-03-31` };
    }
  }
}

// Correction for Q2:
export function getAccurateQuarterRange(startYear: number, quarterIndex: 1 | 2 | 3 | 4): { start: string; end: string; labelEn: string; labelHi: string } {
  switch (quarterIndex) {
    case 1:
      return {
        start: `${startYear}-04-01`,
        end: `${startYear}-06-30`,
        labelEn: 'Q1 (Apr – Jun)',
        labelHi: 'Q1 (अप्रैल – जून)'
      };
    case 2:
      return {
        start: `${startYear}-07-01`,
        end: `${startYear}-09-30`,
        labelEn: 'Q2 (Jul – Sep)',
        labelHi: 'Q2 (जुलाई – सितंबर)'
      };
    case 3:
      return {
        start: `${startYear}-10-01`,
        end: `${startYear}-12-31`,
        labelEn: 'Q3 (Oct – Dec)',
        labelHi: 'Q3 (अक्टूबर – दिसंबर)'
      };
    case 4:
      return {
        start: `${startYear + 1}-01-01`,
        end: `${startYear + 1}-03-31`,
        labelEn: 'Q4 (Jan – Mar)',
        labelHi: 'Q4 (जनवरी – मार्च)'
      };
  }
}

/**
 * Returns date range [YYYY-MM-DD, YYYY-MM-DD] for a calendar month
 */
export function getMonthDateRange(year: number, monthIndex: number): { start: string; end: string } {
  const m = monthIndex + 1;
  const monthStr = String(m).padStart(2, '0');
  const lastDay = new Date(year, m, 0).getDate();
  return {
    start: `${year}-${monthStr}-01`,
    end: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Returns date range for an Indian Financial Year (Apr 1 to Mar 31)
 */
export function getFinancialYearDateRange(startYear: number): { start: string; end: string } {
  return {
    start: `${startYear}-04-01`,
    end: `${startYear + 1}-03-31`,
  };
}

/**
 * Check if a date string YYYY-MM-DD falls within start and end inclusive
 */
export function isWithinDateRange(dateStr: string, startDateStr: string, endDateStr: string): boolean {
  return dateStr >= startDateStr && dateStr <= endDateStr;
}

/**
 * Returns friendly formatted date with day of week:
 * e.g., "Monday, 03-11-2026"
 */
export function getFriendlyDateWithDay(isoDateString: string, lang: Language = 'en'): string {
  if (!isoDateString) return '';
  const [y, m, d] = isoDateString.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const dayName = lang === 'hi' ? daysHi[dateObj.getDay()] : daysEn[dateObj.getDay()];
  return `${dayName}, ${formatDisplayDate(isoDateString)}`;
}
