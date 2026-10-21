import React from 'react';
import { Language, Location, ViewMode } from '../types';
import { MapPin, Smartphone, Monitor, Globe, Moon, Sun, Code2 } from 'lucide-react';

interface NavbarProps {
  location: Location;
  onOpenLocation: () => void;
  lang: Language;
  onToggleLang: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenEmbedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  location,
  onOpenLocation,
  lang,
  onToggleLang,
  viewMode,
  onToggleViewMode,
  darkMode,
  onToggleDarkMode,
  onOpenEmbedModal,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single brand wordmark with subtitle */}
        <a
          href="#"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <span className="font-quran text-2xl text-amber-500 dark:text-amber-400 group-hover:rotate-12 transition-transform">۞</span>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-sky-800 dark:text-sky-300 leading-tight">
              {isAr ? 'سَكينة' : 'Sakina'}
            </span>
            <span className="text-[11px] text-sky-600/70 dark:text-sky-400/60 font-normal leading-none">
              {isAr ? 'رفيق يومك' : 'Your Daily Companion'}
            </span>
          </div>
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600 dark:text-stone-300">
          <a
            href="#prayers"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'مواقيت الصلاة' : 'Prayer Times'}
          </a>
          <a
            href="#goals"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'متابعة العبادات' : 'Daily Goals'}
          </a>
          <a
            href="#qibla"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'اتجاه القبلة' : 'Qibla'}
          </a>
          <a
            href="#quran"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'القرآن والختمة' : 'Quran & Khatmah'}
          </a>
          <a
            href="#adhkar"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'حصن المسلم والأذكار' : 'Hisn Al-Muslim'}
          </a>
          <a
            href="#articles"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'المقالات' : 'Articles'}
          </a>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Location button */}
          <button
            onClick={onOpenLocation}
            title={isAr ? 'تغيير المدينة' : 'Change City'}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-sky-50/80 hover:bg-sky-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-semibold text-sky-900 dark:text-sky-200 border border-sky-100 dark:border-stone-700 transition-colors whitespace-nowrap shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="max-w-[100px] truncate">{isAr ? location.cityAr : location.city}</span>
          </button>

          {/* Web / Mobile Simulator Mode Toggle */}
          <button
            onClick={onToggleViewMode}
            title={
              viewMode === 'web'
                ? (isAr ? 'التبديل إلى محاكي تطبيق الهاتف' : 'Switch to Mobile Simulator')
                : (isAr ? 'التبديل إلى بوابة الويب الكاملة' : 'Switch to Web Portal')
            }
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 hover:bg-sky-100 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            {viewMode === 'web' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">{isAr ? 'عرض الهاتف' : 'Mobile View'}</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">{isAr ? 'بوابة الويب' : 'Web View'}</span>
              </>
            )}
          </button>

          {/* Embed Widget trigger */}
          <button
            onClick={onOpenEmbedModal}
            title={isAr ? 'تضمين ويدجت المواقيت' : 'Embed Widget'}
            className="p-2 rounded-xl text-stone-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-stone-800 transition-colors hidden sm:flex shrink-0"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Language Toggle (AR / EN) */}
          <button
            onClick={onToggleLang}
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? (isAr ? 'الوضع النهاري' : 'Light Mode') : (isAr ? 'الوضع الليلي' : 'Dark Mode')}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
