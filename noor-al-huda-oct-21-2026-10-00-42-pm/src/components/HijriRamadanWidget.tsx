import React from 'react';
import { HijriDate, Language } from '../types';
import { getDaysUntilRamadan, ISLAMIC_EVENTS } from '../services/hijriEngine';
import { Moon, Calendar, Sparkles, Clock } from 'lucide-react';

interface HijriRamadanWidgetProps {
  hijriDate: HijriDate;
  lang: Language;
}

export const HijriRamadanWidget: React.FC<HijriRamadanWidgetProps> = ({ hijriDate, lang }) => {
  const isAr = lang === 'ar';
  const daysUntilRamadan = getDaysUntilRamadan(hijriDate);

  return (
    <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 dark:border-stone-800 gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber-500" />
            <span>{isAr ? 'التقويم الهجري وأدوات رمضان' : 'Hijri Calendar & Ramadan Tools'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? 'العد التنازلي للشهر الفضيل، ومواعيد المناسبات الإسلامية الكبرى في السنة الهجرية'
              : 'Ramadan countdown, lunar dates, and key Islamic milestones throughout the year'}
          </p>
        </div>

        <div className="text-xs font-mono font-semibold text-sky-800 dark:text-sky-300 py-1.5 px-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800">
          {isAr ? hijriDate.formattedAr : hijriDate.formattedEn}
        </div>
      </div>

      {/* Ramadan Countdown Spotlight */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-amber-500/15 border border-amber-300/40 dark:border-amber-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'العد التنازلي لشهر رمضان المبارك' : 'Countdown to Blessed Ramadan'}</span>
          </div>
          <p className="text-sm text-stone-700 dark:text-stone-300">
            {hijriDate.isRamadan
              ? (isAr ? 'نحن الآن في نفحات شهر رمضان المبارك، تقبل الله طاعاتكم.' : 'We are currently in the blessed month of Ramadan. May Allah accept your worship.')
              : (isAr ? 'اللهم بلّغنا رمضان وأعنّا فيه على الصيام والقيام وصالح الأعمال.' : 'May Allah grant us the blessings to reach Ramadan in good faith and health.')}
          </p>
        </div>

        {!hijriDate.isRamadan && (
          <div className="flex items-center gap-3 bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700/60 p-4 rounded-xl shadow-sm shrink-0">
            <div className="text-center">
              <span className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                {daysUntilRamadan}
              </span>
              <span className="text-[11px] block text-stone-500 font-medium">
                {isAr ? 'يوماً متبقياً' : 'days left'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Islamic Events Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          <span>{isAr ? 'أبرز المناسبات والأيام الفاضلة في التقويم الهجري:' : 'Notable Islamic Calendar Events:'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ISLAMIC_EVENTS.slice(0, 6).map((evt, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-sky-100 dark:border-stone-800 bg-white dark:bg-stone-800/30 flex flex-col justify-between hover:border-sky-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                  <span>{isAr ? evt.titleAr : evt.titleEn}</span>
                  <span className="font-mono text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded text-[10px]">
                    {evt.hijriDay}/{evt.hijriMonth}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  {isAr ? evt.descriptionAr : evt.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
