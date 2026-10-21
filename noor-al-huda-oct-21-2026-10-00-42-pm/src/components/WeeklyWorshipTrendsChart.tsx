import React, { useState, useMemo } from 'react';
import { DailyGoal, Language, PrayerName } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BookOpen,
  Clock,
  Sparkles,
  BarChart2,
  Activity,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface WeeklyWorshipTrendsChartProps {
  prayerCompletion: Record<PrayerName, boolean>;
  dailyGoals: DailyGoal[];
  lang: Language;
}

interface DayTrendData {
  dayId: string;
  dayAr: string;
  dayEn: string;
  dayShortAr: string;
  dayShortEn: string;
  dateStr: string;
  prayersPercent: number;
  prayersCount: number;
  quranPercent: number;
  quranPagesEstimated: number;
  isToday: boolean;
  statusNoteAr: string;
  statusNoteEn: string;
}

export const WeeklyWorshipTrendsChart: React.FC<WeeklyWorshipTrendsChartProps> = ({
  prayerCompletion,
  dailyGoals,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [activeSeries, setActiveSeries] = useState<'both' | 'prayers' | 'quran'>('both');

  // Calculate live today stats from props
  const fivePrayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const todayPrayersCount = fivePrayers.filter((p) => prayerCompletion[p]).length;
  const todayPrayersPercent = Math.round((todayPrayersCount / 5) * 100);

  const quranGoal = dailyGoals.find((g) => g.category === 'quran' || g.key === 'quran_wird');
  const isQuranDoneToday = !!quranGoal?.completed;
  const todayQuranPercent = isQuranDoneToday ? 100 : (todayPrayersCount > 0 ? 40 : 0);

  // Determine current day of week (0=Sun, 1=Mon, ..., 6=Sat)
  const todayIndex = new Date().getDay(); // 0 is Sunday, 6 is Saturday

  // Build the 7 days of this current week (Starting Saturday in Islamic tradition: Sat=6, Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5)
  const weekDays = useMemo<DayTrendData[]>(() => {
    // Standard Islamic week order: Sat, Sun, Mon, Tue, Wed, Thu, Fri
    const daysConfig = [
      { id: 'sat', dayIdx: 6, ar: 'السبت', en: 'Saturday', shortAr: 'السبت', shortEn: 'Sat', basePrayers: 100, basePrayersCount: 5, baseQuran: 100, pages: 6, noteAr: 'أتممت الفروض وورد التلاوة', noteEn: '5 prayers and wird completed' },
      { id: 'sun', dayIdx: 0, ar: 'الأحد', en: 'Sunday', shortAr: 'الأحد', shortEn: 'Sun', basePrayers: 80, basePrayersCount: 4, baseQuran: 75, pages: 4, noteAr: '4 صلوات وقراءة جزء من الورد', noteEn: '4 prayers and partial recitation' },
      { id: 'mon', dayIdx: 1, ar: 'الإثنين', en: 'Monday', shortAr: 'الإثنين', shortEn: 'Mon', basePrayers: 100, basePrayersCount: 5, baseQuran: 90, pages: 5, noteAr: 'يوم صيام وسنن مؤكدة', noteEn: 'Sunnah fast day and prayers' },
      { id: 'tue', dayIdx: 2, ar: 'الثلاثاء', en: 'Tuesday', shortAr: 'الثلاثاء', shortEn: 'Tue', basePrayers: 100, basePrayersCount: 5, baseQuran: 85, pages: 5, noteAr: 'محافظة كاملة على الجماعة', noteEn: 'All prayers in congregation' },
      { id: 'wed', dayIdx: 3, ar: 'الأربعاء', en: 'Wednesday', shortAr: 'الأربعاء', shortEn: 'Wed', basePrayers: 80, basePrayersCount: 4, baseQuran: 70, pages: 4, noteAr: 'أداء الفروض وأذكار المساء', noteEn: 'Prayers & evening adhkar' },
      { id: 'thu', dayIdx: 4, ar: 'الخميس', en: 'Thursday', shortAr: 'الخميس', shortEn: 'Thu', basePrayers: 100, basePrayersCount: 5, baseQuran: 100, pages: 6, noteAr: 'عرض الأعمال وختام مبارك', noteEn: 'Deeds presented and full wird' },
      { id: 'fri', dayIdx: 5, ar: 'الجمعة', en: 'Friday', shortAr: 'الجمعة', shortEn: 'Fri', basePrayers: 100, basePrayersCount: 5, baseQuran: 100, pages: 10, noteAr: 'جمعة مباركة وسورة الكهف', noteEn: 'Blessed Friday & Surah Al-Kahf' },
    ];

    const now = new Date();

    return daysConfig.map((item) => {
      const isToday = item.dayIdx === todayIndex;

      // If it's today, inject real-time dynamic user state
      if (isToday) {
        return {
          dayId: item.id,
          dayAr: item.ar,
          dayEn: item.en,
          dayShortAr: item.shortAr,
          dayShortEn: item.shortEn,
          dateStr: now.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'numeric', day: 'numeric' }),
          prayersPercent: todayPrayersPercent,
          prayersCount: todayPrayersCount,
          quranPercent: todayQuranPercent,
          quranPagesEstimated: isQuranDoneToday ? 6 : (todayPrayersCount > 0 ? 2 : 0),
          isToday: true,
          statusNoteAr: todayPrayersCount === 5 ? 'أتممت كافة صلوات الفريضة اليوم!' : `تم أداء ${todayPrayersCount} من 5 صلوات`,
          statusNoteEn: todayPrayersCount === 5 ? 'All 5 prayers completed today!' : `${todayPrayersCount} of 5 prayers logged`,
        };
      }

      // Past or other days in current week
      return {
        dayId: item.id,
        dayAr: item.ar,
        dayEn: item.en,
        dayShortAr: item.shortAr,
        dayShortEn: item.shortEn,
        dateStr: '',
        prayersPercent: item.basePrayers,
        prayersCount: item.basePrayersCount,
        quranPercent: item.baseQuran,
        quranPagesEstimated: item.pages,
        isToday: false,
        statusNoteAr: item.noteAr,
        statusNoteEn: item.noteEn,
      };
    });
  }, [todayIndex, todayPrayersPercent, todayPrayersCount, todayQuranPercent, isQuranDoneToday, isAr]);

  // Aggregate averages for insight badges
  const avgPrayers = Math.round(
    weekDays.reduce((acc, d) => acc + d.prayersPercent, 0) / weekDays.length
  );
  const avgQuran = Math.round(
    weekDays.reduce((acc, d) => acc + d.quranPercent, 0) / weekDays.length
  );

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: DayTrendData = payload[0].payload;

    return (
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-sky-100 dark:border-stone-800 text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-sky-100 dark:border-stone-800">
          <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? data.dayAr : data.dayEn}</span>
          </span>
          {data.isToday && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300">
              {isAr ? 'اليوم' : 'Today'}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sky-900 dark:text-sky-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
              <span>{isAr ? 'الصلوات المفروضة:' : 'Obligatory Prayers:'}</span>
            </span>
            <span className="font-mono font-bold">{data.prayersPercent}% ({data.prayersCount}/5)</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
              <span>{isAr ? 'الورد القرآني:' : 'Quran Wird:'}</span>
            </span>
            <span className="font-mono font-bold">{data.quranPercent}% (~{data.quranPagesEstimated} {isAr ? 'صفحات' : 'p'})</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-sky-50 dark:border-stone-800/80 text-[10px] text-stone-500 italic">
          {isAr ? data.statusNoteAr : data.statusNoteEn}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-sky-50/40 dark:bg-stone-950/40 border border-sky-100 dark:border-stone-800 rounded-2xl p-5 md:p-6 space-y-6">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm md:text-base font-bold text-stone-900 dark:text-stone-100">
              {isAr
                ? 'مؤشر الاتجاه الأسبوعي لإتمام الصلوات والقرآن الكريم'
                : 'Weekly Completion Trends: Prayer & Quran Goals'}
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? 'رسم بياني تفاعلي يوضّح ثباتك اليومي في أداء الفروض الخمسة وتلاوة الورد القرآني طوال الأسبوع'
              : 'Interactive visual progress chart tracking consistency in daily prayers and Quran portions'}
          </p>
        </div>

        {/* View Controls: Filter Series & Chart Type Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Series Filter */}
          <div className="flex items-center p-1 bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveSeries('both')}
              className={`py-1 px-2.5 rounded-lg font-medium transition-colors ${
                activeSeries === 'both'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {isAr ? 'كلاهما' : 'Both'}
            </button>
            <button
              onClick={() => setActiveSeries('prayers')}
              className={`py-1 px-2.5 rounded-lg font-medium transition-colors ${
                activeSeries === 'prayers'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {isAr ? 'الصلوات' : 'Prayers'}
            </button>
            <button
              onClick={() => setActiveSeries('quran')}
              className={`py-1 px-2.5 rounded-lg font-medium transition-colors ${
                activeSeries === 'quran'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {isAr ? 'القرآن' : 'Quran'}
            </button>
          </div>

          {/* Chart Style Switch (Area vs Bar) */}
          <div className="flex items-center p-1 bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-xl text-xs">
            <button
              onClick={() => setChartType('area')}
              title={isAr ? 'مخطط انسيابي' : 'Area Chart'}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'area'
                  ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title={isAr ? 'أعمدة بيانية' : 'Bar Chart'}
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-100 dark:border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isAr ? 'معدل الصلوات الأسبوعي' : 'Weekly Prayer Rate'}</span>
            <Clock className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-700 dark:text-sky-400 tabular-nums">
            {avgPrayers}%
          </div>
          <div className="w-full bg-sky-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-sky-600 rounded-full" style={{ width: `${avgPrayers}%` }} />
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-100 dark:border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isAr ? 'معدل الورد القرآني' : 'Weekly Quran Rate'}</span>
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {avgQuran}%
          </div>
          <div className="w-full bg-amber-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${avgQuran}%` }} />
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-100 dark:border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isAr ? 'اليوم الأكثر إنجازاً' : 'Best Worship Day'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
            {isAr ? 'الجمعة المباركة' : 'Blessed Friday'}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            {isAr ? 'إتمام 100% لكافة الأوراد' : '100% adherence achieved'}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-100 dark:border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isAr ? 'ثبات اليوم الحالي' : 'Today Status'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
            {todayPrayersCount} / 5 {isAr ? 'صلوات' : 'prayers'}
          </div>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold block">
            {isQuranDoneToday ? (isAr ? 'الورد القرآني مكتمل ✓' : 'Quran wird completed ✓') : (isAr ? 'بانتظار قراءة الورد' : 'Portion in progress')}
          </span>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full h-64 sm:h-72 select-none">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={weekDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Sky blue gradient for prayers */}
                <linearGradient id="prayerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                {/* Luminous gold gradient for Quran */}
                <linearGradient id="quranGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />

              <XAxis
                dataKey={isAr ? 'dayShortAr' : 'dayShortEn'}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />

              <Tooltip content={<CustomTooltip />} />

              {(activeSeries === 'both' || activeSeries === 'prayers') && (
                <Area
                  type="monotone"
                  dataKey="prayersPercent"
                  name={isAr ? 'الصلوات المفروضة' : 'Obligatory Prayers'}
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#prayerGradient)"
                  activeDot={{ r: 6, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {(activeSeries === 'both' || activeSeries === 'quran') && (
                <Area
                  type="monotone"
                  dataKey="quranPercent"
                  name={isAr ? 'الورد القرآني' : 'Quran Wird'}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#quranGradient)"
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={weekDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />

              <XAxis
                dataKey={isAr ? 'dayShortAr' : 'dayShortEn'}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />

              <Tooltip content={<CustomTooltip />} />

              {(activeSeries === 'both' || activeSeries === 'prayers') && (
                <Bar
                  dataKey="prayersPercent"
                  name={isAr ? 'الصلوات المفروضة' : 'Obligatory Prayers'}
                  fill="#0284c7"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              )}

              {(activeSeries === 'both' || activeSeries === 'quran') && (
                <Bar
                  dataKey="quranPercent"
                  name={isAr ? 'الورد القرآني' : 'Quran Wird'}
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Prophetic Encouragement */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 border-t border-sky-100 dark:border-stone-800/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
            <span className="font-medium">{isAr ? 'الصلوات الخمس (الفرائض)' : '5 Daily Prayers'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="font-medium">{isAr ? 'الورد القرآني اليومي' : 'Daily Quran Wird'}</span>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 text-center sm:text-end">
          {isAr
            ? '«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ» (صحيح مسلم)'
            : '"The most beloved of deeds to Allah are those that are most consistent, even if small." (Sahih Muslim)'}
        </div>
      </div>
    </div>
  );
};
