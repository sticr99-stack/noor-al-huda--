import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
  DailyGoal,
  FormattedPrayerTimes,
  HijriDate,
  KhatmahProgress,
  Language,
  Location,
  NextPrayerInfo,
  PrayerName,
  PrayerSettings,
  ReminderMap,
  Article,
} from '../types';
import { formatCountdown, PRAYER_DISPLAY_NAMES, CALCULATION_METHODS } from '../services/prayerEngine';
import { calculateDistanceToKaaba, calculateQiblaDirection } from '../services/qiblaEngine';
import { ADHKAR_ITEMS } from '../data/adhkar';
import { SURAHS_INDEX, SurahTextData } from '../data/quranData';
import { fetchSurahText, getSurahAudioUrl } from '../services/quranService';
import { audioEngine } from '../services/audioEngine';
import { getDaysUntilRamadan, ISLAMIC_EVENTS, HIJRI_MONTHS_AR, HIJRI_MONTHS_EN } from '../services/hijriEngine';
import { ARTICLES, ARTICLE_CATEGORIES } from '../data/articles';
import {
  Clock,
  Compass,
  BookOpen,
  Heart,
  Bell,
  BellOff,
  MapPin,
  Sparkles,
  Settings,
  Volume2,
  Calendar,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  Flame,
  Play,
  Pause,
  Loader2,
  Search,
  Bookmark as BookmarkIcon,
  Eye,
  EyeOff,
  Moon,
  Award,
  BookMarked,
  X,
  Sliders,
  Radio,
} from 'lucide-react';

import { ProgressRing } from './DailyGoalsSection';
import { WeeklyWorshipTrendsChart } from './WeeklyWorshipTrendsChart';

interface MobileSimulatorProps {
  times: FormattedPrayerTimes;
  nextInfo: NextPrayerInfo;
  location: Location;
  hijriDate: HijriDate;
  settings: PrayerSettings;
  onUpdateSettings?: (settings: PrayerSettings) => void;
  reminders: ReminderMap;
  khatmahProgress: KhatmahProgress;
  dailyGoals: DailyGoal[];
  onToggleGoal: (id: string) => void;
  onUpdateKhatmah: (prog: KhatmahProgress) => void;
  onToggleReminder: (name: PrayerName) => void;
  onOpenLocation: () => void;
  prayerCompletion: Record<PrayerName, boolean>;
  onTogglePrayerCompletion: (prayer: PrayerName) => void;
  bookmarks?: Bookmark[];
  onAddBookmark?: (b: Bookmark) => void;
  onRemoveBookmark?: (id: string) => void;
  lang: Language;
}

type MobileTab = 'today' | 'prayers' | 'quran' | 'adhkar' | 'more';
type MoreSubTab = 'qibla' | 'calendar' | 'goals' | 'articles';
type MasbahaShape = 'loop' | 'ring' | 'tally' | 'strand';

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  times,
  nextInfo,
  location,
  hijriDate,
  settings,
  onUpdateSettings,
  reminders,
  khatmahProgress,
  dailyGoals,
  onToggleGoal,
  onUpdateKhatmah,
  onToggleReminder,
  onOpenLocation,
  prayerCompletion,
  onTogglePrayerCompletion,
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('today');
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTab>('qibla');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Masbaha & Adhkar state
  const [adhkarMode, setAdhkarMode] = useState<'masbaha' | 'hisn_list'>('hisn_list');
  const [masbahaShape, setMasbahaShape] = useState<MasbahaShape>('loop');
  const [masbahaTarget, setMasbahaTarget] = useState<number | null>(33);
  const [masbahaCount, setMasbahaCount] = useState<number>(0);
  const [mobileHisnCategory, setMobileHisnCategory] = useState<'morning' | 'evening' | 'post_prayer' | 'sleep'>('morning');
  const [selectedMobileDhikr, setSelectedMobileDhikr] = useState<string>('m1');
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, number>>({});

  // Quran Mobile Reader state
  const [mobileSelectedSurah, setMobileSelectedSurah] = useState<number | null>(null);
  const [mobileSurahSearch, setMobileSurahSearch] = useState<string>('');
  const [mobileSurahContent, setMobileSurahContent] = useState<SurahTextData | null>(null);
  const [mobileIsLoadingSurah, setMobileIsLoadingSurah] = useState<boolean>(false);
  const [mobileIsPlayingAudio, setMobileIsPlayingAudio] = useState<boolean>(false);
  const [mobileFontSize, setMobileFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-xl');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const mobileAudioRef = useRef<HTMLAudioElement | null>(null);

  // Azan audio state
  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(false);

  const isAr = lang === 'ar';
  const { hours, minutes, seconds } = formatCountdown(nextInfo.remainingSeconds);
  const daysUntilRamadan = getDaysUntilRamadan(hijriDate);

  const nextPrayerName = isAr
    ? PRAYER_DISPLAY_NAMES[nextInfo.next]?.ar
    : PRAYER_DISPLAY_NAMES[nextInfo.next]?.en;

  const currentDhikrObj =
    ADHKAR_ITEMS.find((d) => d.id === selectedMobileDhikr) ||
    ADHKAR_ITEMS.find((d) => d.category === mobileHisnCategory) ||
    ADHKAR_ITEMS[0];

  const categoryDhikrList = ADHKAR_ITEMS.filter((d) => d.category === mobileHisnCategory);

  // Load Quran surah on mobileSelectedSurah change
  useEffect(() => {
    if (!mobileSelectedSurah) {
      setMobileSurahContent(null);
      if (mobileAudioRef.current) {
        mobileAudioRef.current.pause();
        setMobileIsPlayingAudio(false);
      }
      return;
    }

    setMobileIsLoadingSurah(true);
    if (mobileAudioRef.current) {
      mobileAudioRef.current.pause();
      mobileAudioRef.current.src = getSurahAudioUrl(mobileSelectedSurah);
      mobileAudioRef.current.load();
      setMobileIsPlayingAudio(false);
    }

    fetchSurahText(mobileSelectedSurah)
      .then((data) => {
        setMobileSurahContent(data);
        setMobileIsLoadingSurah(false);
      })
      .catch(() => setMobileIsLoadingSurah(false));
  }, [mobileSelectedSurah]);

  const handleToggleMobileAudio = () => {
    if (!mobileSelectedSurah) return;
    if (!mobileAudioRef.current) {
      mobileAudioRef.current = new Audio(getSurahAudioUrl(mobileSelectedSurah));
      mobileAudioRef.current.onplaying = () => setMobileIsPlayingAudio(true);
      mobileAudioRef.current.onpause = () => setMobileIsPlayingAudio(false);
      mobileAudioRef.current.onended = () => setMobileIsPlayingAudio(false);
    } else {
      const expected = getSurahAudioUrl(mobileSelectedSurah);
      if (mobileAudioRef.current.src !== expected) {
        mobileAudioRef.current.src = expected;
        mobileAudioRef.current.load();
      }
    }
    if (mobileIsPlayingAudio) {
      mobileAudioRef.current.pause();
    } else {
      mobileAudioRef.current.play().catch(() => setMobileIsPlayingAudio(false));
    }
  };

  const handleMobileMasbahaTap = () => {
    audioEngine.playTasbihClick();
    setMasbahaCount((v) => {
      const next = v + 1;
      if (masbahaTarget && next >= masbahaTarget) {
        audioEngine.playCompletionChime();
      } else if (next % 33 === 0) {
        audioEngine.playCompletionChime();
      }
      return next;
    });
  };

  const handleIncrementItemCount = (id: string, targetCount: number) => {
    audioEngine.playTasbihClick();
    setDhikrCounts((prev) => {
      const current = prev[id] || 0;
      const next = current + 1;
      if (next === targetCount) {
        audioEngine.playCompletionChime();
      }
      return { ...prev, [id]: next };
    });
  };

  const handleToggleAdhanSound = () => {
    if (isPlayingAdhan) {
      setIsPlayingAdhan(false);
    } else {
      setIsPlayingAdhan(true);
      audioEngine.playAdhanTakbeer(() => setIsPlayingAdhan(false));
    }
  };

  const qiblaAngle = calculateQiblaDirection(location.latitude, location.longitude);
  const distanceKm = calculateDistanceToKaaba(location.latitude, location.longitude);

  return (
    <div className="flex justify-center my-4">
      {/* Smartphone Hardware Frame Wrapper */}
      <div className="w-full max-w-[420px] h-[820px] bg-stone-900 rounded-[48px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col overflow-hidden">
        {/* Speaker & Dynamic Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-950 rounded-full z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-stone-800 rounded-full" />
        </div>

        {/* Screen Bezel */}
        <div className="w-full h-full bg-stone-50 dark:bg-stone-950 rounded-[40px] overflow-hidden flex flex-col relative text-stone-900 dark:text-stone-100">
          {/* Top Status Bar */}
          <div className="h-10 pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-stone-500 z-20 shrink-0">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* App Header */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-sky-100 dark:border-stone-800 shrink-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="font-quran text-lg text-amber-500">۞</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sky-800 dark:text-sky-300 leading-tight">
                  {isAr ? 'سَكينة' : 'Sakina'}
                </span>
                <span className="text-[10px] text-sky-600/70 dark:text-sky-400/60 font-normal leading-none">
                  {isAr ? 'رفيق يومك' : 'Your Daily Companion'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenLocation}
                className="flex items-center gap-1 text-[11px] font-semibold text-sky-800 dark:text-sky-300 py-1 px-2 rounded-lg bg-sky-50 dark:bg-stone-800/80 border border-sky-100 dark:border-stone-700"
                title={isAr ? 'تغيير المدينة والمنطقة' : 'Change Location'}
              >
                <MapPin className="w-3 h-3 text-amber-500" />
                <span className="max-w-[70px] truncate">{isAr ? location.cityAr : location.city}</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-sky-700 dark:hover:text-stone-200 hover:bg-sky-50 dark:hover:bg-stone-800"
                title={isAr ? 'إعدادات الحساب الفلكي والمذهب' : 'Prayer Settings'}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Screen Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            {/* ========================================================= */}
            {/* TAB: TODAY (اليوم) */}
            {/* ========================================================= */}
            {activeTab === 'today' && (
              <>
                {/* Hero Mini Countdown Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 text-white shadow-md space-y-3 border border-sky-800/40">
                  <div className="flex items-center justify-between text-xs text-sky-200">
                    <span>{isAr ? 'الصلاة القادمة:' : 'Next Prayer:'}</span>
                    <span className="font-bold text-white text-sm">{nextPrayerName}</span>
                  </div>

                  <div className="flex justify-center items-center gap-2 font-mono text-3xl font-bold text-amber-300 tabular-nums py-0.5">
                    <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-sky-200/80">
                    <span className="font-mono">{times[nextInfo.next]}</span>
                    <button
                      onClick={handleToggleAdhanSound}
                      className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-sky-800/80 hover:bg-sky-700 text-amber-300 font-semibold"
                    >
                      <Volume2 className={`w-3 h-3 ${isPlayingAdhan ? 'animate-pulse' : ''}`} />
                      <span>{isPlayingAdhan ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'سماع الأذان' : 'Azan')}</span>
                    </button>
                  </div>

                  <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${nextInfo.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Animated SVG Progress Ring Showcase Card */}
                {(() => {
                  const fivePrayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                  const completedPrayersCount = fivePrayers.filter((p) => prayerCompletion[p]).length;
                  const prayerPercent = (completedPrayersCount / 5) * 100;

                  return (
                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? 'إتمام الصلوات الخمس اليوم' : 'Daily Prayers Progress'}</span>
                        </span>
                        <span className="text-[10px] text-sky-600 font-bold">
                          {completedPrayersCount} / 5
                        </span>
                      </div>

                      <div className="flex items-center justify-center py-1">
                        <ProgressRing
                          percentage={prayerPercent}
                          completedCount={completedPrayersCount}
                          totalCount={5}
                          size={135}
                          strokeWidth={10}
                          label={isAr ? `${completedPrayersCount}/5 صلوات` : `${completedPrayersCount}/5 Prayers`}
                          sublabel={isAr ? 'مكتمل' : 'Completed'}
                        />
                      </div>

                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {fivePrayers.map((pName) => {
                          const isDone = prayerCompletion[pName];
                          return (
                            <button
                              key={pName}
                              type="button"
                              onClick={() => onTogglePrayerCompletion(pName)}
                              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-[10px] transition-colors ${
                                isDone
                                  ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-xs'
                                  : 'bg-sky-50/50 dark:bg-stone-800 border-sky-100 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              <span>{isAr ? PRAYER_DISPLAY_NAMES[pName].ar : PRAYER_DISPLAY_NAMES[pName].en.slice(0, 3)}</span>
                              <div className="mt-1">
                                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-2.5 h-2.5 rounded-full border border-stone-400 block" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Ramadan & Hijri Banner Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-900/10 to-sky-500/10 border border-amber-300/40 dark:border-amber-700/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      <Moon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? hijriDate.formattedAr : hijriDate.formattedEn}</span>
                    </div>
                    <p className="text-[10px] text-stone-500">
                      {isAr ? 'العد التنازلي لشهر رمضان المبارك' : 'Countdown to Ramadan'}
                    </p>
                  </div>
                  <div className="text-center px-3 py-1 bg-white dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-xs">
                    <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                      {daysUntilRamadan}
                    </span>
                    <span className="text-[9px] block text-stone-400">{isAr ? 'يوم' : 'days'}</span>
                  </div>
                </div>

                {/* Quick Feature Action Tiles */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab('quran')}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 hover:border-sky-400 flex items-center gap-2.5 text-start transition-all shadow-xs"
                  >
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-100">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        {isAr ? 'المصحف الشريف' : 'Holy Quran'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {isAr ? '114 سورة بالترتيل' : '114 Surahs'}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('adhkar')}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 hover:border-sky-400 flex items-center gap-2.5 text-start transition-all shadow-xs"
                  >
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        {isAr ? 'حصن المسلم' : 'Hisn Al-Muslim'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {isAr ? 'أذكار وسبحة' : 'Adhkar & Masbaha'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Daily Worship Goals Mini Checklist */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'أهداف العبادة والسنن' : 'Daily Worship Goals'}</span>
                    </span>
                    <span className="text-[10px] text-sky-600 font-bold">
                      {dailyGoals.filter((g) => g.completed).length} / {dailyGoals.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {dailyGoals.slice(0, 3).map((goal) => (
                      <div
                        key={goal.id}
                        onClick={() => onToggleGoal(goal.id)}
                        className="p-2 rounded-xl hover:bg-sky-50/50 dark:hover:bg-stone-800/60 cursor-pointer flex items-center justify-between text-xs gap-2 border border-sky-50 dark:border-stone-800"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`truncate ${goal.completed ? 'line-through text-stone-400' : 'text-stone-700 dark:text-stone-300 font-medium'}`}>
                            {isAr ? goal.titleAr : goal.titleEn}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1 py-0.2 rounded border shrink-0 ${
                              goal.completed
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                                : 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400'
                            }`}
                          >
                            <Flame className={`w-2.5 h-2.5 ${goal.completed ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                            <span className="tabular-nums">{goal.streakDays}{isAr ? 'ي' : 'd'}</span>
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${goal.completed ? 'bg-sky-600 border-sky-600 text-white' : 'border-stone-300'}`}>
                          {goal.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* TAB: PRAYERS (المواقيت) */}
            {/* ========================================================= */}
            {activeTab === 'prayers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? 'مواقيت الصلاة والتنبيهات' : 'Prayers & Notifications'}
                  </h3>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{isAr ? 'طريقة الحساب' : 'Method'}</span>
                  </button>
                </div>

                {/* Calculation Info Pill */}
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] flex items-center justify-between text-sky-900 dark:text-sky-300">
                  <span className="truncate">{CALCULATION_METHODS[settings.method]?.nameAr}</span>
                  <span className="font-semibold shrink-0">
                    {settings.madhab === 'Standard' ? (isAr ? 'الجمهور' : 'Standard') : (isAr ? 'الحنفي' : 'Hanafi')}
                  </span>
                </div>

                {/* 7 Prayers List */}
                <div className="space-y-2">
                  {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight'] as const).map((p) => {
                    const isNext = nextInfo.next === p;
                    const isName = p in reminders;
                    const isEnabled = isName ? reminders[p as PrayerName]?.enabled : false;

                    return (
                      <div
                        key={p}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                          isNext
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 font-semibold shadow-xs'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm">
                            {isAr ? PRAYER_DISPLAY_NAMES[p].ar : PRAYER_DISPLAY_NAMES[p].en}
                            {isNext && (
                              <span className="ms-2 text-[10px] text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-1.5 py-0.5 rounded-md">
                                {isAr ? 'القادمة' : 'Next'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {PRAYER_DISPLAY_NAMES[p].descriptionAr}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-base font-bold tabular-nums">
                            {times[p]}
                          </span>
                          {isName && (
                            <button
                              onClick={() => onToggleReminder(p as PrayerName)}
                              title={isEnabled ? (isAr ? 'تعطيل التنبيه' : 'Disable') : (isAr ? 'تفعيل التنبيه' : 'Enable')}
                              className={`p-1.5 rounded-lg ${
                                isEnabled
                                  ? 'text-sky-600 bg-sky-100 dark:bg-sky-900/60'
                                  : 'text-stone-400 bg-stone-100 dark:bg-stone-800'
                              }`}
                            >
                              {isEnabled ? <Bell className="w-3.5 h-3.5 fill-current" /> : <BellOff className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Adhan Audio Player trigger */}
                <button
                  onClick={handleToggleAdhanSound}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAdhan ? 'animate-pulse text-amber-300' : ''}`} />
                  <span>{isPlayingAdhan ? (isAr ? 'إيقاف نداء الأذان' : 'Stop Adhan') : (isAr ? 'سماع تكبيرات الأذان الشريف' : 'Listen to Adhan')}</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: QURAN & KHATMAH (المصحف الشريف) */}
            {/* ========================================================= */}
            {activeTab === 'quran' && (
              <div className="space-y-4">
                {/* 1. Mobile Quran Reader View if Surah selected */}
                {mobileSelectedSurah !== null ? (
                  <div className="space-y-3">
                    {/* Reader Top Controls */}
                    <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
                      <button
                        onClick={() => setMobileSelectedSurah(null)}
                        className="flex items-center gap-1 py-1 px-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 rounded-lg shrink-0 border border-sky-100 dark:border-sky-900"
                      >
                        {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                        <span>{isAr ? 'السور' : 'Surahs'}</span>
                      </button>

                      <div className="text-center truncate">
                        <div className="font-quran font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                          {mobileSurahContent?.titleAr ?? `سورة ${mobileSelectedSurah}`}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {SURAHS_INDEX.find((s) => s.number === mobileSelectedSurah)?.numberOfAyahs} {isAr ? 'آية' : 'ayahs'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={handleToggleMobileAudio}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                            mobileIsPlayingAudio
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                          title={isAr ? 'ترتيل مشاري العفاسي' : 'Recitation'}
                        >
                          {mobileIsPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => setMobileFontSize((s) => (s === 'text-lg' ? 'text-xl' : s === 'text-xl' ? 'text-2xl' : 'text-lg'))}
                          className="p-1.5 rounded-lg text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                          title={isAr ? 'تكبير الخط' : 'Font Size'}
                        >
                          A
                        </button>

                        <button
                          onClick={() => setShowTranslation((v) => !v)}
                          className="p-1.5 rounded-lg text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                          title={isAr ? 'ترجمة' : 'Translation'}
                        >
                          {showTranslation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Verses Container */}
                    <div className="p-4 bg-white dark:bg-stone-900/60 border border-sky-100 dark:border-stone-800 rounded-2xl max-h-[460px] overflow-y-auto space-y-4">
                      {mobileIsLoadingSurah ? (
                        <div className="py-16 text-center space-y-2">
                          <Loader2 className="w-6 h-6 mx-auto text-sky-600 animate-spin" />
                          <p className="text-xs text-stone-500 font-medium">
                            {isAr ? 'جاري فتح المصحف الشريف...' : 'Loading Holy Surah...'}
                          </p>
                        </div>
                      ) : (
                        <>
                          {mobileSurahContent?.bismillah && (
                            <div className="text-center py-2 font-quran text-lg text-sky-800 dark:text-sky-300 border-b border-sky-100 dark:border-stone-800/60">
                              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </div>
                          )}

                          <div className="space-y-4 divide-y divide-sky-100/60 dark:divide-stone-800/60">
                            {mobileSurahContent?.ayahs.map((ayah) => {
                              const isBookmarked = bookmarks.some(
                                (b) => b.surahNumber === mobileSelectedSurah && b.ayahNumber === ayah.numberInSurah
                              );

                              return (
                                <div key={ayah.numberInSurah} className="pt-3 space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`font-quran ${mobileFontSize} text-stone-900 dark:text-stone-100 text-end leading-loose flex-1`}>
                                      {ayah.textAr}
                                      <span className="inline-flex items-center justify-center w-6 h-6 mx-1.5 rounded-full border border-amber-500/70 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 align-middle">
                                        {ayah.numberInSurah}
                                      </span>
                                    </p>

                                    {onAddBookmark && (
                                      <button
                                        onClick={() => {
                                          if (isBookmarked && onRemoveBookmark) {
                                            const found = bookmarks.find(
                                              (b) => b.surahNumber === mobileSelectedSurah && b.ayahNumber === ayah.numberInSurah
                                            );
                                            if (found) onRemoveBookmark(found.id);
                                          } else {
                                            onAddBookmark({
                                              id: `bm-${Date.now()}`,
                                              surahNumber: mobileSelectedSurah,
                                              surahNameAr: mobileSurahContent.titleAr,
                                              ayahNumber: ayah.numberInSurah,
                                              date: new Date().toLocaleDateString(),
                                            });
                                            audioEngine.playTasbihClick();
                                          }
                                        }}
                                        className={`p-1 rounded-md shrink-0 ${isBookmarked ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                                      >
                                        <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                                      </button>
                                    )}
                                  </div>

                                  {showTranslation && ayah.translationEn && (
                                    <p className="text-[11px] text-stone-500 italic">
                                      {ayah.translationEn}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Prev / Next footer */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        disabled={mobileSelectedSurah <= 1}
                        onClick={() => setMobileSelectedSurah(Math.max(1, mobileSelectedSurah - 1))}
                        className="py-1 px-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30"
                      >
                        {isAr ? 'السورة السابقة' : 'Previous'}
                      </button>
                      <button
                        onClick={() => setMobileSelectedSurah(null)}
                        className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold"
                      >
                        {isAr ? 'فهرس الـ 114 سورة' : 'All Surahs'}
                      </button>
                      <button
                        disabled={mobileSelectedSurah >= 114}
                        onClick={() => setMobileSelectedSurah(Math.min(114, mobileSelectedSurah + 1))}
                        className="py-1 px-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30"
                      >
                        {isAr ? 'السورة التالية' : 'Next'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 2. Surahs List & Khatmah Planner View */
                  <div className="space-y-3.5">
                    {/* Monthly Khatmah summary banner */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 text-white space-y-2 text-center shadow-md border border-sky-800/40">
                      <div className="text-[11px] text-sky-200 font-medium">
                        {isAr ? 'متابعة الختمة الشهرية' : 'Monthly Khatmah'}
                      </div>
                      <div className="text-xl font-mono font-bold text-amber-300">
                        {khatmahProgress.pagesRead} / {khatmahProgress.totalPages} {isAr ? 'صفحة' : 'pages'}
                      </div>
                      <div className="flex justify-center gap-2 pt-0.5">
                        <button
                          onClick={() => onUpdateKhatmah({ ...khatmahProgress, pagesRead: Math.min(604, khatmahProgress.pagesRead + 1) })}
                          className="py-1 px-2 bg-sky-800 hover:bg-sky-700 rounded-lg text-xs font-semibold"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onUpdateKhatmah({ ...khatmahProgress, pagesRead: Math.min(604, khatmahProgress.pagesRead + 4) })}
                          className="py-1 px-2.5 bg-sky-800 hover:bg-sky-700 rounded-lg text-xs font-semibold"
                        >
                          +4 {isAr ? 'صفحات' : 'p'}
                        </button>
                        <button
                          onClick={() => onUpdateKhatmah({ ...khatmahProgress, pagesRead: Math.min(604, khatmahProgress.pagesRead + 20) })}
                          className="py-1 px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                        >
                          +20 (جزء)
                        </button>
                      </div>
                    </div>

                    {/* Search Input for Surahs */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-stone-400 pointer-events-none" />
                      <input
                        type="text"
                        value={mobileSurahSearch}
                        onChange={(e) => setMobileSurahSearch(e.target.value)}
                        placeholder={isAr ? 'ابحث برقم أو اسم السورة...' : 'Search surah...'}
                        className="w-full py-1.5 px-8 text-xs bg-sky-50/50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    {/* Quick Surahs Selector Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      {[
                        { num: 1, ar: 'الفاتحة' },
                        { num: 18, ar: 'الكهف' },
                        { num: 36, ar: 'يس' },
                        { num: 56, ar: 'الواقعة' },
                        { num: 67, ar: 'الملك' },
                        { num: 112, ar: 'الإخلاص' },
                      ].map((qs) => (
                        <button
                          key={qs.num}
                          onClick={() => setMobileSelectedSurah(qs.num)}
                          className="py-1 px-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 font-semibold shrink-0 whitespace-nowrap"
                        >
                          {qs.ar}
                        </button>
                      ))}
                    </div>

                    {/* Filtered All 114 Surahs list */}
                    <div className="space-y-1.5 max-h-[340px] overflow-y-auto">
                      {SURAHS_INDEX.filter(
                        (s) =>
                          s.nameAr.includes(mobileSurahSearch) ||
                          s.nameEn.toLowerCase().includes(mobileSurahSearch.toLowerCase()) ||
                          s.number.toString().includes(mobileSurahSearch)
                      ).map((s) => (
                        <button
                          key={s.number}
                          onClick={() => setMobileSelectedSurah(s.number)}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-sky-500 hover:bg-sky-50/30 flex items-center justify-between text-xs transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 flex items-center justify-center font-mono text-[10px] font-bold">
                              {s.number}
                            </span>
                            <div className="text-start">
                              <span className="font-bold text-stone-900 dark:text-stone-100 block">{isAr ? s.nameAr : s.nameEn}</span>
                              <span className="text-[10px] text-stone-400">
                                {isAr ? (s.revelationType === 'Meccan' ? 'مكية' : 'مدنية') : s.revelationType} · {s.numberOfAyahs} {isAr ? 'آية' : 'v'}
                              </span>
                            </div>
                          </div>
                          <span className="py-1 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                            <BookOpen className="w-3 h-3" />
                            <span>{isAr ? 'اقرأ' : 'Read'}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: ADHKAR & DIGITAL MASBAHA (حصن المسلم والسبحة) */}
            {/* ========================================================= */}
            {activeTab === 'adhkar' && (
              <div className="space-y-3.5">
                {/* 4 Hisn Al-Muslim Category Pills */}
                <div className="w-full flex items-center justify-between gap-1 p-1 bg-sky-50/70 dark:bg-stone-900 rounded-xl overflow-x-auto text-[11px] border border-sky-100 dark:border-stone-800">
                  {[
                    { id: 'morning' as const, ar: '🌅 الصباح', en: 'Morning' },
                    { id: 'evening' as const, ar: '🌇 المساء', en: 'Evening' },
                    { id: 'post_prayer' as const, ar: '🕌 بعد الصلاة', en: 'Prayers' },
                    { id: 'sleep' as const, ar: '🌙 النوم', en: 'Sleep' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setMobileHisnCategory(cat.id);
                        const firstInCat = ADHKAR_ITEMS.find((d) => d.category === cat.id);
                        if (firstInCat) setSelectedMobileDhikr(firstInCat.id);
                        setMasbahaCount(0);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-colors whitespace-nowrap text-center ${
                        mobileHisnCategory === cat.id
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-sky-700'
                      }`}
                    >
                      {isAr ? cat.ar : cat.en}
                    </button>
                  ))}
                </div>

                {/* Sub-mode switch: Hisn List vs Tactile Masbaha */}
                <div className="flex items-center justify-center gap-2 p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl text-xs">
                  <button
                    onClick={() => setAdhkarMode('hisn_list')}
                    className={`flex-1 py-1 px-3 rounded-lg font-bold transition-all ${
                      adhkarMode === 'hisn_list' ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    {isAr ? 'قائمة أذكار الحصن' : 'Hisn Supplications'}
                  </button>
                  <button
                    onClick={() => setAdhkarMode('masbaha')}
                    className={`flex-1 py-1 px-3 rounded-lg font-bold transition-all ${
                      adhkarMode === 'masbaha' ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    {isAr ? 'السبحة التفاعلية' : 'Digital Masbaha'}
                  </button>
                </div>

                {/* MODE A: Hisn Al-Muslim Complete Supplications List */}
                {adhkarMode === 'hisn_list' && (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto relative">
                    {categoryDhikrList.map((item, idx) => {
                      const count = dhikrCounts[item.id] || 0;
                      const target = item.targetCount || 1;
                      const isComplete = count >= target;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMobileDhikr(item.id)}
                          className={`p-3 rounded-2xl border transition-all text-xs space-y-2 cursor-pointer ${
                            isComplete
                              ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
                              : selectedMobileDhikr === item.id
                                ? 'bg-white dark:bg-stone-900 border-sky-500 ring-1 ring-sky-400'
                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-sky-800 dark:text-sky-300">
                              {idx + 1}. {item.specialOccasionAr ?? (isAr ? 'ذِكر مأثور' : 'Supplication')}
                            </span>
                            <span className="font-mono text-stone-500 font-bold">
                              {count} / {target}
                            </span>
                          </div>

                          <p className="font-arabic text-sm text-stone-900 dark:text-stone-100 leading-relaxed text-end">
                            {item.textAr}
                          </p>

                          {item.benefitAr && (
                            <p className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50">
                              {item.benefitAr}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-stone-400">{item.referenceAr}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncrementItemCount(item.id, target);
                                setSelectedMobileDhikr(item.id);
                              }}
                              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs ${
                                isComplete
                                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                              }`}
                            >
                              <span className="text-[10px]">📿</span>
                              <span>{isComplete ? (isAr ? 'تم الذكر ✓' : 'Done ✓') : `${count + 1} / ${target}`}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Docked Sticky Quick Masbaha for one-thumb counting during recitation */}
                    <div className="sticky bottom-0 -mx-1 p-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 text-white shadow-xl border border-sky-400 flex items-center justify-between gap-2 z-20 backdrop-blur-md">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-[10px] text-sky-200 font-semibold">
                          <span>📿</span>
                          <span>{isAr ? 'السبحة السريعة أثناء القراءة' : 'Reading Masbaha'}</span>
                        </div>
                        <div className="text-xs font-bold truncate mt-0.5">
                          {currentDhikrObj.textAr.slice(0, 36)}...
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIncrementItemCount(currentDhikrObj.id, currentDhikrObj.targetCount || 1)}
                        className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-mono text-xs font-bold active:scale-95 transition-transform flex items-center gap-1 shadow-md shrink-0 cursor-pointer"
                      >
                        <span>+1</span>
                        <span className="tabular-nums">
                          ({dhikrCounts[currentDhikrObj.id] || 0}/{currentDhikrObj.targetCount || 1})
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* MODE B: Interactive Digital Masbaha with 4 Shapes */}
                {adhkarMode === 'masbaha' && (
                  <div className="space-y-3 flex flex-col items-center">
                    {/* 4 Masbaha Shapes Selector */}
                    <div className="w-full flex items-center justify-center gap-1 p-1 bg-sky-50/70 dark:bg-stone-900 rounded-xl text-[10px] border border-sky-100 dark:border-stone-800">
                      {[
                        { id: 'loop' as const, ar: 'دائرية', en: 'Loop' },
                        { id: 'ring' as const, ar: 'خاتم', en: 'Ring' },
                        { id: 'tally' as const, ar: 'عداد', en: 'Tally' },
                        { id: 'strand' as const, ar: 'مسباح', en: 'Strand' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setMasbahaShape(s.id)}
                          className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-colors ${
                            masbahaShape === s.id ? 'bg-sky-600 text-white shadow-xs' : 'text-stone-500 hover:text-sky-700'
                          }`}
                        >
                          {isAr ? s.ar : s.en}
                        </button>
                      ))}
                    </div>

                    {/* Active Dhikr Selector Card */}
                    <div className="w-full text-center p-3 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 text-xs space-y-1 shadow-xs">
                      <span className="text-[10px] text-sky-600 font-bold">
                        {currentDhikrObj.specialOccasionAr ?? (isAr ? 'حصن المسلم' : 'Hisn Al-Muslim')}
                      </span>
                      <div className="font-arabic text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {currentDhikrObj.textAr.slice(0, 90)}...
                      </div>
                      <div className="text-[10px] text-stone-500">{currentDhikrObj.referenceAr}</div>
                    </div>

                    {/* The Visual Masbaha Button corresponding to Shape */}
                    {masbahaShape === 'loop' && (
                      <button
                        onClick={handleMobileMasbahaTap}
                        className="w-44 h-44 rounded-full bg-gradient-to-br from-sky-700 via-sky-800 to-slate-950 text-white flex flex-col items-center justify-center border-4 border-amber-400 shadow-2xl active:scale-95 transition-transform my-2 relative cursor-pointer"
                      >
                        <span className="text-4xl font-mono font-bold text-amber-300 tabular-nums">{masbahaCount}</span>
                        <span className="text-[10px] text-sky-200 mt-1">{isAr ? 'انقر للعد والتسبيح' : 'Tap to Count'}</span>
                      </button>
                    )}

                    {masbahaShape === 'ring' && (
                      <button
                        onClick={handleMobileMasbahaTap}
                        className="w-40 h-44 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center border-4 border-sky-500 shadow-2xl active:scale-95 transition-transform my-2 p-3 cursor-pointer"
                      >
                        <div className="w-full bg-slate-950 p-3 rounded-xl border border-sky-400/40 text-center mb-2">
                          <span className="text-3xl font-mono font-bold text-amber-300 tabular-nums">{masbahaCount}</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center shadow-inner">
                          <span className="text-xs font-bold text-white">TAP</span>
                        </div>
                      </button>
                    )}

                    {masbahaShape === 'tally' && (
                      <button
                        onClick={handleMobileMasbahaTap}
                        className="w-44 h-40 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex flex-col items-center justify-center border-2 border-sky-600/60 shadow-2xl active:scale-95 transition-transform my-2 p-4 cursor-pointer"
                      >
                        <div className="bg-slate-950 px-5 py-2 rounded-lg border border-amber-400/50 mb-2">
                          <span className="text-3xl font-mono font-bold text-amber-400 tabular-nums">{masbahaCount}</span>
                        </div>
                        <span className="text-[10px] text-sky-200">{isAr ? 'كليكر يدوي' : 'Tally Clicker'}</span>
                      </button>
                    )}

                    {masbahaShape === 'strand' && (
                      <button
                        onClick={handleMobileMasbahaTap}
                        className="w-44 h-44 rounded-full bg-sky-950 border-4 border-amber-400 flex flex-col items-center justify-center active:scale-95 transition-transform my-2 shadow-xl cursor-pointer"
                      >
                        <span className="text-4xl font-mono font-bold text-amber-300 tabular-nums">{masbahaCount}</span>
                        <span className="text-[10px] text-sky-200 mt-1">{isAr ? 'حبات المسباح' : 'Bead Strand'}</span>
                      </button>
                    )}

                    {/* Target numbers & reset */}
                    <div className="w-full space-y-1 text-center">
                      <span className="text-[10px] text-stone-500 font-semibold">{isAr ? 'خيار رقم الهدف:' : 'Target Count:'}</span>
                      <div className="flex items-center justify-center gap-1.5">
                        {[33, 99, 100].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              audioEngine.playTasbihClick();
                              setMasbahaTarget(num);
                              setMasbahaCount(0);
                            }}
                            className={`py-1 px-2.5 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                              masbahaTarget === num ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setMasbahaTarget(null);
                            setMasbahaCount(0);
                          }}
                          className={`py-1 px-2.5 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                            masbahaTarget === null ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          ∞
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setMasbahaCount(0)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 pt-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تصفير العداد' : 'Reset'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: MORE (القبلة، التقويم، الأهداف، المقالات) */}
            {/* ========================================================= */}
            {activeTab === 'more' && (
              <div className="space-y-3.5">
                {/* 4 Sub-Tabs */}
                <div className="w-full flex items-center justify-between gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl text-[11px]">
                  {[
                    { id: 'qibla' as const, icon: Compass, ar: 'القبلة', en: 'Qibla' },
                    { id: 'calendar' as const, icon: Calendar, ar: 'التقويم', en: 'Hijri' },
                    { id: 'goals' as const, icon: Sparkles, ar: 'الأهداف', en: 'Goals' },
                    { id: 'articles' as const, icon: BookMarked, ar: 'المقالات', en: 'Articles' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setMoreSubTab(st.id)}
                      className={`flex-1 py-1.5 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors ${
                        moreSubTab === st.id ? 'bg-sky-600 text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <st.icon className="w-3 h-3" />
                      <span>{isAr ? st.ar : st.en}</span>
                    </button>
                  ))}
                </div>

                {/* SUB-TAB 1: QIBLA */}
                {moreSubTab === 'qibla' && (
                  <div className="space-y-4 flex flex-col items-center text-center">
                    <div className="text-xs text-stone-500">
                      {isAr ? `سمت القبلة: ${qiblaAngle}°` : `Qibla Angle: ${qiblaAngle}°`} · {distanceKm} {isAr ? 'كم عن الكعبة' : 'km to Kaaba'}
                    </div>

                    <div className="w-48 h-48 rounded-full border-4 border-sky-400/50 bg-sky-50/50 dark:bg-stone-900 relative flex items-center justify-center my-2 shadow-inner">
                      <div
                        className="absolute w-full h-full flex items-center justify-center transition-transform duration-700"
                        style={{ transform: `rotate(${qiblaAngle}deg)` }}
                      >
                        <div className="w-1.5 h-20 bg-sky-600 rounded-full -translate-y-6 shadow-sm" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-700 to-sky-900 text-amber-300 flex items-center justify-center font-bold text-xs shadow z-10 border border-amber-400/40">
                        🕋
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 px-4">
                      {isAr
                        ? 'وجّه رأس هاتفك باتجاه الخط السماوي للتوجه نحو الكعبة المشرفة بمكة المكرمة.'
                        : 'Point the top of your phone toward the sky blue marker to face the Kaaba.'}
                    </p>
                  </div>
                )}

                {/* SUB-TAB 2: CALENDAR & RAMADAN */}
                {moreSubTab === 'calendar' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 text-white space-y-1 text-center shadow-sm border border-sky-700/50">
                      <span className="text-xs text-amber-300 font-bold block">
                        {isAr ? 'التقويم الهجري الموثق' : 'Hijri Calendar'}
                      </span>
                      <div className="text-lg font-bold">
                        {isAr ? hijriDate.formattedAr : hijriDate.formattedEn}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-500 block">
                        {isAr ? 'المناسبات الإسلامية الكبرى القادمة' : 'Key Islamic Milestones'}
                      </span>
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                        {ISLAMIC_EVENTS.map((ev, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-stone-800 dark:text-stone-200">
                              {isAr ? ev.titleAr : ev.titleEn}
                            </span>
                            <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md">
                              {ev.hijriDay} {isAr ? HIJRI_MONTHS_AR[ev.hijriMonth - 1] : HIJRI_MONTHS_EN[ev.hijriMonth - 1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 3: GOALS (أهداف العبادة) */}
                {moreSubTab === 'goals' && (
                  <div className="space-y-4">
                    <WeeklyWorshipTrendsChart
                      prayerCompletion={prayerCompletion}
                      dailyGoals={dailyGoals}
                      lang={lang}
                    />

                    <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 pt-1">
                      {isAr ? 'قائمة الأوراد والسنن اليومية' : 'Daily Worship & Sunnahs'}
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {dailyGoals.map((goal) => (
                        <div
                          key={goal.id}
                          onClick={() => onToggleGoal(goal.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs gap-2 ${
                            goal.completed
                              ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300'
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`truncate ${goal.completed ? 'line-through text-stone-400' : 'font-medium'}`}>
                              {isAr ? goal.titleAr : goal.titleEn}
                            </span>
                            <span
                              className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                goal.completed
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                                  : 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400'
                              }`}
                            >
                              <Flame className={`w-2.5 h-2.5 ${goal.completed ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                              <span className="tabular-nums">{goal.streakDays} {isAr ? 'يوم' : 'd'}</span>
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              goal.completed ? 'bg-sky-600 border-sky-600 text-white' : 'border-stone-300 dark:border-stone-700'
                            }`}
                          >
                            {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 4: ARTICLES (المقالات والفوائد) */}
                {moreSubTab === 'articles' && (
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-stone-500 block">
                      {isAr ? 'مقالات فقهية وبحوث موثقة' : 'Islamic Articles'}
                    </span>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {ARTICLES.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => setSelectedArticle(art)}
                          className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 hover:border-sky-400 cursor-pointer transition-colors space-y-1.5"
                        >
                          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {isAr ? art.titleAr : art.titleEn}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-2">
                            {isAr ? art.excerptAr : art.excerptEn}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-sky-700 dark:text-sky-400 pt-1">
                            <span>{art.readTimeMinutes} {isAr ? 'دقائق قراءة' : 'min'}</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{isAr ? 'اقرأ المقال ←' : 'Read →'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Ergonomic 5-Tab Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-sky-100 dark:border-stone-800 grid grid-cols-5 items-center px-1 z-30">
            {[
              { id: 'today', icon: Clock, labelAr: 'اليوم', labelEn: 'Today' },
              { id: 'prayers', icon: Bell, labelAr: 'المواقيت', labelEn: 'Prayers' },
              { id: 'quran', icon: BookOpen, labelAr: 'المصحف', labelEn: 'Quran' },
              { id: 'adhkar', icon: Heart, labelAr: 'الأذكار', labelEn: 'Adhkar' },
              { id: 'more', icon: Compass, labelAr: 'المزيد', labelEn: 'More' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MobileTab)}
                  className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                    isActive
                      ? 'text-sky-600 dark:text-sky-400 font-bold'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[10px] mt-1">{isAr ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Article Full Reading Modal inside Mobile */}
          {selectedArticle && (
            <div className="absolute inset-0 bg-white dark:bg-stone-950 z-50 p-5 overflow-y-auto space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-stone-800">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{isAr ? 'العودة' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? selectedArticle.titleAr : selectedArticle.titleEn}
                </h3>
                <div className="text-[11px] text-stone-400">
                  {isAr ? selectedArticle.authorAr : selectedArticle.authorEn} · {selectedArticle.publishedDate}
                </div>
              </div>

              <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-3 font-sans whitespace-pre-line border-t border-sky-100 dark:border-stone-800 pt-3">
                {isAr ? selectedArticle.contentAr : selectedArticle.contentEn}
              </div>
            </div>
          )}

          {/* Prayer Calculation Settings Modal inside Mobile */}
          {showSettingsModal && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3">
              <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90%] overflow-y-auto border border-sky-100 dark:border-stone-800">
                <div className="flex items-center justify-between border-b border-sky-100 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'إعدادات الحساب الفلكي والمذهب' : 'Calculation Settings'}</span>
                  </h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Calculation Method Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {isAr ? 'طريقة الحساب المعتمدة:' : 'Calculation Method:'}
                  </label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {(Object.keys(CALCULATION_METHODS) as (keyof typeof CALCULATION_METHODS)[]).map((key) => {
                      const m = CALCULATION_METHODS[key];
                      const isSelected = settings.method === key;

                      return (
                        <button
                          key={key}
                          onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, method: key })}
                          className={`w-full p-2.5 rounded-xl border text-start flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 font-bold text-sky-900 dark:text-sky-200'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span className="truncate">{m.nameAr}</span>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Asr Madhab Selection */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {isAr ? 'مذهب حساب وقت صلاة العصر:' : 'Asr Juristic Method (Madhab):'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, madhab: 'Standard' })}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        settings.madhab === 'Standard'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200'
                      }`}
                    >
                      {isAr ? 'الجمهور (ظل واحد)' : 'Standard'}
                    </button>
                    <button
                      onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, madhab: 'Hanafi' })}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        settings.madhab === 'Hanafi'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200'
                      }`}
                    >
                      {isAr ? 'الحنفي (ظلان)' : 'Hanafi'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-2 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isAr ? 'حفظ وتطبيق المواقيت' : 'Save & Apply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
