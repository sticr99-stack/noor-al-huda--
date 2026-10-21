import { HijriDate } from '../types';

export const HIJRI_MONTHS_AR = [
  'المحرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان المبارك',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah',
];

export interface IslamicEvent {
  titleAr: string;
  titleEn: string;
  hijriDay: number;
  hijriMonth: number;
  descriptionAr: string;
  descriptionEn: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    titleAr: 'رأس السنة الهجرية',
    titleEn: 'Islamic New Year',
    hijriDay: 1,
    hijriMonth: 1,
    descriptionAr: 'فاتحة العام الهجري الجديد وهجرة النبي ﷺ إلى المدينة',
    descriptionEn: 'Beginning of the new Hijri calendar year',
  },
  {
    titleAr: 'يوم عاشوراء',
    titleEn: 'Day of Ashura',
    hijriDay: 10,
    hijriMonth: 1,
    descriptionAr: 'اليوم العاشر من محرم ويستحب صيامه تكفيراً للسنة الماضية',
    descriptionEn: 'The 10th of Muharram, recommended day of fasting',
  },
  {
    titleAr: 'المولد النبوي الشريف',
    titleEn: 'Prophet\'s Birthday (Mawlid)',
    hijriDay: 12,
    hijriMonth: 3,
    descriptionAr: 'ذكرى ميلاد خاتم الأنبياء محمد ﷺ',
    descriptionEn: 'Birth of Prophet Muhammad (peace be upon him)',
  },
  {
    titleAr: 'الإسراء والمعراج',
    titleEn: 'Isra and Mi\'raj',
    hijriDay: 27,
    hijriMonth: 7,
    descriptionAr: 'معجزة الإسراء من المسجد الحرام إلى المسجد الأقصى والمعراج إلى السماوات العلى',
    descriptionEn: 'The miraculous night journey and heavenly ascension',
  },
  {
    titleAr: 'ليلة النصف من شعبان',
    titleEn: 'Mid-Sha\'ban Night',
    hijriDay: 15,
    hijriMonth: 8,
    descriptionAr: 'ليلة مباركة يستحب قيامها والاستغفار فيها',
    descriptionEn: 'The 15th night of Sha\'ban',
  },
  {
    titleAr: 'أول أيام شهر رمضان المبارك',
    titleEn: '1st of Ramadan (Fasting Begins)',
    hijriDay: 1,
    hijriMonth: 9,
    descriptionAr: 'بداية شهر الصيام والقرآن والرحمة والمغفرة',
    descriptionEn: 'Beginning of the blessed month of fasting',
  },
  {
    titleAr: 'ليلة القدر (أرجى الليالي)',
    titleEn: 'Laylat al-Qadr',
    hijriDay: 27,
    hijriMonth: 9,
    descriptionAr: 'خير من ألف شهر، تنزل الملائكة والروح فيها',
    descriptionEn: 'The Night of Power, better than a thousand months',
  },
  {
    titleAr: 'عيد الفطر المبارك',
    titleEn: 'Eid al-Fitr',
    hijriDay: 1,
    hijriMonth: 10,
    descriptionAr: 'يوم الجائزة والفرح بإتمام صيام رمضان',
    descriptionEn: 'Celebration marking the conclusion of Ramadan fasting',
  },
  {
    titleAr: 'يوم عرفة',
    titleEn: 'Day of Arafah',
    hijriDay: 9,
    hijriMonth: 12,
    descriptionAr: 'أعظم أيام الحج وصيامه يكفر سنتين',
    descriptionEn: 'The climax of Hajj pilgrimage and recommended fasting',
  },
  {
    titleAr: 'عيد الأضحى المبارك',
    titleEn: 'Eid al-Adha',
    hijriDay: 10,
    hijriMonth: 12,
    descriptionAr: 'يوم النحر وذكرى فداء إسماعيل عليه السلام',
    descriptionEn: 'Feast of the Sacrifice during the Hajj season',
  },
];

/**
 * Algorithmic conversion from Gregorian Date to Hijri Date
 * Supports offset adjustment (-2 to +2 days)
 */
export function getHijriDate(date: Date = new Date(), offsetDays: number = 0): HijriDate {
  // Apply day offset
  const workingDate = new Date(date);
  if (offsetDays !== 0) {
    workingDate.setDate(workingDate.getDate() + offsetDays);
  }

  // Use Intl if available for regional Umm Al-Qura calendar
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(workingDate);
    const dayPart = parts.find((p) => p.type === 'day');
    const monthPart = parts.find((p) => p.type === 'month');
    const yearPart = parts.find((p) => p.type === 'year');

    if (dayPart && monthPart && yearPart) {
      const day = parseInt(dayPart.value, 10);
      const month = parseInt(monthPart.value, 10);
      const year = parseInt(yearPart.value, 10);

      const monthNameAr = HIJRI_MONTHS_AR[month - 1] || '';
      const monthNameEn = HIJRI_MONTHS_EN[month - 1] || '';

      return {
        day,
        month,
        monthNameAr,
        monthNameEn,
        year,
        formattedAr: `${day} ${monthNameAr} ${year} هـ`,
        formattedEn: `${day} ${monthNameEn} ${year} AH`,
        isRamadan: month === 9,
      };
    }
  } catch {
    // Fallback to standard Julian Day algorithmic conversion
  }

  // Algorithmic Ku-Ku fallback
  let day = workingDate.getDate();
  let month = workingDate.getMonth();
  let year = workingDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  let bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);

  let z = jd - 1948440 + 10632;
  let n = Math.floor((z - 1) / 10631);
  z = z - 10631 * n + 354;
  let j = (Math.floor((10985 - z) / 5316)) * (Math.floor((50 * z) / 17719)) + (Math.floor(z / 5670)) * (Math.floor((43 * z) / 15238));
  z = z - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  let mH = Math.floor((24 * z) / 709);
  let dH = z - Math.floor((709 * mH) / 24);
  let yH = 30 * n + j - 30;

  mH += 1;

  const monthNameAr = HIJRI_MONTHS_AR[mH - 1] || '';
  const monthNameEn = HIJRI_MONTHS_EN[mH - 1] || '';

  return {
    day: dH,
    month: mH,
    monthNameAr,
    monthNameEn,
    year: yH,
    formattedAr: `${dH} ${monthNameAr} ${yH} هـ`,
    formattedEn: `${dH} ${monthNameEn} ${yH} AH`,
    isRamadan: mH === 9,
  };
}

/**
 * Calculates days remaining until the next Ramadan (1st of Ramadan)
 */
export function getDaysUntilRamadan(currentHijri: HijriDate): number {
  if (currentHijri.isRamadan) return 0;

  let monthsLeft: number;
  if (currentHijri.month < 9) {
    monthsLeft = 9 - currentHijri.month - 1;
  } else {
    monthsLeft = (12 - currentHijri.month) + 8;
  }

  const daysLeftInCurrentMonth = Math.max(0, 30 - currentHijri.day);
  const estimatedDays = Math.round(monthsLeft * 29.53) + daysLeftInCurrentMonth;
  return Math.max(1, estimatedDays);
}
