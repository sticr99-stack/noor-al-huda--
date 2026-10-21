import React, { useState } from 'react';
import { HijriDate, Language, Location, NextPrayerInfo, PrayerTimes } from '../types';
import { formatCountdown, PRAYER_DISPLAY_NAMES } from '../services/prayerEngine';
import { audioEngine } from '../services/audioEngine';
import { Clock, MapPin, Volume2, Sparkles, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

interface PrayerHeroCardProps {
  times: PrayerTimes;
  nextInfo: NextPrayerInfo;
  location: Location;
  hijriDate: HijriDate;
  lang: Language;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
}

export const PrayerHeroCard: React.FC<PrayerHeroCardProps> = ({
  nextInfo,
  location,
  hijriDate,
  lang,
  onOpenLocation,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isAr = lang === 'ar';
  const { hours, minutes, seconds } = formatCountdown(nextInfo.remainingSeconds);

  const nextPrayerName = isAr
    ? PRAYER_DISPLAY_NAMES[nextInfo.next]?.ar
    : PRAYER_DISPLAY_NAMES[nextInfo.next]?.en;

  const currentPrayerName = nextInfo.current === 'isha_post'
    ? (isAr ? 'العشاء والوتر' : 'Post-Isha')
    : isAr
      ? PRAYER_DISPLAY_NAMES[nextInfo.current]?.ar
      : PRAYER_DISPLAY_NAMES[nextInfo.current]?.en;

  const gregorianFormatted = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePlayTakbeer = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    audioEngine.playAdhanTakbeer(() => {
      setIsPlayingAudio(false);
    });
  };

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'fajr':
        return <Sunrise className="w-5 h-5 text-amber-300" />;
      case 'sunrise':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'dhuhr':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'asr':
        return <Sun className="w-5 h-5 text-amber-600" />;
      case 'maghrib':
        return <Sunset className="w-5 h-5 text-orange-400" />;
      case 'isha':
        return <Moon className="w-5 h-5 text-indigo-300" />;
      default:
        return <Clock className="w-5 h-5 text-sky-300" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 text-white shadow-xl border border-sky-800/40 p-6 md:p-8">
      {/* Subtle Islamic Geometric Watermark Backdrop */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Dates, Location, and Current Prayer Status */}
        <div className="flex-1 space-y-4">
          {/* Location & Gregorian Date */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-sky-200/90">
            <button
              onClick={onOpenLocation}
              className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-sky-900/60 hover:bg-sky-800/80 border border-sky-700/50 text-sky-100 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{isAr ? location.cityAr : location.city}</span>
              <span className="text-sky-300/60">·</span>
              <span className="text-xs text-sky-300/80">{isAr ? location.countryAr : location.country}</span>
            </button>
            <span className="text-sky-400/50">·</span>
            <span>{gregorianFormatted}</span>
          </div>

          {/* Hijri Date Display */}
          <div className="space-y-1">
            <div className="text-2xl md:text-3xl font-bold font-quran text-amber-300 tracking-wide">
              {isAr ? hijriDate.formattedAr : hijriDate.formattedEn}
            </div>
            {hijriDate.isRamadan && (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-200 bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'أيام شهر رمضان المبارك' : 'Blessed Days of Ramadan'}</span>
              </div>
            )}
          </div>

          {/* Active Prayer Context */}
          <div className="flex items-center gap-2 text-sm text-sky-200/80 pt-1">
            <span>{isAr ? 'الوقت الحالي لـ:' : 'Current Window:'}</span>
            <span className="font-semibold text-white">{currentPrayerName}</span>
          </div>

          {/* Audio Preview Control */}
          <div className="pt-2">
            <button
              onClick={handlePlayTakbeer}
              disabled={isPlayingAudio}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-sky-200 transition-colors"
            >
              <Volume2 className={`w-4 h-4 text-sky-400 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>
                {isPlayingAudio
                  ? (isAr ? 'تكبيرات الأذان بصوت ندي...' : 'Playing Takbeer Melody...')
                  : (isAr ? 'سماع تكبير الأذان' : 'Preview Adhan Takbeer')}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Next Prayer Countdown */}
        <div className="flex-1 lg:max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl border border-sky-700/30 p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-300 uppercase tracking-wider mb-2">
            {getPrayerIcon(nextInfo.next)}
            <span>
              {isAr ? `الصلاة القادمة: صلاة ${nextPrayerName}` : `Next Prayer: ${nextPrayerName}`}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center justify-center gap-2 text-4xl md:text-5xl font-mono font-bold text-white tracking-wider my-3 tabular-nums">
            <div className="flex flex-col items-center">
              <span className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
                {hours}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">{isAr ? 'ساعة' : 'hours'}</span>
            </div>
            <span className="text-amber-400 mb-4 animate-pulse">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
                {minutes}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">{isAr ? 'دقيقة' : 'minutes'}</span>
            </div>
            <span className="text-amber-400 mb-4 animate-pulse">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 shadow-inner text-amber-300">
                {seconds}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">{isAr ? 'ثانية' : 'seconds'}</span>
            </div>
          </div>

          {/* Solar Window Progression Arc */}
          <div className="w-full mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'المتبقي للأذان' : 'Remaining to Adhan'}</span>
              <span className="font-mono text-sky-300">{Math.round(nextInfo.progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-400 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.max(3, nextInfo.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
