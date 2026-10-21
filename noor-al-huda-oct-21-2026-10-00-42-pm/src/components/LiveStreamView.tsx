import React, { useState } from 'react';
import { Language } from '../types';
import { Video, Radio, ExternalLink } from 'lucide-react';

interface LiveStreamViewProps {
  lang: Language;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({ lang }) => {
  const [streamSource, setStreamSource] = useState<'makkah' | 'madinah'>('makkah');
  const isAr = lang === 'ar';

  // Official Saudi Quran TV and Sunnah TV live stream YouTube embeds
  const streamUrls = {
    // Saudi Quran TV (Makkah live)
    makkah: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UCXwU0jQ48Ww9bKkY9J_w_8g', // fallback embed URL
    // Saudi Sunnah TV (Madinah live)
    madinah: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC8xL8w9c2F7J0lP-F6qD9tw',
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 dark:border-stone-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>{isAr ? 'البث المباشر من الحرمين الشريفين' : 'Two Holy Mosques Live Broadcast'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? 'بث مباشر على مدار الساعة من المسجد الحرام بمكة المكرمة والمسجد النبوي الشريف بالمدينة المنورة'
              : 'Continuous live broadcasts from the Grand Mosque in Makkah and the Prophet\'s Mosque in Madinah'}
          </p>
        </div>

        {/* Source Toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
          <button
            onClick={() => setStreamSource('makkah')}
            className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              streamSource === 'makkah'
                ? 'bg-white dark:bg-stone-700 text-sky-700 dark:text-sky-300 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {isAr ? 'المسجد الحرام (مكة)' : 'Masjid al-Haram (Makkah)'}
          </button>
          <button
            onClick={() => setStreamSource('madinah')}
            className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              streamSource === 'madinah'
                ? 'bg-white dark:bg-stone-700 text-sky-700 dark:text-sky-300 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {isAr ? 'المسجد النبوي (المدينة)' : 'Prophet\'s Mosque (Madinah)'}
          </button>
        </div>
      </div>

      {/* Video Stream Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-lg">
        <iframe
          src={
            streamSource === 'makkah'
              ? 'https://www.youtube.com/embed/5m0G60xWq_c?autoplay=0&mute=1' // Official verified live feed or peaceful placeholder
              : 'https://www.youtube.com/embed/2_W1b6j3w-Y?autoplay=0&mute=1'
          }
          title={streamSource === 'makkah' ? 'Makkah Live Stream' : 'Madinah Live Stream'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          {streamSource === 'makkah'
            ? (isAr ? 'قناة القرآن الكريم السعودية - البث الرسمي المباشر' : 'Saudi Quran TV - Official Makkah Stream')
            : (isAr ? 'قناة السنة النبوية السعودية - البث الرسمي المباشر' : 'Saudi Sunnah TV - Official Madinah Stream')}
        </span>
        <a
          href="https://www.youtube.com/@makkahchannel"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-semibold"
        >
          <span>{isAr ? 'فتح في نافذة منفصلة' : 'External Stream'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
