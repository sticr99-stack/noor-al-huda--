import React, { useState } from 'react';
import { Language, Location } from '../types';
import { Code2, Copy, Check, X, Eye } from 'lucide-react';

interface EmbedWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  lang: Language;
}

export const EmbedWidgetModal: React.FC<EmbedWidgetModalProps> = ({
  isOpen,
  onClose,
  location,
  lang,
}) => {
  const [theme, setTheme] = useState<'emerald' | 'light' | 'dark'>('emerald');
  const [widgetType, setWidgetType] = useState<'card' | 'compact'>('card');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://noor-al-huda.app';

  const embedCode = `<iframe
  src="${appBaseUrl}?embed=true&city=${location.id}&theme=${theme}&type=${widgetType}&lang=${lang}"
  width="${widgetType === 'card' ? '360' : '300'}"
  height="${widgetType === 'card' ? '420' : '200'}"
  style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);"
  title="${isAr ? 'مواقيت الصلاة - سَكينة' : 'Prayer Times Widget - Sakina'}"
></iframe>`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 id="embed-modal-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {isAr ? 'تضمين ويدجت مواقيت الصلاة في موقعك' : 'Embed Prayer Times Widget'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {isAr
              ? `انسخ هذا الكود البرمجي وألصقه في مدونتك أو موقعك الإلكتروني لعرض مواقيت الصلاة الحية لمدينة ${location.cityAr}.`
              : `Copy and paste this snippet into your website or blog to display live prayer times for ${location.city}.`}
          </p>

          {/* Theme & Style Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                {isAr ? 'السمة اللونية:' : 'Color Theme:'}
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full text-xs py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl"
              >
                <option value="sky">{isAr ? 'السماوي الهادئ والذهبي (Sky & Gold)' : 'Sky Blue & Gold'}</option>
                <option value="light">{isAr ? 'أبيض ناصع (Pure White)' : 'Pure White'}</option>
                <option value="dark">{isAr ? 'داكن ليلي (Nocturnal Dark)' : 'Nocturnal Dark'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                {isAr ? 'شكل الويدجت:' : 'Widget Format:'}
              </label>
              <select
                value={widgetType}
                onChange={(e) => setWidgetType(e.target.value as any)}
                className="w-full text-xs py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl"
              >
                <option value="card">{isAr ? 'بطاقة كاملة مع الصلوات' : 'Full Daily Card'}</option>
                <option value="compact">{isAr ? 'شريط مقتضب للصلاة القادمة' : 'Compact Countdown Strip'}</option>
              </select>
            </div>
          </div>

          {/* Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>{isAr ? 'كود التضمين (HTML / Iframe):' : 'HTML / Iframe Snippet:'}</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-semibold hover:underline"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy code')}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={embedCode}
              rows={4}
              className="w-full font-mono text-xs p-3 bg-stone-900 text-sky-300 rounded-xl border border-stone-800 select-all focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-sky-100 dark:border-stone-800 bg-sky-50/40 dark:bg-stone-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
