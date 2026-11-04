/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Fingerprint, Lock, ShieldCheck, Delete, AlertCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { BiometricService } from '../services/biometrics';

interface ScreenLockOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
  correctPin?: string;
  biometricEnabled: boolean;
  lang: Language;
}

export const ScreenLockOverlay: React.FC<ScreenLockOverlayProps> = ({
  isLocked,
  onUnlock,
  correctPin,
  biometricEnabled,
  lang,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isAuthenticatingBiometric, setIsAuthenticatingBiometric] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Trigger biometric prompt
  const handleBiometricPrompt = useCallback(async () => {
    if (!biometricEnabled) return;
    setErrorStatus(null);
    setIsAuthenticatingBiometric(true);

    try {
      const res = await BiometricService.authenticate();
      if (res.success) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 50, 30]);
        }
        setPinDigits([]);
        onUnlock();
      } else if (res.error) {
        setErrorStatus(res.error);
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'Biometric authentication failed.');
    } finally {
      setIsAuthenticatingBiometric(false);
    }
  }, [biometricEnabled, onUnlock]);

  // Prompt automatically when lock screen opens
  useEffect(() => {
    if (isLocked) {
      setPinDigits([]);
      setErrorStatus(null);
      if (biometricEnabled) {
        // Slight delay so the UI renders smoothly before system prompt opens
        const timer = setTimeout(() => {
          handleBiometricPrompt();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isLocked, biometricEnabled, handleBiometricPrompt]);

  if (!isLocked) return null;

  // Handle number click on keypad
  const handleKeyPress = (digit: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setErrorStatus(null);

    if (pinDigits.length < 4) {
      const updated = [...pinDigits, digit];
      setPinDigits(updated);

      if (updated.length === 4) {
        const enteredPin = updated.join('');
        // Validate PIN
        if (!correctPin || enteredPin === correctPin) {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([20, 40]);
          }
          onUnlock();
        } else {
          // Wrong PIN feedback
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
          setIsShaking(true);
          setErrorStatus(t('pinIncorrect', lang));
          setTimeout(() => {
            setPinDigits([]);
            setIsShaking(false);
          }, 700);
        }
      }
    }
  };

  const handleDelete = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setPinDigits(pinDigits.slice(0, -1));
    setErrorStatus(null);
  };

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-between bg-slate-950 text-white px-6 py-10 select-none animate-fade-in backdrop-blur-2xl">
      {/* Top Header & Emblem */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Lock className="w-8 h-8 text-emerald-400 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-slate-950">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white">
          {t('appName', lang)}
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          {t('appLockedDesc', lang)}
        </p>
      </div>

      {/* Center: PIN Dots & Error Messages */}
      <div className="flex flex-col items-center w-full max-w-xs">
        {/* 4 PIN Dots */}
        <div
          className={`flex items-center justify-center gap-4 mb-4 ${
            isShaking ? 'animate-bounce text-rose-500' : ''
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pinDigits.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-sm shadow-emerald-400/50'
                    : 'border-2 border-slate-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Error notification */}
        <div className="h-6 flex items-center justify-center text-center px-2">
          {errorStatus ? (
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorStatus}</span>
            </span>
          ) : isAuthenticatingBiometric ? (
            <span className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{t('biometricScanning', lang)}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">{t('enterPin', lang)}</span>
          )}
        </div>
      </div>

      {/* Numeric Keypad (Android native biometric phone style) */}
      <div className="w-full max-w-xs space-y-3 mb-2">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-15 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-emerald-950/60 border border-slate-800/80 active:border-emerald-500/50 text-2xl font-semibold text-white transition-all flex items-center justify-center shadow-xs"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: Biometric Button, 0, Backspace */}
          {biometricEnabled ? (
            <button
              onClick={handleBiometricPrompt}
              className="h-15 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 active:scale-95 border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center gap-0.5 transition"
              title="Unlock with Fingerprint or Face"
            >
              <Fingerprint className="w-6 h-6 stroke-[2]" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Touch</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => handleKeyPress('0')}
            className="h-15 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-emerald-950/60 border border-slate-800/80 active:border-emerald-500/50 text-2xl font-semibold text-white transition-all flex items-center justify-center shadow-xs"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            disabled={pinDigits.length === 0}
            className="h-15 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:bg-slate-700/60 border border-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-30"
            title="Delete"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Biometric trigger button helper */}
        {biometricEnabled && (
          <div className="pt-2 text-center">
            <button
              onClick={handleBiometricPrompt}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition py-1 px-3 rounded-full hover:bg-emerald-950/40"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{t('useBiometricBtn', lang)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-500 text-center">
        <span>Protected with Device Biometric WebAuthn & PIN Security</span>
      </div>
    </div>
  );
};
