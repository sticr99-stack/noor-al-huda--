import React, { useState } from 'react';
import { Article, Language } from '../types';
import { ARTICLES, ARTICLE_CATEGORIES } from '../data/articles';
import { ArticleModal } from './ArticleModal';
import { BookOpen, Clock, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft } from 'lucide-react';

interface ArticlesSectionProps {
  lang: Language;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const isAr = lang === 'ar';

  const filteredArticles = selectedCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.categoryId === selectedCategory);

  return (
    <section className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-100 dark:border-stone-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>{isAr ? 'واحة المعرفة والأحكام الشرعية' : 'Islamic Knowledge & Rulings'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? 'مقالات علمية موثقة مستندة إلى الكتاب والسنّة النبوية وإجماع فقهاء الأمة'
              : 'Scholarly articles grounded in the Quran, authentic Sunnah, and verified consensus'}
          </p>
        </div>

        {/* Category Filter Buttons (Functional Segmented Control) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-stone-700 text-sky-700 dark:text-sky-300 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          {ARTICLE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-stone-700 text-sky-700 dark:text-sky-300 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {filteredArticles.map((article) => {
          const category = ARTICLE_CATEGORIES.find((c) => c.id === article.categoryId);
          return (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-stone-800/30 border border-sky-100 dark:border-stone-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Zero-Pill Metadata */}
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2.5">
                  <span className="font-semibold text-sky-700 dark:text-sky-400">
                    {isAr ? category?.nameAr : category?.nameEn}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTimeMinutes} {isAr ? 'د قراءة' : 'min'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{article.publishedDate}</span>
                </div>

                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors leading-snug">
                  {isAr ? article.titleAr : article.titleEn}
                </h3>

                <p className="mt-2 text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                  {isAr ? article.excerptAr : article.excerptEn}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-sky-100 dark:border-stone-700/60 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>{isAr ? 'قراءة المقال كاملاً' : 'Read Full Article'}</span>
                {isAr ? <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reading Modal */}
      <ArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        lang={lang}
      />
    </section>
  );
};
