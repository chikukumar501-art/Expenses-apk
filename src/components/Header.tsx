/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Moon, Sun, Download, WifiOff, Lock } from 'lucide-react';
import { Language, UserSettings } from '../types';
import { t } from '../utils/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  isOnline: boolean;
  onOpenAPKModal?: () => void;
  onLockApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  isOnline,
  onOpenAPKModal,
  onLockApp,
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const toggleLanguage = () => {
    const nextLang: Language = settings.language === 'en' ? 'hi' : 'en';
    onUpdateSettings({ language: nextLang });
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-700 dark:bg-slate-900 text-white shadow-md transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center font-black text-lg text-emerald-100 shadow-inner">
            ₹
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight flex items-center gap-1.5">
              <span>{t('appName', settings.language)}</span>
            </h1>
            <p className="text-[11px] text-emerald-100/80 font-medium">
              {t('appSubtitle', settings.language)}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Offline badge */}
          {!isOnline && (
            <div className="flex items-center gap-1 bg-amber-500/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          )}

          {/* In-App PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm transition border border-white/20"
              title="Install app to your Android home screen"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{settings.language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center font-bold text-xs bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-2.5 py-1.5 transition text-emerald-50"
            title="Switch English / हिन्दी"
          >
            {settings.language === 'en' ? 'हिन्दी' : 'English'}
          </button>

          {/* Instant Screen Lock Button */}
          {settings.securityLockEnabled && onLockApp && (
            <button
              onClick={onLockApp}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-emerald-50 transition"
              title={t('lockAppNow', settings.language)}
              aria-label="Lock Application"
            >
              <Lock className="w-4 h-4 text-emerald-200" />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-emerald-50 transition"
            title="Toggle Light / Dark mode"
            aria-label="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
