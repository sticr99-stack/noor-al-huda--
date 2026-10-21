/**
 * Domain Models and Types for Noor Al-Huda (نور الهدى)
 */

export type Language = 'ar' | 'en';
export type ViewMode = 'web' | 'mobile';

export interface Location {
  id: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string; // e.g., 'Asia/Riyadh', 'Africa/Cairo', 'Europe/London'
}

export type CalculationMethodId = 
  | 'UmmAlQura'       // Umm Al-Qura University, Makkah
  | 'MWL'             // Muslim World League
  | 'Egypt'           // Egyptian General Authority of Survey
  | 'ISNA'            // Islamic Society of North America
  | 'Karachi'         // University of Islamic Sciences, Karachi
  | 'Tehran';         // Institute of Geophysics, University of Tehran

export interface CalculationMethodInfo {
  id: CalculationMethodId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  fajrAngle: number;
  ishaAngleOrMinutes: number | string; // angle or fixed minutes
}

export type Madhab = 'Standard' | 'Hanafi'; // Standard = Shafi'i, Maliki, Hanbali (shadow factor 1), Hanafi = 2

export type HighLatitudeRule = 'AngleBased' | 'MidNight' | 'OneSeventh';

export interface PrayerSettings {
  method: CalculationMethodId;
  madhab: Madhab;
  highLatitudeRule: HighLatitudeRule;
  hijriOffset: number; // -2 to +2 days for moon sighting adjustment
}

export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  lastThird: Date;
}

export interface FormattedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight: string;
  lastThird: string;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface NextPrayerInfo {
  current: PrayerName | 'isha_post';
  next: PrayerName;
  nextTime: Date;
  remainingSeconds: number;
  progressPercent: number; // 0 to 100 within current prayer window
}

export interface ReminderSetting {
  enabled: boolean;
  offsetMinutes: number; // 0 for exact time, -10 for 10 min before
  sound: 'adhan' | 'chime' | 'silent';
}

export type ReminderMap = Record<PrayerName, ReminderSetting>;

export interface HijriDate {
  day: number;
  month: number;
  monthNameAr: string;
  monthNameEn: string;
  year: number;
  formattedAr: string;
  formattedEn: string;
  isRamadan: boolean;
}

export interface ArticleCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}

export interface Article {
  id: string;
  slug: string;
  categoryId: string;
  titleAr: string;
  titleEn: string;
  readTimeMinutes: number;
  authorAr: string;
  authorEn: string;
  publishedDate: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  sources: string[];
}

export interface DhikrItem {
  id: string;
  category: 'morning' | 'evening' | 'post_prayer' | 'sleep' | 'travel' | 'daily_special';
  textAr: string;
  transliteration: string;
  translationEn: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  referenceAr: string;
  referenceEn: string;
  benefitAr: string;
  benefitEn: string;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  specialOccasionAr?: string;
  specialOccasionEn?: string;
}

export interface Surah {
  number: number;
  nameAr: string;
  nameEn: string;
  englishTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  numberInSurah: number;
  textAr: string;
  translationEn: string;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahNameAr: string;
  ayahNumber: number;
  date: string;
  note?: string;
}

export interface KhatmahProgress {
  targetDays: number;
  startDate: string;
  currentSurah: number;
  currentAyah: number;
  pagesRead: number;
  totalPages: number; // standard Mus'haf has 604 pages
  dailyPagesGoal: number;
  completedSurahs: number[];
}

export interface DailyGoal {
  id: string;
  key: string;
  titleAr: string;
  titleEn: string;
  category: 'prayer' | 'quran' | 'dhikr' | 'charity';
  completed: boolean;
  streakDays: number;
  lastCompletedDate?: string;
}
