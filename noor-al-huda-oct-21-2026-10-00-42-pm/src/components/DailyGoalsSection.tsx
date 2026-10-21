import React, { useState } from 'react';
import { DailyGoal, Language, PrayerName } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerEngine';
import { audioEngine } from '../services/audioEngine';
import { WeeklyWorshipTrendsChart } from './WeeklyWorshipTrendsChart';
import {
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  RotateCcw,
  Award,
  BookOpen,
  Heart,
  HandHeart,
  Flame,
} from 'lucide-react';

interface ProgressRingProps {
  percentage: number;
  completedCount: number;
  totalCount: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  completedCount,
  totalCount,
  size = 180,
  strokeWidth = 12,
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedPercent = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;

  // Segment markers for the 5 prayers (angles: 0, 72, 144, 216, 288 degrees)
  const segments = [0, 1, 2, 3, 4];

  return (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center drop-shadow-sm"
      >
        <defs>
          {/* Celestial Sky Blue to Luminous Amber Gold gradient */}
          <linearGradient id="progressRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle guide track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-sky-100 dark:text-stone-800 transition-colors"
        />

        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressRingGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={normalizedPercent > 0 ? 'url(#ringGlow)' : undefined}
          style={{
            transition: 'stroke-dashoffset 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* 5 Prayer Milestone Dots around the ring */}
        {segments.map((idx) => {
          const angle = (idx / 5) * 2 * Math.PI;
          const cx = size / 2 + radius * Math.cos(angle);
          const cy = size / 2 + radius * Math.sin(angle);
          const isReached = (idx + 1) <= completedCount;

          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={strokeWidth / 3}
              fill={isReached ? '#f59e0b' : '#94a3b8'}
              className="transition-colors duration-500"
            />
          );
        })}
      </svg>

      {/* Centerpiece Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none">
        <span className="text-3xl md:text-4xl font-mono font-bold text-stone-900 dark:text-stone-100 tracking-tight tabular-nums transition-all">
          {Math.round(normalizedPercent)}%
        </span>
        <span className="text-xs font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
          {label ?? `${completedCount} / ${totalCount}`}
        </span>
        {sublabel && (
          <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

interface DailyGoalsSectionProps {
  dailyGoals: DailyGoal[];
  onToggleGoal: (id: string) => void;
  prayerCompletion: Record<PrayerName, boolean>;
  onTogglePrayerCompletion: (prayer: PrayerName) => void;
  lang: Language;
}

export const DailyGoalsSection: React.FC<DailyGoalsSectionProps> = ({
  dailyGoals,
  onToggleGoal,
  prayerCompletion,
  onTogglePrayerCompletion,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'prayer' | 'quran' | 'dhikr' | 'charity'>('all');
  const isAr = lang === 'ar';

  const fivePrayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const completedPrayersCount = fivePrayers.filter((p) => prayerCompletion[p]).length;
  const prayersPercent = (completedPrayersCount / 5) * 100;

  const totalOtherGoals = dailyGoals.length;
  const completedOtherGoals = dailyGoals.filter((g) => g.completed).length;

  // Combined overall worship score (5 prayers + goals)
  const totalWorshipItems = 5 + totalOtherGoals;
  const completedWorshipItems = completedPrayersCount + completedOtherGoals;
  const overallPercent = Math.round((completedWorshipItems / totalWorshipItems) * 100);

  const handlePrayerClick = (prayer: PrayerName) => {
    onTogglePrayerCompletion(prayer);
  };

  const getPrayerIcon = (name: PrayerName) => {
    switch (name) {
      case 'fajr':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'dhuhr':
        return <Sun className="w-4 h-4 text-amber-600" />;
      case 'asr':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'maghrib':
        return <Sunset className="w-4 h-4 text-rose-500" />;
      case 'isha':
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const filteredGoals = selectedCategory === 'all'
    ? dailyGoals
    : dailyGoals.filter((g) => g.category === selectedCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'prayer':
        return <Clock className="w-3.5 h-3.5 text-sky-600" />;
      case 'quran':
        return <BookOpen className="w-3.5 h-3.5 text-sky-500" />;
      case 'dhikr':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'charity':
        return <HandHeart className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div id="goals" className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-100 dark:border-stone-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{isAr ? 'متابعة العبادات والصلوات اليومية' : 'Daily Worship & Prayers Tracker'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? 'حلْقة التقدم التفاعلية لتحفيز أداء الصلوات الخمس والسنن والأوراد اليومية'
              : 'Interactive animated SVG progress ring tracking the 5 daily prayers and righteous deeds'}
          </p>
        </div>

        {/* Motivational Status Pill */}
        {completedPrayersCount === 5 ? (
          <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 rounded-full text-xs font-semibold animate-pulse shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'ما شاء الله! أتممت صلوات اليوم الخمس' : 'Alhamdulillah! All 5 prayers completed'}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>
              {isAr
                ? `متبقٍ ${5 - completedPrayersCount} صلوات لاكتمال صلوات الفريضة اليوم`
                : `${5 - completedPrayersCount} prayers remaining today`}
            </span>
          </div>
        )}
      </div>

      {/* Visual Centerpiece: Animated SVG Progress Ring Showcase & 5 Prayers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-sky-50/40 dark:bg-stone-950/40 border border-sky-100/80 dark:border-stone-800/80 rounded-2xl p-6 md:p-8">
        {/* Left Column: Visual SVG Progress Ring (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-4">
          <ProgressRing
            percentage={prayersPercent}
            completedCount={completedPrayersCount}
            totalCount={5}
            size={190}
            strokeWidth={14}
            label={isAr ? `${completedPrayersCount} من 5 صلوات` : `${completedPrayersCount} of 5 Prayers`}
            sublabel={isAr ? 'الصلوات المكتوبة' : 'Obligatory Prayers'}
          />

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              {isAr ? 'نسبة إتمام الفروض الخمسة' : 'Obligatory Prayers Progress'}
            </span>
            <p className="text-[11px] text-stone-500 max-w-xs">
              {isAr
                ? 'انقر على أي صلاة تم أداؤها لتحديث الحلقة فوراً بسلاسة.'
                : 'Click any prayer card as you perform it to animate the ring.'}
            </p>
          </div>
        </div>

        {/* Right Column: 5 Daily Prayers Interactive Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-300">
            <span>{isAr ? 'الصلوات المفروضة اليوم:' : 'Today\'s 5 Obligatory Prayers:'}</span>
            <span className="font-mono text-sky-700 dark:text-sky-400 tabular-nums">
              {completedPrayersCount} / 5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fivePrayers.map((prayer) => {
              const isDone = prayerCompletion[prayer];
              const pInfo = PRAYER_DISPLAY_NAMES[prayer];

              return (
                <button
                  key={prayer}
                  type="button"
                  onClick={() => handlePrayerClick(prayer)}
                  className={`text-start p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all select-none ${
                    isDone
                      ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 shadow-sm ring-1 ring-sky-500/20'
                      : 'bg-white dark:bg-stone-900 border-sky-100 dark:border-stone-800 hover:border-sky-200 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isDone ? 'bg-sky-100 dark:bg-sky-900/60' : 'bg-stone-100 dark:bg-stone-800'}`}>
                      {getPrayerIcon(prayer)}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isDone ? 'text-sky-900 dark:text-sky-100 line-through' : 'text-stone-900 dark:text-stone-100'}`}>
                        {isAr ? pInfo.ar : pInfo.en}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {isDone ? (isAr ? 'تمت الصلاة بحمد الله' : 'Completed') : (isAr ? 'انقر لتأكيد الأداء' : 'Mark completed')}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-transform shrink-0 ${
                      isDone
                        ? 'bg-sky-600 border-sky-600 text-white scale-105'
                        : 'border-stone-300 dark:border-stone-700 hover:border-sky-500'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sourced Prophetic Virtue Note */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {isAr
                ? 'قال رسول الله ﷺ: «مَنْ حَافَظَ عَلَيْهَا كَانَتْ لَهُ نُورًا، وَبُرْهَانًا، وَنَجَاةً يَوْمَ الْقِيَامَةِ» (رواه الإمام أحمد وصححه ابن حبان).'
                : 'The Prophet (ﷺ) said: "Whoever guards them, they will be a light, proof, and salvation for him on the Day of Resurrection." (Ahmad)'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Weekly Progress Chart using Recharts */}
      <WeeklyWorshipTrendsChart
        prayerCompletion={prayerCompletion}
        dailyGoals={dailyGoals}
        lang={lang}
      />

      {/* Additional Daily Worship Habits & Sunan */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isAr ? 'الأوراد والسنن اليومية المساندة' : 'Daily Sunan & Righteous Deeds'}
            </h3>
            <p className="text-xs text-stone-500">
              {isAr
                ? 'السنن الرواتب، ورد القرآن، والأذكار، وأعمال البر اليومية'
                : 'Rawatib sunnah prayers, Quran portions, adhkar, and charity'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
            {(['all', 'prayer', 'quran', 'dhikr', 'charity'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-stone-700 text-sky-700 dark:text-sky-300 shadow-sm font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {cat === 'all' && (isAr ? 'الكل' : 'All')}
                {cat === 'prayer' && (isAr ? 'السنن والصلوات' : 'Prayers')}
                {cat === 'quran' && (isAr ? 'القرآن الكريم' : 'Quran')}
                {cat === 'dhikr' && (isAr ? 'الأذكار' : 'Adhkar')}
                {cat === 'charity' && (isAr ? 'البر والصدقة' : 'Charity')}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => onToggleGoal(goal.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                goal.completed
                  ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
                  : 'bg-white dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-stone-800 shadow-xs shrink-0">
                  {getCategoryIcon(goal.category)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold ${goal.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
                      {isAr ? goal.titleAr : goal.titleEn}
                    </span>
                    {/* Small Streak Counter Badge */}
                    <span
                      title={isAr ? `إنجاز متواصل لمدة ${goal.streakDays} أيام` : `${goal.streakDays} days consecutive streak`}
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                        goal.completed
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800/80 dark:text-stone-400 dark:border-stone-700'
                      }`}
                    >
                      <Flame className={`w-3 h-3 ${goal.completed ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                      <span className="tabular-nums">{goal.streakDays} {isAr ? 'يوم' : 'd'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  goal.completed
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {goal.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
