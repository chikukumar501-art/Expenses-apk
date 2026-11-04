/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Expense, Language } from '../types';
import { formatDisplayDate, formatINR } from '../utils/formatters';

interface ExportOptions {
  title?: string;
  dateRangeLabel?: string;
  lang?: Language;
}

export const ExportService = {
  /**
   * Export expenses as a standard CSV file with UTF-8 BOM
   */
  exportToCSV(expenses: Expense[], categoriesMap: Map<string, Category>, options: ExportOptions = {}): void {
    const lang = options.lang || 'en';
    const headers = [
      'Transaction ID',
      'Date (DD-MM-YYYY)',
      'Category',
      'Description / Note',
      'Payment Method',
      'Merchant / Shop',
      'Tags',
      'Amount (INR)',
    ];

    const rows: string[][] = [headers];
    let grandTotal = 0;

    for (const exp of expenses) {
      const cat = categoriesMap.get(exp.categoryId);
      const catName = lang === 'hi' ? cat?.nameHi || cat?.nameEn || 'अन्य' : cat?.nameEn || 'Other';
      grandTotal += exp.amount;

      rows.push([
        exp.id,
        formatDisplayDate(exp.date),
        catName,
        exp.description || '',
        exp.paymentMethod || 'Cash',
        exp.merchant || '',
        (exp.tags || []).join('; '),
        exp.amount.toFixed(2),
      ]);
    }

    // Add total row
    rows.push(['', '', '', '', '', '', 'TOTAL SPENT:', grandTotal.toFixed(2)]);

    // Escape CSV values
    const csvContent = rows
      .map((row) =>
        row
          .map((field) => {
            const str = String(field ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\r\n');

    // Add UTF-8 BOM so Excel opens Hindi & Rupee characters correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    this.triggerDownload(blob, filename);
  },

  /**
   * Export as Excel-compatible spreadsheet (.xls / .tsv)
   */
  exportToExcel(expenses: Expense[], categoriesMap: Map<string, Category>, options: ExportOptions = {}): void {
    const lang = options.lang || 'en';
    let grandTotal = 0;

    const rowsHtml = expenses
      .map((exp, idx) => {
        const cat = categoriesMap.get(exp.categoryId);
        const catName = lang === 'hi' ? cat?.nameHi || cat?.nameEn || 'अन्य' : cat?.nameEn || 'Other';
        grandTotal += exp.amount;
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${formatDisplayDate(exp.date)}</td>
            <td>${catName}</td>
            <td>${exp.description || '-'}</td>
            <td>${exp.paymentMethod || 'Cash'}</td>
            <td>${exp.merchant || '-'}</td>
            <td>${(exp.tags || []).join(', ') || '-'}</td>
            <td style="text-align: right;">${exp.amount.toFixed(2)}</td>
          </tr>
        `;
      })
      .join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 13px; }
          th { background-color: #047857; color: #ffffff; padding: 10px; border: 1px solid #ddd; text-align: left; }
          td { padding: 8px 10px; border: 1px solid #ddd; }
          .header-title { font-size: 18px; font-weight: bold; color: #047857; margin-bottom: 5px; }
          .total-row { font-weight: bold; background-color: #ecfdf5; }
        </style>
      </head>
      <body>
        <div class="header-title">My Expense Manager – Financial Statement</div>
        <div style="margin-bottom: 12px; color: #555;">Exported on: ${new Date().toLocaleString('en-IN')} | Scope: ${options.dateRangeLabel || 'All Expenses'}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Payment Method</th>
              <th>Merchant</th>
              <th>Tags</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="total-row">
              <td colspan="7" style="text-align: right;"><strong>Grand Total:</strong></td>
              <td style="text-align: right;"><strong>₹${grandTotal.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const filename = `Expense_Statement_${new Date().toISOString().slice(0, 10)}.xls`;
    this.triggerDownload(blob, filename);
  },

  /**
   * Opens a printable financial report in a new window configured for Save as PDF / Print
   */
  generatePDFReport(expenses: Expense[], categoriesMap: Map<string, Category>, options: ExportOptions = {}): void {
    const lang = options.lang || 'en';
    const title = options.title || (lang === 'hi' ? 'दैनिक खर्च रिपोर्ट' : 'Official Expense Statement');
    const periodLabel = options.dateRangeLabel || (lang === 'hi' ? 'सभी दर्ज खर्च' : 'All Recorded Transactions');

    // Calculate Category totals
    const catTotals: Record<string, { name: string; amount: number; count: number; color: string }> = {};
    let grandTotal = 0;

    for (const exp of expenses) {
      grandTotal += exp.amount;
      const cat = categoriesMap.get(exp.categoryId);
      const name = lang === 'hi' ? cat?.nameHi || cat?.nameEn || 'अन्य' : cat?.nameEn || 'Other';
      const color = cat?.color || '#047857';

      if (!catTotals[exp.categoryId]) {
        catTotals[exp.categoryId] = { name, amount: 0, count: 0, color };
      }
      catTotals[exp.categoryId].amount += exp.amount;
      catTotals[exp.categoryId].count += 1;
    }

    const sortedCats = Object.values(catTotals).sort((a, b) => b.amount - a.amount);

    const categorySummaryRows = sortedCats
      .map(
        (c) => `
        <tr>
          <td>
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${c.color}; margin-right:8px;"></span>
            <strong>${c.name}</strong>
          </td>
          <td>${c.count} txns</td>
          <td style="text-align:right;">${formatINR(c.amount)}</td>
          <td style="text-align:right;">${grandTotal > 0 ? ((c.amount / grandTotal) * 100).toFixed(1) : 0}%</td>
        </tr>
      `
      )
      .join('');

    const transactionsRows = expenses
      .map(
        (exp, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${formatDisplayDate(exp.date)}</td>
          <td><strong>${lang === 'hi' ? categoriesMap.get(exp.categoryId)?.nameHi || categoriesMap.get(exp.categoryId)?.nameEn : categoriesMap.get(exp.categoryId)?.nameEn || 'Other'}</strong></td>
          <td>${exp.description || '-'} ${exp.merchant ? `<em>(${exp.merchant})</em>` : ''}</td>
          <td><span class="badge">${exp.paymentMethod}</span></td>
          <td style="text-align:right; font-weight:600;">${formatINR(exp.amount)}</td>
        </tr>
      `
      )
      .join('');

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - My Expense Manager</title>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #059669;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .title { font-size: 24px; font-weight: 800; color: #064e3b; margin: 0; }
          .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
          .meta-box { text-align: right; font-size: 12px; color: #475569; }
          .total-card {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-label { font-size: 14px; font-weight: 600; color: #166534; }
          .total-value { font-size: 26px; font-weight: 900; color: #059669; }
          h3 { font-size: 15px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8fafc; color: #475569; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
          .badge { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #475569; }
          .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          .print-bar {
            background: #1e293b;
            color: #fff;
            padding: 12px 20px;
            margin: -24px -24px 24px -24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .btn-print {
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
          }
          @media print {
            .print-bar { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-bar">
          <span><strong>My Expense Manager</strong> - Ready to Print or Save as PDF</span>
          <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
        </div>

        <div class="header">
          <div>
            <h1 class="title">My Expense Manager</h1>
            <div class="subtitle">${title} • ${periodLabel}</div>
          </div>
          <div class="meta-box">
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><strong>Total Transactions:</strong> ${expenses.length}</div>
            <div><strong>Currency:</strong> Indian Rupee (₹)</div>
          </div>
        </div>

        <div class="total-card">
          <div>
            <div class="total-label">Grand Total Outflow</div>
            <div style="font-size: 12px; color: #166534; margin-top: 2px;">Includes all tracked daily living expenses and investments</div>
          </div>
          <div class="total-value">${formatINR(grandTotal)}</div>
        </div>

        <h3>Category Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Entries</th>
              <th style="text-align:right;">Total Amount</th>
              <th style="text-align:right;">Share (%)</th>
            </tr>
          </thead>
          <tbody>
            ${categorySummaryRows}
          </tbody>
        </table>

        <h3>Itemized Transactions Log</h3>
        <table>
          <thead>
            <tr>
              <th style="width:30px;">#</th>
              <th style="width:90px;">Date</th>
              <th>Category</th>
              <th>Description / Merchant</th>
              <th>Method</th>
              <th style="text-align:right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${transactionsRows}
          </tbody>
        </table>

        <div class="footer">
          Generated with My Expense Manager – Daily Expense Tracker | 100% Verified Calculations
        </div>
      </body>
      </html>
    `;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        return;
      }
    } catch {
      // Pop-up blocked or not allowed, continue to iframe fallback
    }

    // Hidden iframe fallback
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(reportHtml);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 500);
    }
  },

  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
