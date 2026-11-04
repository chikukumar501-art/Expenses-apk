/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Fingerprint, Lock, Check, AlertCircle } from 'lucide-react';
import { Language, UserSettings } from '../types';
import { t } from '../utils/translations';
import { BiometricService } from '../services/biometrics';

interface SecuritySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSecuritySettings: (securitySettings: {
    securityLockEnabled: boolean;
    biometricEnabled: boolean;
    pinCode?: string;
    autoLockTimeoutMinutes: number;
  }) => void;
}

export const SecuritySetupModal: React.FC<SecuritySetupModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSecuritySettings,
}) => {
  const lang = settings.language;
  const [enabled, setEnabled] = useState(settings.securityLockEnabled);
  const [biometrics, setBiometrics] = useState(settings.biometricEnabled);
  const [pin, setPin] = useState(settings.pinCode || '');
  const [confirmPin, setConfirmPin] = useState(settings.pinCode || '');
  const [autoLockTimeout, setAutoLockTimeout] = useState(settings.autoLockTimeoutMinutes ?? 0);
  const [isBiometricHardwareAvailable, setIsBiometricHardwareAvailable] = useState(false);
  const [biometricEnrollStatus, setBiometricEnrollStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEnabled(settings.securityLockEnabled);
      setBiometrics(settings.biometricEnabled);
      setPin(settings.pinCode || '');
      setConfirmPin(settings.pinCode || '');
      setAutoLockTimeout(settings.autoLockTimeoutMinutes ?? 0);
      setErrorMsg('');
      setBiometricEnrollStatus(null);

      // Check hardware availability
      BiometricService.isAvailable().then((avail) => {
        setIsBiometricHardwareAvailable(avail);
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleEnrollBiometrics = async () => {
    setErrorMsg('');
    setBiometricEnrollStatus('Prompting device biometric sensor...');
    const res = await BiometricService.registerBiometrics(settings.userName || 'Expense Manager User');
    if (res.success) {
      setBiometricEnrollStatus('Device biometric successfully enrolled and linked!');
      setBiometrics(true);
    } else {
      setBiometricEnrollStatus(null);
      setErrorMsg(res.error || 'Biometric enrollment failed.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (enabled) {
      // Must set a 4-digit PIN
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setErrorMsg(t('pinLengthError', lang));
        return;
      }
      if (pin !== confirmPin) {
        setErrorMsg(t('pinMismatch', lang));
        return;
      }
    }

    onSaveSecuritySettings({
      securityLockEnabled: enabled,
      biometricEnabled: enabled ? biometrics : false,
      pinCode: enabled ? pin : undefined,
      autoLockTimeoutMinutes: autoLockTimeout,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('securityLockTitle', lang)}
              </h3>
              <p className="text-[11px] text-slate-400">{t('securityLockSubtitle', lang)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {biometricEnrollStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{biometricEnrollStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Main Toggle: Enable Screen Lock */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('enableScreenLock', lang)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Require biometric scan or PIN to open app
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {enabled && (
            <div className="space-y-3.5 pt-1 animate-fade-in">
              {/* Device Biometrics Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('biometricAuth', lang)}
                      </p>
                      <p className="text-[11px] text-slate-400">{t('biometricDesc', lang)}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometrics}
                    onChange={(e) => setBiometrics(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                {/* Enroll / Test Biometrics button */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {isBiometricHardwareAvailable
                      ? 'Biometric sensor ready'
                      : 'WebAuthn platform authenticator'}
                  </span>
                  <button
                    type="button"
                    onClick={handleEnrollBiometrics}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100"
                  >
                    Test / Link Biometrics
                  </button>
                </div>
              </div>

              {/* Security PIN Setup */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>{t('setupPin', lang)} (4 Digits)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      New PIN:
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full text-center tracking-widest text-lg font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {t('confirmPin', lang)}:
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full text-center tracking-widest text-lg font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Auto-Lock Timeout */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('autoLockLabel', lang)}
                </label>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>{t('autoLockImmediate', lang)}</option>
                  <option value={1}>{t('autoLock1Min', lang)}</option>
                  <option value={5}>{t('autoLock5Min', lang)}</option>
                  <option value={15}>{t('autoLock15Min', lang)}</option>
                </select>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              Save Security Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
