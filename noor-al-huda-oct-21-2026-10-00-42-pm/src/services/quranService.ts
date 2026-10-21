import { Ayah } from '../types';
import { EMBEDDED_SURAHS, SURAHS_INDEX, SurahTextData } from '../data/quranData';

const CACHE_PREFIX = 'sakina_surah_v2_';
const memoryCache = new Map<number, SurahTextData>();

// Helper to strip leading Bismillah from Ayah 1 (since the reader renders Bismillah header separately)
function stripLeadingBismillah(text: string): string {
  const bismillahPatterns = [
    /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَـٰنِ\s+ٱلرَّحِيمِ\s*/u,
    /^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/u,
    /^بِسْمِ\s+اللهِ\s+الرَّحْمٰنِ\s+الرَّحِيمِ\s*/u,
    /^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/u,
  ];
  let cleaned = text.trim();
  for (const pattern of bismillahPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '').trim();
      break;
    }
  }
  return cleaned || text;
}

export async function fetchSurahText(surahNumber: number): Promise<SurahTextData> {
  // 1. In-memory cache
  if (memoryCache.has(surahNumber)) {
    return memoryCache.get(surahNumber)!;
  }

  // 2. Embedded Surahs (fully bundled offline)
  if (EMBEDDED_SURAHS[surahNumber] && EMBEDDED_SURAHS[surahNumber].ayahs.length > 0) {
    memoryCache.set(surahNumber, EMBEDDED_SURAHS[surahNumber]);
    return EMBEDDED_SURAHS[surahNumber];
  }

  // 3. Browser localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${surahNumber}`);
      if (cached) {
        const parsed = JSON.parse(cached) as SurahTextData;
        if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
          memoryCache.set(surahNumber, parsed);
          return parsed;
        }
      }
    } catch {
      // storage unavailable or restricted
    }
  }

  const surahMeta = SURAHS_INDEX.find((s) => s.number === surahNumber);
  const titleAr = surahMeta ? `سُورَةُ ${surahMeta.nameAr}` : `سُورَة ${surahNumber}`;
  const titleEn = surahMeta ? `Surah ${surahMeta.nameEn}` : `Surah ${surahNumber}`;
  const hasBismillah = surahNumber !== 9 && surahNumber !== 1;

  // 4. Primary API: AlQuran Cloud (Uthmani + English Sahih)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 1) {
        const uthmaniEdition = json.data[0];
        const englishEdition = json.data[1] ?? null;

        const ayahs: Ayah[] = uthmaniEdition.ayahs.map((arAyah: { numberInSurah: number; text: string }, index: number) => {
          let text = arAyah.text;
          // In AlQuran Cloud Uthmani, verse 1 of surahs 2..114 (except 9) prepends Bismillah.
          if (surahNumber !== 1 && surahNumber !== 9 && arAyah.numberInSurah === 1) {
            text = stripLeadingBismillah(text);
          }
          const enAyah = englishEdition?.ayahs ? englishEdition.ayahs[index] : null;

          return {
            numberInSurah: arAyah.numberInSurah,
            textAr: text,
            translationEn: enAyah ? enAyah.text : '',
          };
        });

        const result: SurahTextData = {
          titleAr: surahMeta ? `سُورَةُ ${surahMeta.nameAr}` : uthmaniEdition.name,
          titleEn: surahMeta ? `Surah ${surahMeta.nameEn}` : uthmaniEdition.englishName,
          bismillah: hasBismillah,
          ayahs,
        };

        memoryCache.set(surahNumber, result);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`${CACHE_PREFIX}${surahNumber}`, JSON.stringify(result));
          } catch {
            // ignore quota error
          }
        }
        return result;
      }
    }
  } catch (err) {
    console.warn(`Primary Quran API failed for surah ${surahNumber}, falling back to Quran.com API:`, err);
  }

  // 5. Secondary Backup API: Quran.com official API v4
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.verses) && json.verses.length > 0) {
        const ayahs: Ayah[] = json.verses.map((v: { verse_key: string; text_uthmani: string }, index: number) => {
          const num = index + 1;
          let text = v.text_uthmani.trim();
          if (surahNumber !== 1 && surahNumber !== 9 && num === 1) {
            text = stripLeadingBismillah(text);
          }
          return {
            numberInSurah: num,
            textAr: text,
            translationEn: '',
          };
        });

        const result: SurahTextData = {
          titleAr,
          titleEn,
          bismillah: hasBismillah,
          ayahs,
        };

        memoryCache.set(surahNumber, result);
        return result;
      }
    }
  } catch (err) {
    console.warn(`Secondary Quran API failed for surah ${surahNumber}:`, err);
  }

  // 6. Graceful offline fallback with clear notice & retry capability
  return {
    titleAr,
    titleEn,
    bismillah: hasBismillah,
    ayahs: [
      {
        numberInSurah: 1,
        textAr: 'القرآن الكريم كلام الله عز وجل. تعذّر الاتصال بخادم المصحف حالياً، يرجى التحقق من اتصال الإنترنت والنقر على زر إعادة المحاولة.',
        translationEn: 'The Noble Quran. Unable to reach the Quran server currently. Please check your connection and tap retry.',
      },
    ],
  };
}

export function clearSurahCache(surahNumber?: number) {
  if (surahNumber) {
    memoryCache.delete(surahNumber);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${CACHE_PREFIX}${surahNumber}`);
      } catch {
        // ignore
      }
    }
  } else {
    memoryCache.clear();
  }
}

export function getSurahAudioUrl(surahNumber: number): string {
  // Mishary Rashid Alafasy surah recitation audio stream
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
}
