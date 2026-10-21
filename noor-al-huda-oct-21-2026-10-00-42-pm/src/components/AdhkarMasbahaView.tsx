import React, { useState, useMemo, useEffect } from 'react';
import { DhikrItem, Language } from '../types';
import { ADHKAR_ITEMS } from '../data/adhkar';
import { audioEngine } from '../services/audioEngine';
import {
  Heart,
  RotateCcw,
  Check,
  Sparkles,
  Volume2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CircleDot,
  Layers,
  Sliders,
  Calendar,
  Infinity,
  Plus,
  Minus,
  Sun,
  Sunset,
  Moon,
  Clock,
  BookOpen,
  Search,
  CheckCircle2,
  ListFilter,
  PlayCircle,
} from 'lucide-react';

interface AdhkarMasbahaViewProps {
  lang: Language;
}

type MasbahaStyle = 'beads' | 'tally' | 'ring' | 'strand';
type HisnCategory = 'morning' | 'evening' | 'post_prayer' | 'sleep';

export const AdhkarMasbahaView: React.FC<AdhkarMasbahaViewProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<HisnCategory | 'daily_special' | 'travel'>('morning');
  const [items, setItems] = useState<DhikrItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakina_adhkar_items');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return ADHKAR_ITEMS;
  });

  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSequentialMode, setIsSequentialMode] = useState<boolean>(false);

  // Masbaha interactive style & custom target options
  const [masbahaStyle, setMasbahaStyle] = useState<MasbahaStyle>('beads');
  const [customTargetInput, setCustomTargetInput] = useState<string>('');
  const [showCustomTargetModal, setShowCustomTargetModal] = useState<boolean>(false);
  const [beadRotationStep, setBeadRotationStep] = useState<number>(0);

  const isAr = lang === 'ar';
  const todayDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday

  // Save progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sakina_adhkar_items', JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items]);

  const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Four Pillars of Hisn Al-Muslim summary stats
  const hisnStats = useMemo(() => {
    const calc = (cat: HisnCategory) => {
      const catItems = items.filter((it) => it.category === cat);
      const done = catItems.filter((it) => it.completed).length;
      return {
        total: catItems.length,
        done,
        percent: catItems.length > 0 ? Math.round((done / catItems.length) * 100) : 0,
      };
    };

    return {
      morning: calc('morning'),
      evening: calc('evening'),
      post_prayer: calc('post_prayer'),
      sleep: calc('sleep'),
    };
  }, [items]);

  const categoryItems = useMemo(() => {
    let list = items.filter((it) => it.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (it) =>
          it.textAr.includes(q) ||
          it.translationEn.toLowerCase().includes(q) ||
          (it.benefitAr && it.benefitAr.includes(q)) ||
          (it.referenceAr && it.referenceAr.includes(q))
      );
    }
    return list;
  }, [items, activeCategory, searchQuery]);

  // Keep index within bounds
  const safeIndex = Math.min(selectedDhikrIndex, Math.max(0, categoryItems.length - 1));
  const currentDhikr = categoryItems[safeIndex] || categoryItems[0];

  const handleIncrement = () => {
    if (!currentDhikr) return;

    audioEngine.playTasbihClick();
    setBeadRotationStep((prev) => (prev + 1) % 33);

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === currentDhikr.id) {
          const nextCount = it.currentCount + 1;
          const isDone = it.targetCount > 0 && nextCount >= it.targetCount;
          if (isDone && !it.completed) {
            audioEngine.playCompletionChime();
            // In sequential mode, auto advance to next dhikr after short pause
            if (isSequentialMode && safeIndex < categoryItems.length - 1) {
              setTimeout(() => {
                setSelectedDhikrIndex((prevIdx) => Math.min(categoryItems.length - 1, prevIdx + 1));
              }, 400);
            }
          }
          return {
            ...it,
            currentCount: nextCount,
            completed: isDone,
          };
        }
        return it;
      })
    );
  };

  const handleIncrementById = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioEngine.playTasbihClick();
    setBeadRotationStep((prev) => (prev + 1) % 33);

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const nextCount = it.currentCount + 1;
          const isDone = it.targetCount > 0 && nextCount >= it.targetCount;
          if (isDone && !it.completed) {
            audioEngine.playCompletionChime();
          }
          return {
            ...it,
            currentCount: nextCount,
            completed: isDone,
          };
        }
        return it;
      })
    );
  };

  const handleResetCurrent = () => {
    if (!currentDhikr) return;
    setItems((prev) =>
      prev.map((it) => (it.id === currentDhikr.id ? { ...it, currentCount: 0, completed: false } : it))
    );
  };

  const handleResetCategory = (cat: string) => {
    setItems((prev) =>
      prev.map((it) => (it.category === cat ? { ...it, currentCount: 0, completed: false } : it))
    );
  };

  const handleSetTarget = (target: number) => {
    if (!currentDhikr) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === currentDhikr.id
          ? {
              ...it,
              targetCount: target,
              completed: target > 0 && it.currentCount >= target,
            }
          : it
      )
    );
  };

  const handleApplyCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val >= 0) {
      handleSetTarget(val);
      setShowCustomTargetModal(false);
      setCustomTargetInput('');
    }
  };

  const hisnCategories = [
    {
      id: 'morning' as const,
      titleAr: 'أذكار الصباح',
      titleEn: 'Morning Adhkar',
      subtitleAr: 'حفظ وبركة ويقين ليومك حتى تمسي',
      subtitleEn: 'Divine protection and light until evening',
      icon: Sun,
      color: 'amber',
      accentBg: 'from-amber-500/10 to-amber-600/5 dark:from-amber-950/40 dark:to-stone-900',
      activeBorder: 'border-amber-500 text-amber-900 dark:text-amber-200',
    },
    {
      id: 'evening' as const,
      titleAr: 'أذكار المساء',
      titleEn: 'Evening Adhkar',
      subtitleAr: 'حرز ووقاية لليلتك وسلامة من كل شر',
      subtitleEn: 'Fortress against harm throughout the night',
      icon: Sunset,
      color: 'orange',
      accentBg: 'from-orange-500/10 to-amber-600/5 dark:from-orange-950/40 dark:to-stone-900',
      activeBorder: 'border-orange-500 text-orange-900 dark:text-orange-200',
    },
    {
      id: 'post_prayer' as const,
      titleAr: 'أذكار بعد الصلاة',
      titleEn: 'Post-Prayer Adhkar',
      subtitleAr: 'الاستغفار والتسبيح دبر الصلوات الخمس المكتوبة',
      subtitleEn: 'Sunnah tasbeeh following the 5 obligatory prayers',
      icon: Clock,
      color: 'sky',
      accentBg: 'from-sky-500/10 to-sky-600/5 dark:from-sky-950/40 dark:to-stone-900',
      activeBorder: 'border-sky-500 text-sky-900 dark:text-sky-200',
    },
    {
      id: 'sleep' as const,
      titleAr: 'أذكار النوم والاستيقاظ',
      titleEn: 'Sleep & Awakening',
      subtitleAr: 'سكينة وطمأنينة وحفظ الروح عند المنام واليقظة',
      subtitleEn: 'Serenity, safety, and praise upon resting and waking',
      icon: Moon,
      color: 'indigo',
      accentBg: 'from-indigo-500/10 to-purple-600/5 dark:from-indigo-950/40 dark:to-stone-900',
      activeBorder: 'border-indigo-500 text-indigo-900 dark:text-indigo-200',
    },
  ];

  // Additional Day Highlight
  const todayHighlightInfo = useMemo(() => {
    if (todayDayOfWeek === 5) {
      return {
        titleAr: 'سنة يوم الجمعة المبارك (سيد الأيام)',
        titleEn: 'Blessed Friday Sunnah',
        descAr: 'يستحب الإكثار من الصلاة على النبي ﷺ، قراءة سورة الكهف، وتحري ساعة الإجابة في آخر النهار.',
        descEn: 'Recommended: Abundant blessings on the Prophet ﷺ, reciting Surah Al-Kahf, and seeking the hour of accepted prayer.',
      };
    }
    if (todayDayOfWeek === 1 || todayDayOfWeek === 4) {
      return {
        titleAr: todayDayOfWeek === 1 ? 'سنة يوم الاثنين الفضيل' : 'سنة يوم الخميس المبارك',
        titleEn: todayDayOfWeek === 1 ? 'Virtuous Monday Sunnah' : 'Blessed Thursday Sunnah',
        descAr: 'تُعرض الأعمال على الله تبارك وتعالى، ويُستحب الصيام فيهما والاستغفار والإنابة.',
        descEn: 'Deeds are presented to Allah on Mondays and Thursdays; recommended for fasting and repentance.',
      };
    }
    return {
      titleAr: `يوم ${dayNamesAr[todayDayOfWeek]} المبارك`,
      titleEn: `Blessed ${dayNamesEn[todayDayOfWeek]}`,
      descAr: 'الأذكار الجامعة المأثورة: التوحيد 100 مرة حرز من الشيطان، والاستغفار، والحوقلة.',
      descEn: 'Authentic daily supplications: Tawheed 100 times protection from Satan, Istighfar, and Hawqala.',
    };
  }, [todayDayOfWeek]);

  return (
    <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-8">
      {/* =========================================================================
          SECTION 1: حصن المسلم — Four Core Daily Pillars (Prominent Header Hub)
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-sky-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-quran text-2xl text-amber-500 dark:text-amber-400">۞</span>
              <h2 className="text-xl md:text-2xl font-bold font-quran text-stone-900 dark:text-stone-100">
                {isAr ? 'حِصْنُ المُسْلِمِ مِنْ أَذْكَارِ الكِتَابِ وَالسُّنَّةِ' : 'Hisn Al-Muslim: Daily Fortress of Supplications'}
              </h2>
            </div>
            <p className="text-xs text-sky-700/80 dark:text-sky-300/70 mt-1">
              {isAr
                ? 'الأذكار المأثورة المصنفة لليوم والليلة ليسهل عليك الوصول إليها وتلاوتها يومياً بيقين وطمأنينة مع السبحة المباشرة'
                : 'Categorized prophetic supplications with direct interactive Masbaha counter: Morning, Evening, Post-Prayer, and Sleep'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSequentialMode(!isSequentialMode)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isSequentialMode
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-sky-50/70 dark:bg-stone-800 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-stone-700 hover:bg-sky-100'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'وضع القراءة السريعة للحصن' : 'Sequential Mode'}</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Category Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {hisnCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            const stat = hisnStats[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedDhikrIndex(0);
                }}
                className={`text-start p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs relative overflow-hidden group ${
                  isSelected
                    ? `${cat.activeBorder} bg-gradient-to-br ${cat.accentBg} shadow-md scale-[1.02]`
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 hover:border-sky-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-stone-100'
                          : 'bg-stone-200/80 dark:bg-stone-700/80 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {isAr ? cat.titleAr : cat.titleEn}
                      </h3>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {stat.done} / {stat.total} {isAr ? 'مكتمل' : 'done'}
                      </span>
                    </div>
                  </div>

                  {stat.percent === 100 && (
                    <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug line-clamp-2">
                  {isAr ? cat.subtitleAr : cat.subtitleEn}
                </p>

                {/* Progress bar inside card */}
                <div className="w-full bg-stone-200/80 dark:bg-stone-700/60 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Secondary Category Tabs (Sunnah Days & Relief) */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-stone-400 text-[11px] font-semibold me-1">
              {isAr ? 'أقسام أخرى:' : 'Other Categories:'}
            </span>
            <button
              onClick={() => {
                setActiveCategory('daily_special');
                setSelectedDhikrIndex(0);
              }}
              className={`py-1 px-3 rounded-lg font-semibold transition-colors ${
                activeCategory === 'daily_special'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {isAr ? 'أذكار اليوم المخصص في الشريعة' : 'Today\'s Sunnah Special'}
            </button>
            <button
              onClick={() => {
                setActiveCategory('travel');
                setSelectedDhikrIndex(0);
              }}
              className={`py-1 px-3 rounded-lg font-semibold transition-colors ${
                activeCategory === 'travel'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {isAr ? 'جوامع الدعاء وتفريج الهم' : 'Relief & Comprehensive'}
            </button>
          </div>

          <button
            onClick={() => handleResetCategory(activeCategory)}
            className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isAr ? 'تصفير عدادات هذا القسم' : 'Reset category counts'}</span>
          </button>
        </div>
      </div>

      {/* Today's Special Sunnah Alert Bar */}
      {activeCategory === 'daily_special' && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200">
                {isAr ? todayHighlightInfo.titleAr : todayHighlightInfo.titleEn}
              </div>
              <div className="text-stone-600 dark:text-stone-300 text-[11px] mt-0.5">
                {isAr ? todayHighlightInfo.descAr : todayHighlightInfo.descEn}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: Main Dhikr Display & Interactive Masbaha Counter
         ========================================================================= */}
      {currentDhikr ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Supplication Card (7 cols) */}
          <div className="lg:col-span-7 space-y-5 p-6 rounded-3xl bg-white dark:bg-stone-800/40 border border-sky-100 dark:border-stone-800 shadow-xs">
            {/* Top Toolbar: Progress & Nav Arrows */}
            <div className="flex items-center justify-between text-xs text-stone-500 pb-3 border-b border-sky-100 dark:border-stone-700/70">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-800 dark:text-sky-300">
                  {currentDhikr.specialOccasionAr ?? (isAr ? 'حصن المسلم' : 'Hisn Al-Muslim')}
                </span>
                <span className="text-stone-400 font-mono">
                  ({safeIndex + 1} / {categoryItems.length})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={safeIndex === 0}
                  onClick={() => setSelectedDhikrIndex((v) => Math.max(0, v - 1))}
                  className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors text-stone-600 dark:text-stone-300"
                  aria-label="Previous Dhikr"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  disabled={safeIndex === categoryItems.length - 1}
                  onClick={() => setSelectedDhikrIndex((v) => Math.min(categoryItems.length - 1, v + 1))}
                  className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors text-stone-600 dark:text-stone-300"
                  aria-label="Next Dhikr"
                >
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Arabic Supplication Text */}
            <div className="font-arabic text-xl md:text-2xl text-stone-900 dark:text-stone-100 leading-loose text-end select-text">
              {currentDhikr.textAr}
            </div>

            {/* Translation & Transliteration */}
            <div className="space-y-1.5 pt-1 text-xs text-stone-600 dark:text-stone-400">
              {currentDhikr.transliteration && (
                <p className="italic">{currentDhikr.transliteration}</p>
              )}
              {currentDhikr.translationEn && (
                <p>{currentDhikr.translationEn}</p>
              )}
            </div>

            {/* Citation & Benefit */}
            <div className="pt-3 border-t border-sky-100 dark:border-stone-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAr ? currentDhikr.referenceAr : currentDhikr.referenceEn}
              </span>
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                {isAr ? currentDhikr.benefitAr : currentDhikr.benefitEn}
              </span>
            </div>

            {/* ========================================================= */}
            {/* السبحة المدمجة مباشرة أثناء قراءة الذكر */}
            {/* ========================================================= */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/60 dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-900 border-2 border-sky-200 dark:border-sky-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                    <span className="text-amber-500 font-quran text-lg">📿</span>
                    <span>{isAr ? 'السبحة أثناء قراءة هذا الذكر:' : 'Masbaha Counter for this Supplication:'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentDhikr.targetCount > 0 ? (
                    currentDhikr.completed ? (
                      <span className="font-semibold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isAr ? 'اكتمل التكرار بحمد الله' : 'Completed'}</span>
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[11px]">
                        {isAr ? 'المتبقي:' : 'Remaining:'} <strong className="font-mono text-sky-700 dark:text-sky-300">{Math.max(0, currentDhikr.targetCount - currentDhikr.currentCount)}</strong>
                      </span>
                    )
                  ) : (
                    <span className="text-stone-500 text-[11px]">{isAr ? 'عدّ غير محدود' : 'Unlimited count'}</span>
                  )}
                </div>
              </div>

              {/* Large tactile counting plunger button */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleIncrement}
                  className={`flex-1 w-full py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-between gap-3 group border cursor-pointer ${
                    currentDhikr.completed
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-400 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-sky-600 via-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white border-sky-500 shadow-sky-600/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                      {currentDhikr.completed ? '✓' : '+1'}
                    </div>
                    <span className="text-sm">
                      {currentDhikr.completed
                        ? (isAr ? 'اكتمل الذكر! اضغط للمزيد من التسبيح' : 'Target reached! Tap for more')
                        : (isAr ? 'انقر للتسبيح والعد أثناء القراءة' : 'Tap to Count as you recite')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xl font-bold tracking-tight bg-black/20 px-3 py-1 rounded-xl">
                    <span className="tabular-nums">{currentDhikr.currentCount}</span>
                    {currentDhikr.targetCount > 0 && (
                      <span className="text-xs opacity-80 font-normal">/ {currentDhikr.targetCount}</span>
                    )}
                  </div>
                </button>

                {/* Reset button */}
                <button
                  onClick={handleResetCurrent}
                  title={isAr ? 'تصفير عداد هذا الذكر' : 'Reset this dhikr'}
                  className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar under button */}
              {currentDhikr.targetCount > 0 && (
                <div className="w-full bg-sky-100 dark:bg-sky-950/60 h-2 rounded-full overflow-hidden p-0.5 border border-sky-200 dark:border-sky-900">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentDhikr.completed ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-500 to-sky-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(4, (currentDhikr.currentCount / currentDhikr.targetCount) * 100))}%`,
                    }}
                  />
                </div>
              )}

              {/* Next Dhikr quick-hop when completed */}
              {currentDhikr.completed && safeIndex < categoryItems.length - 1 && (
                <button
                  onClick={() => setSelectedDhikrIndex((v) => Math.min(categoryItems.length - 1, v + 1))}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors"
                >
                  <span>{isAr ? 'مبارك! الانتقال إلى الذكر التالي' : 'Great job! Advance to next dhikr'}</span>
                  {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Sequential Mode Banner */}
            {isSequentialMode && (
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs flex items-center justify-between text-sky-900 dark:text-sky-200">
                <span>
                  {isAr
                    ? 'وضع القراءة السريعة نشط: عند إتمام عدد مرات التكرار، يتم الانتقال تلقائياً للذكر التالي.'
                    : 'Sequential mode active: automatically advances when target count is achieved.'}
                </span>
                <span className="font-bold font-mono">
                  {currentDhikr.currentCount} / {currentDhikr.targetCount}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Multi-Shape Masbaha (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-sky-50/50 dark:from-slate-900 dark:to-sky-950/20 border border-sky-100 dark:border-stone-800 rounded-3xl text-center space-y-5 shadow-xs">
            {/* Style Selector Toolbar (أشكال السبحة) */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-sky-100 dark:border-stone-800 text-xs">
              <span className="text-stone-500 font-semibold flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                {isAr ? 'شكل السبحة:' : 'Style:'}
              </span>

              <div className="flex items-center gap-1 p-0.5 bg-sky-50 dark:bg-stone-800 rounded-xl border border-sky-100 dark:border-stone-700">
                <button
                  onClick={() => setMasbahaStyle('beads')}
                  title={isAr ? 'شكل الخرز الإسلامي الدائري' : 'Beads Loop'}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    masbahaStyle === 'beads'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-sky-700'
                  }`}
                >
                  {isAr ? '📿 خرز' : 'Beads'}
                </button>
                <button
                  onClick={() => setMasbahaStyle('ring')}
                  title={isAr ? 'خاتم التسبيح الرقمي المضيء' : 'Digital Ring'}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    masbahaStyle === 'ring'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-sky-700'
                  }`}
                >
                  {isAr ? '💍 خاتم' : 'Ring'}
                </button>
                <button
                  onClick={() => setMasbahaStyle('tally')}
                  title={isAr ? 'العداد اليدوي الكلاسيكي' : 'Hand Tally'}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    masbahaStyle === 'tally'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-sky-700'
                  }`}
                >
                  {isAr ? '📟 عداد' : 'Tally'}
                </button>
                <button
                  onClick={() => setMasbahaStyle('strand')}
                  title={isAr ? 'مسبحة العقيق الطولية' : 'Linear Strand'}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    masbahaStyle === 'strand'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-sky-700'
                  }`}
                >
                  {isAr ? '✨ خيط' : 'Strand'}
                </button>
              </div>
            </div>

            {/* SHAPE 1: CIRCULAR BEADS ROSARY (شكل خرز السبحة الدائري) */}
            {masbahaStyle === 'beads' && (
              <div
                onClick={handleIncrement}
                className="relative w-56 h-56 flex items-center justify-center cursor-pointer select-none group"
              >
                {/* 33 Animated Realistic Beads arranged around circle */}
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${beadRotationStep * (360 / 33)}deg)` }}
                >
                  {Array.from({ length: 33 }).map((_, idx) => {
                    const angle = (idx / 33) * 2 * Math.PI;
                    const r = 90;
                    const x = 112 + r * Math.cos(angle);
                    const y = 112 + r * Math.sin(angle);
                    const isActiveBead = idx === beadRotationStep;

                    return (
                      <div
                        key={idx}
                        className={`absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all shadow-sm ${
                          isActiveBead
                            ? 'bg-amber-400 scale-125 ring-2 ring-amber-300 z-10'
                            : idx % 11 === 0
                              ? 'bg-sky-500 border border-white'
                              : 'bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 border border-sky-900/40'
                        }`}
                        style={{ left: `${x}px`, top: `${y}px` }}
                      />
                    );
                  })}
                </div>

                {/* Inner Center Touch Plunger */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 border-4 border-amber-400/80 shadow-xl flex flex-col items-center justify-center text-white active:scale-95 transition-transform group-hover:border-amber-300 z-20">
                  <span className="text-3xl font-mono font-bold tracking-tight tabular-nums text-amber-300">
                    {currentDhikr.currentCount}
                  </span>
                  <span className="text-[10px] text-sky-200 mt-0.5">
                    {currentDhikr.targetCount > 0 ? `${currentDhikr.targetCount} / ` : ''}
                    {isAr ? 'تسبيحة' : 'counts'}
                  </span>
                </div>
              </div>
            )}

            {/* SHAPE 2: ELECTRONIC DIGITAL RING (خاتم التسبيح الرقمي المضيء) */}
            {masbahaStyle === 'ring' && (
              <div
                onClick={handleIncrement}
                className="w-52 p-4 rounded-[36px] bg-gradient-to-b from-sky-700 via-sky-800 to-slate-950 border-4 border-sky-500 shadow-2xl flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform relative"
              >
                <div className="w-16 h-4 bg-sky-950/80 rounded-t-xl border-t border-sky-400/40 mb-1" />
                <div className="w-full py-3 px-4 bg-slate-950 rounded-2xl border-2 border-sky-400/40 shadow-inner flex flex-col items-center justify-center">
                  <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">
                    {isAr ? 'حِصْنُ المُسْلِمِ' : 'HISN AL-MUSLIM'}
                  </span>
                  <span className="text-4xl font-mono font-bold text-amber-300 tabular-nums">
                    {currentDhikr.currentCount.toString().padStart(4, '0')}
                  </span>
                </div>
                <div className="mt-4 w-20 h-20 rounded-full bg-gradient-to-b from-white to-sky-100 border-4 border-amber-400 shadow-xl flex items-center justify-center text-slate-900 font-bold text-xs active:scale-90 transition-transform">
                  <span className="text-sky-950 font-mono text-sm">{isAr ? 'اضغط' : 'PRESS'}</span>
                </div>
                <div className="mt-2 text-[10px] text-sky-200 font-medium">
                  {isAr ? 'خاتم التسبيح الذكي' : 'Smart Digital Ring'}
                </div>
              </div>
            )}

            {/* SHAPE 3: MECHANICAL HAND TALLY COUNTER (العداد اليدوي الكلاسيكي) */}
            {masbahaStyle === 'tally' && (
              <div
                onClick={handleIncrement}
                className="w-56 p-5 rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-sky-600/60 shadow-2xl flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
              >
                <div className="w-12 h-4 bg-gradient-to-r from-sky-200 to-slate-300 rounded-t-lg border-t border-white/60 mb-2 shadow-inner" />
                <div className="w-full py-3 px-4 bg-slate-950 rounded-xl border-2 border-slate-700 shadow-inner flex items-center justify-center gap-1 font-mono text-3xl font-bold text-amber-300 tabular-nums">
                  {currentDhikr.currentCount.toString().padStart(4, '0')}
                </div>
                <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-400 px-1">
                  <span>{isAr ? 'الهدف:' : 'Goal:'} {currentDhikr.targetCount > 0 ? currentDhikr.targetCount : '∞'}</span>
                  <span className="text-sky-400 font-bold">{isAr ? 'انقر للعد' : 'Tap to Count'}</span>
                </div>
              </div>
            )}

            {/* SHAPE 4: LINEAR BEAD STRAND (مسبحة الخيط والعقيق الطولية) */}
            {masbahaStyle === 'strand' && (
              <div
                onClick={handleIncrement}
                className="w-56 p-4 rounded-3xl bg-gradient-to-b from-white to-sky-50 dark:from-slate-900 dark:to-slate-950 border border-sky-200 dark:border-stone-800 shadow-xl flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform space-y-3"
              >
                <div className="flex items-center gap-1.5 py-2 overflow-x-hidden">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full transition-all shadow-sm ${
                        i === 3
                          ? 'bg-amber-400 scale-125 ring-2 ring-amber-300'
                          : 'bg-sky-600 border border-sky-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-3xl font-mono font-bold text-sky-700 dark:text-sky-300 tabular-nums">
                  {currentDhikr.currentCount}
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {isAr ? 'انقر لتمرير حبة العقيق' : 'Click to pass bead'}
                </span>
              </div>
            )}

            {/* Target Count Option Selector (الخيار رقم الأذكار) */}
            <div className="w-full space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-semibold">
                <span>{isAr ? 'تحديد هدف التسبيح (خيار الرقم):' : 'Set Count Target:'}</span>
                <span className="font-mono text-sky-700 dark:text-sky-400">
                  {currentDhikr.targetCount > 0 ? currentDhikr.targetCount : '∞'}
                </span>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {[1, 3, 7, 33, 99, 100, 500, 1000].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleSetTarget(count)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      currentDhikr.targetCount === count
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-sky-100 dark:border-stone-700 hover:bg-sky-50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                {/* Open / Infinite */}
                <button
                  onClick={() => handleSetTarget(0)}
                  title={isAr ? 'عدّ مفتوح دون حد' : 'Open / Infinity'}
                  className={`py-1 px-2.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    currentDhikr.targetCount === 0
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-sky-100 dark:border-stone-700 hover:bg-sky-50'
                  }`}
                >
                  ∞
                </button>
                {/* Custom numeric button */}
                <button
                  onClick={() => setShowCustomTargetModal(true)}
                  className="py-1 px-2.5 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                >
                  {isAr ? 'رقم مخصص...' : 'Custom...'}
                </button>
              </div>

              {/* Progress and Reset */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  onClick={handleResetCurrent}
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصفير العداد' : 'Reset'}</span>
                </button>
                {currentDhikr.targetCount > 0 && (
                  <span className="text-[11px] text-stone-500 font-medium">
                    {Math.min(100, Math.round((currentDhikr.currentCount / currentDhikr.targetCount) * 100))}% {isAr ? 'مكتمل' : 'completed'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-stone-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{isAr ? 'لا توجد أذكار مطابقة لبحثك في هذا القسم.' : 'No supplications found for your search.'}</p>
        </div>
      )}

      {/* Custom Target Input Dialog */}
      {showCustomTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {isAr ? 'أدخل رقم هدف التسبيح المخصص:' : 'Enter Custom Dhikr Target Count:'}
            </h4>
            <form onSubmit={handleApplyCustomTarget} className="space-y-3">
              <input
                type="number"
                min="0"
                max="99999"
                required
                autoFocus
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                placeholder={isAr ? 'مثال: 70 أو 300 أو 1000' : 'e.g. 70, 300, 1000'}
                className="w-full py-2 px-3 bg-white dark:bg-stone-800 border border-sky-200 dark:border-stone-700 rounded-xl text-center font-mono text-lg font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomTargetModal(false)}
                  className="py-1.5 px-3 text-xs text-stone-600 dark:text-stone-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 shadow-xs"
                >
                  {isAr ? 'تطبيق الرقم' : 'Apply Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: Supplications Checklist of current category
         ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {isAr ? 'فهرس أذكار هذا القسم مع السبحة المباشرة:' : 'Supplications Checklist with Inline Masbaha:'} ({categoryItems.length})
            </span>
          </h4>

          {/* Quick Search Inside Active Category */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedDhikrIndex(0);
              }}
              placeholder={isAr ? 'ابحث في نصوص الأذكار...' : 'Search within supplications...'}
              className="w-full py-1.5 px-8 text-xs bg-sky-50/50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryItems.map((item, index) => {
            const isSelected = safeIndex === index;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedDhikrIndex(index)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 shadow-xs scale-[1.01]'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2">
                    {item.textAr.slice(0, 75)}...
                  </div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-400 mt-1 truncate">
                    {item.specialOccasionAr ?? (isAr ? item.referenceAr : item.referenceEn)}
                  </div>
                </div>

                {/* Inline Masbaha Clicker Right On The Card */}
                <div className="flex items-center justify-between pt-2 border-t border-sky-100/80 dark:border-stone-800 gap-2">
                  <span className="text-[10px] text-stone-400 truncate">
                    {isAr ? item.benefitAr?.slice(0, 24) : item.benefitEn?.slice(0, 24)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleIncrementById(item.id, e)}
                    className={`py-1 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                      item.completed
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                    }`}
                    title={isAr ? 'انقر للعد فوراً أثناء القراءة' : 'Tap to count inline'}
                  >
                    {item.completed ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] font-mono opacity-90">+1</span>
                    )}
                    <span className="font-mono tabular-nums text-xs">
                      {item.currentCount}/{item.targetCount > 0 ? item.targetCount : '∞'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
