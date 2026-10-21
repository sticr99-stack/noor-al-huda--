/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  DailyGoal,
  HijriDate,
  KhatmahProgress,
  Language,
  Location,
  NextPrayerInfo,
  PrayerName,
  PrayerSettings,
  ReminderMap,
  ViewMode,
} from './types';
import { DEFAULT_LOCATION } from './data/cities';
import {
  calculatePrayerTimes,
  formatAllPrayerTimes,
  getNextPrayer,
} from './services/prayerEngine';
import { getHijriDate } from './services/hijriEngine';
import { audioEngine } from './services/audioEngine';
import { Navbar } from './components/Navbar';
import { PrayerHeroCard } from './components/PrayerHeroCard';
import { PrayerScheduleTable } from './components/PrayerScheduleTable';
import { QiblaCompassView } from './components/QiblaCompassView';
import { QuranKhatmahView } from './components/QuranKhatmahView';
import { AdhkarMasbahaView } from './components/AdhkarMasbahaView';
import { ArticlesSection } from './components/ArticlesSection';
import { HijriRamadanWidget } from './components/HijriRamadanWidget';
import { LiveStreamView } from './components/LiveStreamView';
import { LocationModal } from './components/LocationModal';
import { EmbedWidgetModal } from './components/EmbedWidgetModal';
import { FAQAndContact } from './components/FAQAndContact';
import { MobileSimulator } from './components/MobileSimulator';
import { DailyGoalsSection } from './components/DailyGoalsSection';
import { WifiOff, Heart, CheckCircle2 } from 'lucide-react';

const INITIAL_REMINDERS: ReminderMap = {
  fajr: { enabled: true, offsetMinutes: 0, sound: 'adhan' },
  sunrise: { enabled: false, offsetMinutes: 0, sound: 'chime' },
  dhuhr: { enabled: true, offsetMinutes: 0, sound: 'adhan' },
  asr: { enabled: true, offsetMinutes: 0, sound: 'adhan' },
  maghrib: { enabled: true, offsetMinutes: 0, sound: 'adhan' },
  isha: { enabled: true, offsetMinutes: 0, sound: 'adhan' },
};

const INITIAL_PRAYER_COMPLETION: Record<PrayerName, boolean> = {
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: false,
  maghrib: false,
  isha: false,
};

const todayIsoDate = new Date().toISOString().split('T')[0];

const INITIAL_GOALS: DailyGoal[] = [
  { id: 'g1', key: 'prayers_5', titleAr: 'أداء الصلوات الخمس في أوقاتها', titleEn: '5 Obligatory Prayers on time', category: 'prayer', completed: true, streakDays: 7, lastCompletedDate: todayIsoDate },
  { id: 'g2', key: 'adhkar_morning', titleAr: 'قراءة أذكار الصباح بحضور قلب', titleEn: 'Morning Adhkar recitation', category: 'dhikr', completed: true, streakDays: 14, lastCompletedDate: todayIsoDate },
  { id: 'g3', key: 'quran_wird', titleAr: 'الورد القرآني اليومي (4 صفحات فأكثر)', titleEn: 'Daily Quran portion (4+ pages)', category: 'quran', completed: false, streakDays: 5 },
  { id: 'g4', key: 'adhkar_evening', titleAr: 'قراءة أذكار المساء وحصن المسلم', titleEn: 'Evening Adhkar recitation', category: 'dhikr', completed: false, streakDays: 4 },
  { id: 'g5', key: 'rawatib', titleAr: 'صلاة السنن الرواتب (12 ركعة)', titleEn: 'Sunnah Rawatib prayers (12 Rak\'ahs)', category: 'prayer', completed: false, streakDays: 3 },
  { id: 'g6', key: 'sadaqah', titleAr: 'صدقة اليوم أو بذل معروف', titleEn: 'Daily Charity or Act of Kindness', category: 'charity', completed: false, streakDays: 2 },
];

export default function App() {
  // Persistence state
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_lang');
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_theme');
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [location, setLocation] = useState<Location>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_location');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_LOCATION;
  });

  const [settings, setSettings] = useState<PrayerSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      method: 'UmmAlQura',
      madhab: 'Standard',
      highLatitudeRule: 'AngleBased',
      hijriOffset: 0,
    };
  });

  const [reminders, setReminders] = useState<ReminderMap>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_reminders');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_REMINDERS;
  });

  const [khatmahProgress, setKhatmahProgress] = useState<KhatmahProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_khatmah');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      targetDays: 30,
      startDate: new Date().toISOString(),
      currentSurah: 1,
      currentAyah: 1,
      pagesRead: 42,
      totalPages: 604,
      dailyPagesGoal: 20,
      completedSurahs: [1],
    };
  });

  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_daily_goals');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((item: any, idx: number) => ({
              ...item,
              streakDays: typeof item.streakDays === 'number' ? item.streakDays : (INITIAL_GOALS[idx]?.streakDays ?? 1),
              lastCompletedDate: item.lastCompletedDate ?? (item.completed ? todayIsoDate : undefined),
            }));
          }
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_GOALS;
  });

  const [prayerCompletion, setPrayerCompletion] = useState<Record<PrayerName, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_prayer_completion');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_PRAYER_COMPLETION;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noor_bookmarks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [
      {
        id: 'bm-default',
        surahNumber: 1,
        surahNameAr: 'الفاتحة',
        ayahNumber: 1,
        date: new Date().toLocaleDateString(),
      },
    ];
  });

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('web');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [now, setNow] = useState<Date>(new Date());

  const isAr = lang === 'ar';

  // Live ticking clock (1-second tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Online / Offline listener
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // HTML dir and lang synchronization
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    localStorage.setItem('noor_lang', lang);
  }, [lang, isAr]);

  // Dark mode synchronization
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noor_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noor_theme', 'light');
    }
  }, [darkMode]);

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('noor_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('noor_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('noor_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('noor_khatmah', JSON.stringify(khatmahProgress));
  }, [khatmahProgress]);

  useEffect(() => {
    localStorage.setItem('noor_daily_goals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  useEffect(() => {
    localStorage.setItem('noor_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('noor_prayer_completion', JSON.stringify(prayerCompletion));
  }, [prayerCompletion]);

  // Calculate local timezone offset in hours
  const tzOffsetHours = useMemo(() => {
    // Offset in hours from UTC to local
    return -now.getTimezoneOffset() / 60;
  }, [now]);

  // Calculated prayer times
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(
      now,
      location.latitude,
      location.longitude,
      tzOffsetHours,
      settings
    );
  }, [now, location, tzOffsetHours, settings]);

  const formattedTimes = useMemo(() => {
    return formatAllPrayerTimes(prayerTimes, false, isAr ? 'ar-SA' : 'en-US');
  }, [prayerTimes, isAr]);

  const nextPrayerInfo = useMemo(() => {
    return getNextPrayer(prayerTimes, now);
  }, [prayerTimes, now]);

  const hijriDate = useMemo<HijriDate>(() => {
    return getHijriDate(now, settings.hijriOffset);
  }, [now, settings.hijriOffset]);

  const handleToggleReminder = (prayer: PrayerName) => {
    setReminders((prev) => {
      const current = prev[prayer];
      const updated = {
        ...prev,
        [prayer]: {
          ...current,
          enabled: !current.enabled,
        },
      };
      if (!current.enabled) {
        audioEngine.playPrayerAlert();
      }
      return updated;
    });
  };

  const handleTogglePrayerCompletion = (prayer: PrayerName) => {
    setPrayerCompletion((prev) => {
      const nextVal = !prev[prayer];
      const updated = { ...prev, [prayer]: nextVal };
      if (nextVal) {
        audioEngine.playTasbihClick();
      }
      const five: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const allDone = five.every((p) => updated[p]);
      if (allDone && !five.every((p) => prev[p])) {
        audioEngine.playCompletionChime();
      }
      return updated;
    });
  };

  const handleToggleGoal = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    setDailyGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id === id) {
          const nextState = !g.completed;
          if (nextState) audioEngine.playTasbihClick();

          let newStreak = g.streakDays ?? 0;
          let newDate = g.lastCompletedDate;

          if (nextState) {
            // Marked as achieved today
            if (g.lastCompletedDate === yesterday) {
              newStreak = (g.streakDays || 0) + 1;
            } else if (g.lastCompletedDate === today) {
              newStreak = Math.max(1, g.streakDays || 1);
            } else {
              // Started or continued streak
              newStreak = (g.streakDays || 0) + 1;
            }
            newDate = today;
          } else {
            // Reverting achievement
            if (g.lastCompletedDate === today) {
              newStreak = Math.max(0, (g.streakDays || 1) - 1);
              newDate = yesterday;
            }
          }

          return {
            ...g,
            completed: nextState,
            streakDays: newStreak,
            lastCompletedDate: newDate,
          };
        }
        return g;
      });

      // If all goals are now achieved, play celebration chime
      const allDone = updated.every((g) => g.completed);
      if (allDone && !prev.every((g) => g.completed)) {
        audioEngine.playCompletionChime();
      }

      return updated;
    });
  };

  const handleAddBookmark = (b: Bookmark) => {
    setBookmarks((prev) => [b, ...prev]);
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-white to-sky-50/30 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        location={location}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'web' ? 'mobile' : 'web')}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            {isAr
              ? 'أنت تعمل حالياً في وضع عدم الاتصال (Offline). جميع الحسابات الفلكية والأذكار تعمل محلياً بكفاءة تامة.'
              : 'You are currently offline. Astronomical calculations and Adhkar function locally with zero network reliance.'}
          </span>
        </div>
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {viewMode === 'mobile' ? (
          /* Mobile Simulator Mode */
          <div className="space-y-6">
            <div className="text-center space-y-1 max-w-md mx-auto">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-700 dark:text-sky-400">
                {isAr ? 'محاكي تطبيق الهاتف المحمول' : 'Mobile Companion Simulator'}
              </span>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {isAr ? 'تجربة الهاتف اللمسية مع شريط التنقل السفلي' : 'Touch-First Smartphone Experience'}
              </h2>
              <p className="text-xs text-stone-500">
                {isAr
                  ? 'تم تصميم هذا الوضع ليوفر تجربة مصممة خصيصاً لإبهام اليد والوصول السريع إلى الأذكار والمواقيت'
                  : 'Engineered with thumb-zone ergonomics, quick-tap masbaha, and offline navigation'}
              </p>
            </div>

            <MobileSimulator
              times={formattedTimes}
              nextInfo={nextPrayerInfo}
              location={location}
              hijriDate={hijriDate}
              settings={settings}
              onUpdateSettings={setSettings}
              reminders={reminders}
              khatmahProgress={khatmahProgress}
              dailyGoals={dailyGoals}
              onToggleGoal={handleToggleGoal}
              onUpdateKhatmah={setKhatmahProgress}
              onToggleReminder={handleToggleReminder}
              onOpenLocation={() => setIsLocationModalOpen(true)}
              prayerCompletion={prayerCompletion}
              onTogglePrayerCompletion={handleTogglePrayerCompletion}
              bookmarks={bookmarks}
              onAddBookmark={handleAddBookmark}
              onRemoveBookmark={handleRemoveBookmark}
              lang={lang}
            />
          </div>
        ) : (
          /* Comprehensive Web Portal Experience */
          <>
            {/* Hero Live Countdown & Dates */}
            <section aria-label="Live Prayer Status">
              <PrayerHeroCard
                times={prayerTimes}
                nextInfo={nextPrayerInfo}
                location={location}
                hijriDate={hijriDate}
                lang={lang}
                onOpenLocation={() => setIsLocationModalOpen(true)}
                onOpenSettings={() => {}}
              />
            </section>

            {/* Daily Prayer Schedule & Juristic Methods */}
            <section id="prayers" aria-label="Prayer Times Schedule">
              <PrayerScheduleTable
                times={formattedTimes}
                nextInfo={nextPrayerInfo}
                settings={settings}
                reminders={reminders}
                onUpdateSettings={setSettings}
                onToggleReminder={handleToggleReminder}
                lang={lang}
              />
            </section>

            {/* Daily Worship Goals & Animated SVG Progress Ring */}
            <section id="goals" aria-label="Daily Worship & Prayers Tracker">
              <DailyGoalsSection
                dailyGoals={dailyGoals}
                onToggleGoal={handleToggleGoal}
                prayerCompletion={prayerCompletion}
                onTogglePrayerCompletion={handleTogglePrayerCompletion}
                lang={lang}
              />
            </section>

            {/* Qibla Direction Compass */}
            <section id="qibla" aria-label="Qibla Compass">
              <QiblaCompassView
                location={location}
                lang={lang}
              />
            </section>

            {/* Quran & Khatmah Companion */}
            <section id="quran" aria-label="Holy Quran and Khatmah">
              <QuranKhatmahView
                progress={khatmahProgress}
                onUpdateProgress={setKhatmahProgress}
                bookmarks={bookmarks}
                onAddBookmark={handleAddBookmark}
                onRemoveBookmark={handleRemoveBookmark}
                lang={lang}
              />
            </section>

            {/* Adhkar & Digital Masbaha */}
            <section id="adhkar" aria-label="Adhkar and Masbaha">
              <AdhkarMasbahaView lang={lang} />
            </section>

            {/* Hijri Calendar & Ramadan Tools */}
            <section id="hijri" aria-label="Hijri Calendar and Ramadan">
              <HijriRamadanWidget
                hijriDate={hijriDate}
                lang={lang}
              />
            </section>

            {/* Articles & Scholarly Knowledge Hub */}
            <section id="articles" aria-label="Islamic Articles">
              <ArticlesSection lang={lang} />
            </section>

            {/* Live Holy Mosques Stream */}
            <section id="livestream" aria-label="Live Stream of Makkah and Madinah">
              <LiveStreamView lang={lang} />
            </section>

            {/* FAQ & Contact */}
            <section id="faq" aria-label="FAQ and Inquiries">
              <FAQAndContact lang={lang} />
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={setLocation}
        lang={lang}
      />

      <EmbedWidgetModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        location={location}
        lang={lang}
      />

      {/* Footer */}
      <footer className="w-full border-t border-sky-100 dark:border-stone-800 bg-white dark:bg-stone-900 py-8 text-xs text-stone-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-quran text-lg text-amber-500">۞</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {isAr ? 'سَكينة — رفيق يومك' : 'Sakina — Your Daily Companion'}
            </span>
          </div>

          <div className="text-center sm:text-end space-y-0.5">
            <p>
              {isAr
                ? 'مبني بحسابات فلكية دقيقة ونصوص شرعية موثقة · خالٍ من الإعلانات أو التتبع'
                : 'Engineered with precise astronomical mathematics and verified scholarly sources · Zero telemetry'}
            </p>
            <p className="text-[11px] text-stone-400">
              © 1448 AH · {new Date().getFullYear()} Sakina (سَكينة).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
