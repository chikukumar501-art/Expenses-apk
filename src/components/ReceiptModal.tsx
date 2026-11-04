/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Download } from 'lucide-react';

interface ReceiptModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `Expense_Receipt_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white">
          <span className="text-xs font-semibold">Expense Receipt / Bill</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
          <img
            src={photoUrl}
            alt="Full Receipt"
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
