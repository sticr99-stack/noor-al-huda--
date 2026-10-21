import React, { useState } from 'react';
import { Article, Language } from '../types';
import { X, BookOpen, Clock, Calendar, Check, Copy, Share2, ZoomIn, ZoomOut } from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  lang: Language;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, lang }) => {
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!article) return null;

  const isAr = lang === 'ar';
  const title = isAr ? article.titleAr : article.titleEn;
  const author = isAr ? article.authorAr : article.authorEn;
  const content = isAr ? article.contentAr : article.contentEn;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{isAr ? 'القراءة الهادئة والموثقة' : 'Verified Knowledge Article'}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size adjustments */}
            <div className="flex items-center bg-sky-50 dark:bg-stone-800 rounded-lg p-0.5 border border-sky-100 dark:border-stone-700">
              <button
                onClick={() => setFontSizeOffset((v) => Math.max(-2, v - 1))}
                title={isAr ? 'تصغير الخط' : 'Smaller text'}
                className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFontSizeOffset((v) => Math.min(6, v + 1))}
                title={isAr ? 'تكبير الخط' : 'Larger text'}
                className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              title={isAr ? 'نسخ الرابط' : 'Copy link'}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-sky-50 dark:hover:bg-stone-800"
            >
              {isCopied ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              aria-label={isAr ? 'إغلاق' : 'Close'}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-sky-50 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
          {/* Metadata: Zero-pill discipline */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
            <span>{author}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTimeMinutes} {isAr ? 'دقائق قراءة' : 'min read'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {article.publishedDate}
            </span>
          </div>

          {/* Article Title */}
          <h1
            id="article-modal-title"
            className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 leading-snug mb-6"
            style={{ textWrap: 'balance' }}
          >
            {title}
          </h1>

          {/* Excerpt */}
          <div className="p-4 bg-sky-50/70 dark:bg-sky-950/30 border-s-4 border-sky-500 rounded-e-xl text-sm italic text-stone-700 dark:text-stone-300 mb-8 leading-relaxed">
            {isAr ? article.excerptAr : article.excerptEn}
          </div>

          {/* Formatted Content */}
          <div
            className="text-stone-800 dark:text-stone-200 leading-relaxed space-y-4 font-normal"
            style={{ fontSize: `${16 + fontSizeOffset}px` }}
          >
            {content.split('\n\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={index}
                    className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 pt-4 pb-1 border-b border-sky-100 dark:border-stone-800"
                  >
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
                const items = trimmed.split('\n- ').map((item) => item.replace(/^- /, ''));
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 ps-2">
                    {items.map((it, idx) => (
                      <li key={idx} className="text-stone-700 dark:text-stone-300">
                        {it}
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={index} className="text-stone-700 dark:text-stone-300">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Scholarly Sources & Verification Box */}
          <div className="mt-10 p-5 bg-sky-50/50 dark:bg-stone-800/60 border border-sky-100 dark:border-stone-700/60 rounded-2xl">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-2">
              {isAr ? 'المصادر والمراجع الشرعية الموثقة:' : 'Scholarly Sources & Documentation:'}
            </h4>
            <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400 list-decimal list-inside">
              {article.sources.map((src, idx) => (
                <li key={idx}>{src}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-sky-100 dark:border-stone-800 bg-sky-50/40 dark:bg-stone-800/40 flex items-center justify-between text-xs text-stone-500">
          <span>{isAr ? 'محتوى مراجع ومدقق شرعياً' : 'Audited and verified scholarly content'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 text-white font-medium hover:opacity-90 shadow-xs"
          >
            {isAr ? 'تمت القراءة' : 'Done Reading'}
          </button>
        </div>
      </div>
    </div>
  );
};
