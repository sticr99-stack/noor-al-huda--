import { CalculationMethodId, CalculationMethodInfo, FormattedPrayerTimes, Madhab, NextPrayerInfo, PrayerName, PrayerSettings, PrayerTimes } from '../types';

export const CALCULATION_METHODS: Record<CalculationMethodId, CalculationMethodInfo> = {
  UmmAlQura: {
    id: 'UmmAlQura',
    nameAr: 'جامعة أم القرى، مكة المكرمة',
    nameEn: 'Umm Al-Qura University, Makkah',
    descriptionAr: 'الفجر 18.5° والعشاء 90 دقيقة بعد المغرب (المعتمد في المملكة العربية السعودية)',
    descriptionEn: 'Fajr 18.5°, Isha 90 min after Maghrib (Standard across Saudi Arabia)',
    fajrAngle: 18.5,
    ishaAngleOrMinutes: 90,
  },
  MWL: {
    id: 'MWL',
    nameAr: 'رابطة العالم الإسلامي',
    nameEn: 'Muslim World League (MWL)',
    descriptionAr: 'الفجر 18° والعشاء 17° (المعتمد في أوروبا والشرق الأقصى وأجزاء من أمريكا)',
    descriptionEn: 'Fajr 18°, Isha 17° (Standard in Europe, Far East, and parts of the Americas)',
    fajrAngle: 18,
    ishaAngleOrMinutes: 17,
  },
  Egypt: {
    id: 'Egypt',
    nameAr: 'الهيئة المصرية العامة للمساحة',
    nameEn: 'Egyptian General Authority of Survey',
    descriptionAr: 'الفجر 19.5° والعشاء 17.5° (المعتمد في مصر وشمال إفريقيا وبلاد الشام)',
    descriptionEn: 'Fajr 19.5°, Isha 17.5° (Widely used in Egypt, North Africa, and the Levant)',
    fajrAngle: 19.5,
    ishaAngleOrMinutes: 17.5,
  },
  ISNA: {
    id: 'ISNA',
    nameAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
    nameEn: 'Islamic Society of North America (ISNA)',
    descriptionAr: 'الفجر 15° والعشاء 15° (شائع الاستخدام في كندا والولايات المتحدة)',
    descriptionEn: 'Fajr 15°, Isha 15° (Commonly used across USA and Canada)',
    fajrAngle: 15,
    ishaAngleOrMinutes: 15,
  },
  Karachi: {
    id: 'Karachi',
    nameAr: 'جامعة العلوم الإسلامية بكراتشي',
    nameEn: 'University of Islamic Sciences, Karachi',
    descriptionAr: 'الفجر 18° والعشاء 18° (المعتمد في باكستان والهند وبنغلاديش وأفغانستان)',
    descriptionEn: 'Fajr 18°, Isha 18° (Standard in Pakistan, India, Bangladesh, Afghanistan)',
    fajrAngle: 18,
    ishaAngleOrMinutes: 18,
  },
  Tehran: {
    id: 'Tehran',
    nameAr: 'معهد الجيوفيزياء بجامعة طهران',
    nameEn: 'Institute of Geophysics, University of Tehran',
    descriptionAr: 'الفجر 17.7° والعشاء 14° والمغرب 4.5°',
    descriptionEn: 'Fajr 17.7°, Isha 14°, Maghrib 4.5° (Levant / Shia)',
    fajrAngle: 17.7,
    ishaAngleOrMinutes: 14,
  },
};

// Math helper degrees <-> radians
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;

// Trigonometric functions expecting degrees
const sinD = (d: number) => Math.sin(d2r(d));
const cosD = (d: number) => Math.cos(d2r(d));
const tanD = (d: number) => Math.tan(d2r(d));
const acosD = (x: number) => r2d(Math.acos(Math.max(-1, Math.min(1, x))));
const atanD = (x: number) => r2d(Math.atan(x));

// Fix angle to [0, 360)
const fixAngle = (a: number) => {
  let res = a - 360.0 * Math.floor(a / 360.0);
  return res < 0 ? res + 360.0 : res;
};

// Fix hour to [0, 24)
const fixHour = (h: number) => {
  let res = h - 24.0 * Math.floor(h / 24.0);
  return res < 0 ? res + 24.0 : res;
};

// Calculate Julian Date from Gregorian Date
function getJulianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// Astronomical Solar Coordinates Calculation (Declination & Equation of Time)
function getSunPosition(julianDate: number): { declination: number; equationOfTime: number } {
  const D = julianDate - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sinD(g) + 0.02 * sinD(2 * g));

  const e = 23.439 - 0.00000036 * D;
  const d = r2d(Math.asin(sinD(e) * sinD(L)));
  let RA = r2d(Math.atan2(cosD(e) * sinD(L), cosD(L))) / 15;
  RA = fixHour(RA);

  const EqT = q / 15 - RA;
  return { declination: d, equationOfTime: EqT };
}

// Compute the time of sunrise/sunset or twilight given a solar altitude angle
function computeTime(
  altitudeAngle: number,
  latitude: number,
  declination: number,
  direction: 'ccw' | 'cw'
): number | null {
  const cosH = (sinD(altitudeAngle) - sinD(latitude) * sinD(declination)) / (cosD(latitude) * cosD(declination));
  if (cosH > 1 || cosH < -1) return null; // Sun never reaches this altitude (polar day/night)
  const H = acosD(cosH) / 15;
  return direction === 'ccw' ? -H : H;
}

// Compute Asr shadow angle
function computeAsrTime(
  shadowFactor: number, // 1 for Shafi'i/Hanbali/Maliki, 2 for Hanafi
  latitude: number,
  declination: number
): number {
  const angle = -atanD(1 / (shadowFactor + tanD(Math.abs(latitude - declination))));
  const t = computeTime(angle, latitude, declination, 'cw');
  return t ?? 3.5;
}

/**
 * Computes exact daily prayer times
 */
export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffsetHours: number,
  settings: PrayerSettings
): PrayerTimes {
  const method = CALCULATION_METHODS[settings.method] ?? CALCULATION_METHODS.UmmAlQura;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = getJulianDate(year, month, day);
  const { declination, equationOfTime } = getSunPosition(jd);

  // Solar noon (Dhuhr) in local hours
  // Dhuhr enters when the sun passes the meridian (add a safety margin of ~1-2 minutes)
  const solarNoon = 12 + timezoneOffsetHours - longitude / 15 - equationOfTime + 2 / 60;

  // Sunrise and Sunset: Sun's center is 50 arcminutes (-0.833°) below horizon
  const sunRiseDiff = computeTime(-0.833, latitude, declination, 'ccw') ?? -6.0;
  const sunSetDiff = computeTime(-0.833, latitude, declination, 'cw') ?? 6.0;

  const sunriseHour = solarNoon + sunRiseDiff;
  const sunsetHour = solarNoon + sunSetDiff;

  // Fajr
  const fajrDiff = computeTime(-method.fajrAngle, latitude, declination, 'ccw');
  let fajrHour: number;
  if (fajrDiff !== null) {
    fajrHour = solarNoon + fajrDiff;
  } else {
    // High latitude adjustment (default to 1.5 hours before sunrise)
    fajrHour = sunriseHour - 1.5;
  }

  // Asr
  const asrFactor = settings.madhab === 'Hanafi' ? 2 : 1;
  const asrDiff = computeAsrTime(asrFactor, latitude, declination);
  const asrHour = solarNoon + asrDiff;

  // Maghrib
  const maghribHour = sunsetHour + 2 / 60; // 2 minutes after astronomical sunset

  // Isha
  let ishaHour: number;
  if (typeof method.ishaAngleOrMinutes === 'number' && method.ishaAngleOrMinutes >= 60) {
    // Fixed minutes after Maghrib (e.g. Umm Al Qura: 90 min)
    ishaHour = maghribHour + method.ishaAngleOrMinutes / 60;
  } else {
    const ishaAngle = typeof method.ishaAngleOrMinutes === 'number' ? method.ishaAngleOrMinutes : 17;
    const ishaDiff = computeTime(-ishaAngle, latitude, declination, 'cw');
    if (ishaDiff !== null) {
      ishaHour = solarNoon + ishaDiff;
    } else {
      ishaHour = maghribHour + 1.5;
    }
  }

  // Convert fractional hours into Date objects
  const toDate = (hours: number, baseDate: Date): Date => {
    const h = fixHour(hours);
    const wholeHours = Math.floor(h);
    const minutes = Math.floor((h - wholeHours) * 60);
    const seconds = Math.floor(((h - wholeHours) * 60 - minutes) * 60);
    const d = new Date(baseDate);
    d.setHours(wholeHours, minutes, seconds, 0);
    return d;
  };

  const fajr = toDate(fajrHour, date);
  const sunrise = toDate(sunriseHour, date);
  const dhuhr = toDate(solarNoon, date);
  const asr = toDate(asrHour, date);
  const maghrib = toDate(maghribHour, date);
  const isha = toDate(ishaHour, date);

  // Midnight (halfway between Maghrib and next day's Fajr)
  const tomorrowFajr = new Date(fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  const nightDurationMs = tomorrowFajr.getTime() - maghrib.getTime();
  const midnight = new Date(maghrib.getTime() + nightDurationMs / 2);
  const lastThird = new Date(maghrib.getTime() + (nightDurationMs * 2) / 3);

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    isha,
    midnight,
    lastThird,
  };
}

/**
 * Format date to 12-hour or 24-hour localized string
 */
export function formatPrayerTime(date: Date, is24Hour: boolean = false, locale: string = 'ar-SA'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !is24Hour,
  });
}

export function formatAllPrayerTimes(times: PrayerTimes, is24Hour: boolean = false, locale: string = 'ar-SA'): FormattedPrayerTimes {
  return {
    fajr: formatPrayerTime(times.fajr, is24Hour, locale),
    sunrise: formatPrayerTime(times.sunrise, is24Hour, locale),
    dhuhr: formatPrayerTime(times.dhuhr, is24Hour, locale),
    asr: formatPrayerTime(times.asr, is24Hour, locale),
    maghrib: formatPrayerTime(times.maghrib, is24Hour, locale),
    isha: formatPrayerTime(times.isha, is24Hour, locale),
    midnight: formatPrayerTime(times.midnight, is24Hour, locale),
    lastThird: formatPrayerTime(times.lastThird, is24Hour, locale),
  };
}

/**
 * Determine currently active prayer, next prayer, seconds remaining and day progress
 */
export function getNextPrayer(times: PrayerTimes, now: Date = new Date()): NextPrayerInfo {
  const prayers: Array<{ name: PrayerName; time: Date }> = [
    { name: 'fajr', time: times.fajr },
    { name: 'sunrise', time: times.sunrise },
    { name: 'dhuhr', time: times.dhuhr },
    { name: 'asr', time: times.asr },
    { name: 'maghrib', time: times.maghrib },
    { name: 'isha', time: times.isha },
  ];

  const nowMs = now.getTime();

  // If now is before Fajr
  if (nowMs < times.fajr.getTime()) {
    const diffSec = Math.max(0, Math.floor((times.fajr.getTime() - nowMs) / 1000));
    return {
      current: 'isha_post',
      next: 'fajr',
      nextTime: times.fajr,
      remainingSeconds: diffSec,
      progressPercent: 100,
    };
  }

  // Check windows between prayers
  for (let i = 0; i < prayers.length - 1; i++) {
    const current = prayers[i];
    const next = prayers[i + 1];
    if (nowMs >= current.time.getTime() && nowMs < next.time.getTime()) {
      const windowMs = next.time.getTime() - current.time.getTime();
      const elapsedMs = nowMs - current.time.getTime();
      const progressPercent = Math.min(100, Math.max(0, (elapsedMs / windowMs) * 100));
      const remainingSeconds = Math.max(0, Math.floor((next.time.getTime() - nowMs) / 1000));
      return {
        current: current.name,
        next: next.name,
        nextTime: next.time,
        remainingSeconds,
        progressPercent,
      };
    }
  }

  // After Isha: next is tomorrow's Fajr
  const tomorrowFajr = new Date(times.fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  const remainingSeconds = Math.max(0, Math.floor((tomorrowFajr.getTime() - nowMs) / 1000));
  const nightTotal = tomorrowFajr.getTime() - times.isha.getTime();
  const elapsedNight = nowMs - times.isha.getTime();
  const progressPercent = Math.min(100, Math.max(0, (elapsedNight / nightTotal) * 100));

  return {
    current: 'isha',
    next: 'fajr',
    nextTime: tomorrowFajr,
    remainingSeconds,
    progressPercent,
  };
}

/**
 * Format remaining seconds into HH:MM:SS
 */
export function formatCountdown(seconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  };
}

export const PRAYER_DISPLAY_NAMES = {
  fajr: { ar: 'الفجر', en: 'Fajr', descriptionAr: 'صلاة الصبح عند بزوغ الفجر الصادق' },
  sunrise: { ar: 'الشروق', en: 'Sunrise', descriptionAr: 'شروق الشمس ونهاية وقت الفجر' },
  dhuhr: { ar: 'الظهر', en: 'Dhuhr', descriptionAr: 'زوال الشمس عن كبد السماء' },
  asr: { ar: 'العصر', en: 'Asr', descriptionAr: 'صيرورة ظل الشيء مثله' },
  maghrib: { ar: 'المغرب', en: 'Maghrib', descriptionAr: 'غروب قرص الشمس بالكامل' },
  isha: { ar: 'العشاء', en: 'Isha', descriptionAr: 'مغيب الشفق الأحمر' },
  midnight: { ar: 'منتصف الليل', en: 'Midnight', descriptionAr: 'نهاية وقت العشاء الاختياري' },
  lastThird: { ar: 'الثلث الأخير', en: 'Last Third', descriptionAr: 'وقت التنزل الإلهي وقيام الليل' },
};
