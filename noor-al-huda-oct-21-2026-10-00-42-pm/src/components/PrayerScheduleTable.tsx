import React, { useState } from 'react';
import { FormattedPrayerTimes, Language, NextPrayerInfo, PrayerName, PrayerSettings, ReminderMap } from '../types';
import { CALCULATION_METHODS, PRAYER_DISPLAY_NAMES } from '../services/prayerEngine';
import { Bell, BellOff, Settings, Sliders, Check, Volume2, Shield } from 'lucide-react';

interface PrayerScheduleTableProps {
  times: FormattedPrayerTimes;
  nextInfo: NextPrayerInfo;
  settings: PrayerSettings;
  reminders: ReminderMap;
  onUpdateSettings: (settings: PrayerSettings) => void;
  onToggleReminder: (prayer: PrayerName) => void;
  lang: Language;
}

export const PrayerScheduleTable: React.FC<PrayerScheduleTableProps> = ({
  times,
  nextInfo,
  settings,
  reminders,
  onUpdateSettings,
  onToggleReminder,
  lang,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const isAr = lang === 'ar';

  const prayerRows: Array<{
    id: PrayerName | 'midnight' | 'lastThird';
    nameAr: string;
    nameEn: string;
    time: string;
    isObligatory: boolean;
  }> = [
    { id: 'fajr', nameAr: PRAYER_DISPLAY_NAMES.fajr.ar, nameEn: PRAYER_DISPLAY_NAMES.fajr.en, time: times.fajr, isObligatory: true },
    { id: 'sunrise', nameAr: PRAYER_DISPLAY_NAMES.sunrise.ar, nameEn: PRAYER_DISPLAY_NAMES.sunrise.en, time: times.sunrise, isObligatory: false },
    { id: 'dhuhr', nameAr: PRAYER_DISPLAY_NAMES.dhuhr.ar, nameEn: PRAYER_DISPLAY_NAMES.dhuhr.en, time: times.dhuhr, isObligatory: true },
    { id: 'asr', nameAr: PRAYER_DISPLAY_NAMES.asr.ar, nameEn: PRAYER_DISPLAY_NAMES.asr.en, time: times.asr, isObligatory: true },
    { id: 'maghrib', nameAr: PRAYER_DISPLAY_NAMES.maghrib.ar, nameEn: PRAYER_DISPLAY_NAMES.maghrib.en, time: times.maghrib, isObligatory: true },
    { id: 'isha', nameAr: PRAYER_DISPLAY_NAMES.isha.ar, nameEn: PRAYER_DISPLAY_NAMES.isha.en, time: times.isha, isObligatory: true },
    { id: 'midnight', nameAr: PRAYER_DISPLAY_NAMES.midnight.ar, nameEn: PRAYER_DISPLAY_NAMES.midnight.en, time: times.midnight, isObligatory: false },
    { id: 'lastThird', nameAr: PRAYER_DISPLAY_NAMES.lastThird.ar, nameEn: PRAYER_DISPLAY_NAMES.lastThird.en, time: times.lastThird, isObligatory: false },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{isAr ? 'جدول مواقيت الصلاة اليومية' : 'Daily Prayer Schedule'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? `المعتمد: ${CALCULATION_METHODS[settings.method]?.nameAr} · مذهب العصر: ${settings.madhab === 'Standard' ? 'جمهور الفقهاء (شافعي/مالكي/حنبلي)' : 'المذهب الحنفي'}`
              : `Authority: ${CALCULATION_METHODS[settings.method]?.nameEn} · Asr Juristic: ${settings.madhab === 'Standard' ? 'Shafi\'i / Standard' : 'Hanafi'}`}
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-medium border transition-colors ${
            showConfig
              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-800'
              : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isAr ? 'تعديل طريقة الحساب والمذهب' : 'Configure Method & Juristic School'}</span>
        </button>
      </div>

      {/* Expandable Configuration Drawer */}
      {showConfig && (
        <div className="my-6 p-5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Calculation Method */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                {isAr ? 'طريقة وهيئة الحساب الفلكي' : 'Calculation Authority'}
              </label>
              <select
                value={settings.method}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    method: e.target.value as any,
                  })
                }
                className="w-full text-xs py-2.5 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-sky-500"
              >
                {Object.values(CALCULATION_METHODS).map((m) => (
                  <option key={m.id} value={m.id}>
                    {isAr ? m.nameAr : m.nameEn}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                {isAr
                  ? CALCULATION_METHODS[settings.method]?.descriptionAr
                  : CALCULATION_METHODS[settings.method]?.descriptionEn}
              </p>
            </div>

            {/* Asr Juristic Method */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                {isAr ? 'مذهب حساب وقت صلاة العصر' : 'Asr Juristic Madhab'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, madhab: 'Standard' })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-colors ${
                    settings.madhab === 'Standard'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isAr ? 'الجمهور (الظل مثله)' : 'Standard / Shafi\'i'}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, madhab: 'Hanafi' })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-colors ${
                    settings.madhab === 'Hanafi'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isAr ? 'الحنفي (الظل مثليه)' : 'Hanafi'}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                {isAr
                  ? 'الجمهور: يدخل العصر بمصير ظل الشيء مثله. الحنفي: بمصير ظل الشيء مثليه.'
                  : 'Standard: shadow equals object height. Hanafi: shadow equals twice object height.'}
              </p>
            </div>
          </div>

          {/* Hijri Moon Sighting Adjustment */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-stone-600 dark:text-stone-300 font-medium">
              {isAr ? 'تعديل رؤية الهلال للتقويم الهجري:' : 'Hijri Moon-Sighting Offset:'}
            </span>
            <div className="flex items-center gap-1">
              {[-2, -1, 0, 1, 2].map((offset) => (
                <button
                  key={offset}
                  onClick={() => onUpdateSettings({ ...settings, hijriOffset: offset })}
                  className={`py-1 px-2.5 rounded-lg font-mono text-xs font-medium ${
                    settings.hijriOffset === offset
                      ? 'bg-sky-700 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                  }`}
                >
                  {offset > 0 ? `+${offset}` : offset} {isAr ? 'يوم' : 'd'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prayers Grid / Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {prayerRows.map((prayer) => {
          const isNext = nextInfo.next === prayer.id;
          const isCurrent = nextInfo.current === prayer.id;
          const isPrayerName = prayer.id in reminders;
          const reminderEnabled = isPrayerName ? reminders[prayer.id as PrayerName]?.enabled : false;

          return (
            <div
              key={prayer.id}
              className={`relative p-5 rounded-2xl border transition-all ${
                isNext
                  ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 shadow-md ring-1 ring-sky-500/30'
                  : isCurrent
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {isAr ? prayer.nameAr : prayer.nameEn}
                    </h3>
                    {isNext && (
                      <span className="text-[10px] font-bold py-0.5 px-2 bg-sky-600 text-white rounded-full">
                        {isAr ? 'القادمة' : 'Next'}
                      </span>
                    )}
                    {isCurrent && !isNext && (
                      <span className="text-[10px] font-medium py-0.5 px-2 bg-amber-600 text-white rounded-full">
                        {isAr ? 'الحالية' : 'Current'}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tracking-tight tabular-nums mt-2">
                    {prayer.time}
                  </div>
                </div>

                {/* Reminder Bell */}
                {isPrayerName && (
                  <button
                    onClick={() => onToggleReminder(prayer.id as PrayerName)}
                    title={
                      reminderEnabled
                        ? (isAr ? 'إلغاء التنبيه' : 'Disable reminder')
                        : (isAr ? 'تفعيل التنبيه' : 'Enable reminder')
                    }
                    className={`p-2 rounded-xl transition-colors ${
                      reminderEnabled
                        ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 dark:hover:bg-stone-800'
                    }`}
                  >
                    {reminderEnabled ? (
                      <Bell className="w-4 h-4 fill-sky-600 text-sky-600 dark:fill-sky-400 dark:text-sky-400" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>
                  {prayer.isObligatory
                    ? (isAr ? 'فريضة مكتوبة' : 'Obligatory')
                    : (isAr ? 'وقت مستحب' : 'Recommended')}
                </span>
                {reminderEnabled && (
                  <span className="text-sky-600 dark:text-sky-400 font-medium">
                    {isAr ? 'التنبيه مفعّل' : 'Alert Active'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
