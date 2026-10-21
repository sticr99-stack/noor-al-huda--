import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, KhatmahProgress, Language } from '../types';
import { SURAHS_INDEX, SurahTextData } from '../data/quranData';
import { fetchSurahText, getSurahAudioUrl, clearSurahCache } from '../services/quranService';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  Search,
  CheckCircle2,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Volume2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface QuranKhatmahViewProps {
  progress: KhatmahProgress;
  onUpdateProgress: (prog: KhatmahProgress) => void;
  bookmarks: Bookmark[];
  onAddBookmark: (b: Bookmark) => void;
  onRemoveBookmark: (id: string) => void;
  lang: Language;
}

export const QuranKhatmahView: React.FC<QuranKhatmahViewProps> = ({
  progress,
  onUpdateProgress,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahContent, setSurahContent] = useState<SurahTextData | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [ayahSearchQuery, setAyahSearchQuery] = useState('');

  // Reader view preferences
  const [fontSizeClass, setFontSizeClass] = useState<'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl'>('text-2xl');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [isFullScreenReader, setIsFullScreenReader] = useState<boolean>(false);

  // Audio recitation player
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const readerContainerRef = useRef<HTMLDivElement | null>(null);
  const isAr = lang === 'ar';

  const filteredSurahs = SURAHS_INDEX.filter(
    (s) =>
      s.nameAr.includes(searchQuery) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery)
  );

  const completionPercent = Math.min(100, Math.round((progress.pagesRead / progress.totalPages) * 100));

  const loadSurah = (surahNum: number) => {
    setIsLoadingSurah(true);
    setLoadError(false);
    setAyahSearchQuery('');

    // Stop current audio if playing and switch audio source
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = getSurahAudioUrl(surahNum);
      audioRef.current.load();
      setIsPlayingAudio(false);
      setAudioProgress(0);
    }

    fetchSurahText(surahNum)
      .then((data) => {
        setSurahContent(data);
        setIsLoadingSurah(false);
        // check if it was an error fallback
        if (data.ayahs.length === 1 && data.ayahs[0].textAr.includes('تعذّر')) {
          setLoadError(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to load surah:', err);
        setIsLoadingSurah(false);
        setLoadError(true);
      });
  };

  // Load surah text whenever selectedSurahNumber changes
  useEffect(() => {
    if (!selectedSurahNumber) {
      setSurahContent(null);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
      return;
    }

    loadSurah(selectedSurahNumber);
  }, [selectedSurahNumber]);

  const handleSelectSurah = (surahNum: number) => {
    setSelectedSurahNumber(surahNum);
    audioEngine.playTasbihClick();
    // Scroll smoothly to the reader so the user immediately enters reading mode
    setTimeout(() => {
      readerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleRetryLoad = () => {
    if (!selectedSurahNumber) return;
    clearSurahCache(selectedSurahNumber);
    loadSurah(selectedSurahNumber);
  };

  // Audio handlers
  const handleToggleAudio = () => {
    if (!selectedSurahNumber) return;

    if (!audioRef.current) {
      const audio = new Audio(getSurahAudioUrl(selectedSurahNumber));
      audioRef.current = audio;

      audio.onwaiting = () => setIsAudioLoading(true);
      audio.oncanplay = () => setIsAudioLoading(false);
      audio.onplaying = () => {
        setIsAudioLoading(false);
        setIsPlayingAudio(true);
      };
      audio.onpause = () => setIsPlayingAudio(false);
      audio.onended = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };
    } else {
      // Ensure audio source matches current selected surah
      const expectedUrl = getSurahAudioUrl(selectedSurahNumber);
      if (audioRef.current.src !== expectedUrl) {
        audioRef.current.src = expectedUrl;
        audioRef.current.load();
      }
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      setIsAudioLoading(true);
      audioRef.current.play().catch((err) => {
        console.warn('Audio play failed:', err);
        setIsAudioLoading(false);
        setIsPlayingAudio(false);
      });
    }
  };

  const handleAddPages = (pages: number) => {
    const newTotal = Math.min(progress.totalPages, progress.pagesRead + pages);
    const updated: KhatmahProgress = {
      ...progress,
      pagesRead: newTotal,
    };
    onUpdateProgress(updated);
    audioEngine.playTasbihClick();

    if (newTotal >= progress.totalPages) {
      audioEngine.playCompletionChime();
    }
  };

  const handleResetKhatmah = () => {
    onUpdateProgress({
      ...progress,
      pagesRead: 0,
    });
  };

  const handleCopyAyah = (ayahText: string, num: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${ayahText} ﴿${num}﴾`);
      setCopiedAyahNumber(num);
      setTimeout(() => setCopiedAyahNumber(null), 2000);
    }
  };

  const filteredAyahs = surahContent?.ayahs.filter((a) => {
    if (!ayahSearchQuery.trim()) return true;
    return (
      a.textAr.includes(ayahSearchQuery) ||
      a.numberInSurah.toString() === ayahSearchQuery ||
      a.translationEn.toLowerCase().includes(ayahSearchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-100 dark:border-stone-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>{isAr ? 'المصحف الشريف الشامل ومتابعة الختمة' : 'Holy Quran Reader & Khatmah Planner'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? 'تلاوة كافة سور القرآن الـ 114 بالخط العثماني الواضح، الاستماع للترتيل، وجدولة الختمة'
              : 'Complete 114 Surahs in authentic Uthmani script, audio recitation, and paced daily Khatmah'}
          </p>
        </div>

        {/* Khatmah Goal Settings */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            {isAr ? 'مدة الختمة المستهدفة:' : 'Target Khatmah Duration:'}
          </span>
          <select
            value={progress.targetDays}
            onChange={(e) => {
              const days = Number(e.target.value);
              const dailyGoal = Math.ceil(progress.totalPages / days);
              onUpdateProgress({
                ...progress,
                targetDays: days,
                dailyPagesGoal: dailyGoal,
              });
            }}
            className="text-xs py-1.5 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100"
          >
            <option value={30}>{isAr ? '30 يوماً (شهر كامل)' : '30 Days (Full Month)'}</option>
            <option value={60}>{isAr ? '60 يوماً (شهران)' : '60 Days (2 Months)'}</option>
            <option value={90}>{isAr ? '90 يوماً (3 أشهر)' : '90 Days (3 Months)'}</option>
            <option value={15}>{isAr ? '15 يوماً (مكثفة)' : '15 Days (Intensive)'}</option>
          </select>
        </div>
      </div>

      {/* Khatmah Tracker Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50/80 via-sky-100/40 to-stone-50 dark:from-sky-950/40 dark:via-stone-900 dark:to-sky-900/20 border border-sky-200/80 dark:border-sky-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 dark:text-sky-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'خطة الختمة القرآنية الحالية' : 'Active Khatmah Progress'}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {progress.pagesRead} / {progress.totalPages} {isAr ? 'صفحة' : 'pages'}
              <span className="text-sm font-normal text-stone-500 dark:text-stone-400 ms-3">
                ({completionPercent}%)
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isAr
                ? `هدفك اليومي: ${progress.dailyPagesGoal} صفحات يومياً (ما يعادل ${Math.ceil(progress.dailyPagesGoal / 5)} صفحات دبر كل صلاة مكتوبة)`
                : `Daily Target: ${progress.dailyPagesGoal} pages/day (~${Math.ceil(progress.dailyPagesGoal / 5)} pages after each prayer)`}
            </p>
          </div>

          {/* Quick Actions & Mark Read Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectSurah(bookmarks[0]?.surahNumber || 1)}
              className="py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{isAr ? 'فتح المصحف للقراءة الآن' : 'Open Quran Reader Now'}</span>
            </button>
            <button
              onClick={() => handleAddPages(1)}
              className="py-2 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-sky-400 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? '+1 صفحة' : '+1 Page'}</span>
            </button>
            <button
              onClick={() => handleAddPages(4)}
              className="py-2 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-sky-400 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? '+4 صفحات' : '+4 Pages'}</span>
            </button>
            <button
              onClick={() => handleAddPages(20)}
              className="py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? '+20 صفحة (جزء)' : '+20 Pages'}</span>
            </button>
            <button
              onClick={handleResetKhatmah}
              title={isAr ? 'بدء ختمة جديدة' : 'Start new khatmah'}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200/80 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-sky-600 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Bookmarks Bar if any */}
      {bookmarks.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <BookmarkIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? 'علامات الحفظ والفواصل المحفوظة:' : 'Saved Reading Bookmarks:'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="py-1 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs flex items-center gap-2 text-amber-900 dark:text-amber-200"
              >
                <button
                  onClick={() => handleSelectSurah(bm.surahNumber)}
                  className="hover:underline font-semibold flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  <span>{bm.surahNameAr} (آية {bm.ayahNumber})</span>
                </button>
                <button
                  onClick={() => onRemoveBookmark(bm.id)}
                  className="text-stone-400 hover:text-rose-600"
                  title={isAr ? 'حذف العلامة' : 'Remove'}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Surah Reading Drawer / Reader Panel Anchor */}
      <div ref={readerContainerRef} />

      {/* Surah Reading Drawer / Reader Panel */}
      {selectedSurahNumber && (
        <div
          className={`bg-stone-50 dark:bg-stone-950 border-2 border-sky-500/40 dark:border-sky-500/40 rounded-3xl space-y-6 shadow-xl animate-in fade-in duration-300 transition-all ${
            isFullScreenReader
              ? 'fixed inset-4 z-50 overflow-y-auto p-6 md:p-10 bg-white dark:bg-stone-950 max-w-5xl mx-auto shadow-2xl border-4'
              : 'p-6 md:p-8'
          }`}
        >
          {/* Reader Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 dark:border-stone-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white flex items-center justify-center font-mono font-bold text-sm shadow">
                {selectedSurahNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl md:text-2xl font-bold font-quran text-stone-900 dark:text-stone-100">
                    {surahContent?.titleAr ?? `سورة رقم ${selectedSurahNumber}`}
                  </h3>
                  <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                    {isAr ? 'وضع التلاوة المباشرة' : 'Live Reading'}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {surahContent?.titleEn} · {isAr ? 'مصحف بالخط العثماني الواضح والمريح للعين' : 'Clear Uthmani Quranic text'}
                </p>
              </div>
            </div>

            {/* Controls: Audio Recitation, Zoom, Translation Toggle, Fullscreen, Close */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Recitation Player Button */}
              <button
                onClick={handleToggleAudio}
                disabled={isAudioLoading}
                className="py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60"
              >
                {isAudioLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlayingAudio ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>
                  {isPlayingAudio
                    ? (isAr ? 'إيقاف التلاوة' : 'Pause Recitation')
                    : (isAr ? 'استماع للترتيل' : 'Listen')}
                </span>
              </button>

              {/* Font Size Adjusters */}
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden bg-white dark:bg-stone-800">
                <button
                  onClick={() => setFontSizeClass('text-xl')}
                  title={isAr ? 'خط عادي' : 'Normal font'}
                  className={`px-2 py-1 text-xs font-bold ${
                    fontSizeClass === 'text-xl' ? 'bg-stone-200 dark:bg-stone-700' : ''
                  }`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSizeClass('text-2xl')}
                  title={isAr ? 'خط متوسط' : 'Medium font'}
                  className={`px-2 py-1 text-xs font-bold ${
                    fontSizeClass === 'text-2xl' ? 'bg-stone-200 dark:bg-stone-700' : ''
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSizeClass('text-3xl')}
                  title={isAr ? 'خط كبير' : 'Large font'}
                  className={`px-2 py-1 text-xs font-bold ${
                    fontSizeClass === 'text-3xl' ? 'bg-stone-200 dark:bg-stone-700' : ''
                  }`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSizeClass('text-4xl')}
                  title={isAr ? 'خط كبير جداً' : 'Extra Large font'}
                  className={`px-2 py-1 text-xs font-bold ${
                    fontSizeClass === 'text-4xl' ? 'bg-stone-200 dark:bg-stone-700' : ''
                  }`}
                >
                  A++
                </button>
              </div>

              {/* Translation Toggle */}
              <button
                onClick={() => setShowTranslation((v) => !v)}
                title={isAr ? 'إظهار / إخفاء الترجمة الإنجليزية' : 'Toggle Translation'}
                className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullScreenReader((v) => !v)}
                title={isAr ? (isFullScreenReader ? 'تصغير' : 'ملء الشاشة للقراءة') : 'Toggle Fullscreen'}
                className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {isFullScreenReader ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Prev / Next Surah */}
              <div className="flex items-center gap-1">
                <button
                  disabled={selectedSurahNumber <= 1}
                  onClick={() => handleSelectSurah(Math.max(1, selectedSurahNumber - 1))}
                  className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800"
                  title={isAr ? 'السورة السابقة' : 'Previous Surah'}
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  disabled={selectedSurahNumber >= 114}
                  onClick={() => handleSelectSurah(Math.min(114, selectedSurahNumber + 1))}
                  className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800"
                  title={isAr ? 'السورة التالية' : 'Next Surah'}
                >
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedSurahNumber(null);
                  setIsFullScreenReader(false);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800"
                title={isAr ? 'إغلاق المصحف' : 'Close reader'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Audio progress bar if playing */}
          {isPlayingAudio && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-sky-800 dark:text-sky-300 font-medium">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                  {isAr ? 'تلاوة الشيخ مشاري راشد العفاسي' : 'Recitation: Mishary Rashid Alafasy'}
                </span>
                <span>{Math.round(audioProgress)}%</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ayah search inside active surah */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={ayahSearchQuery}
                onChange={(e) => setAyahSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن آية أو رقم في هذه السورة...' : 'Search verse text or number...'}
                className="w-full py-1.5 px-8 text-xs bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            {surahContent && (
              <span className="text-xs text-stone-400">
                {surahContent.ayahs.length} {isAr ? 'آية كريمة' : 'verses'}
              </span>
            )}
          </div>

          {/* Loading state */}
          {isLoadingSurah && (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-sky-600 animate-spin" />
              <p className="text-xs text-stone-500 font-medium">
                {isAr ? 'جاري فتح المصحف وتحميل آيات السورة الكريمة...' : 'Loading verses of the Holy Surah...'}
              </p>
            </div>
          )}

          {/* Error / Offline Notice */}
          {!isLoadingSurah && loadError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'تنبيه الاتصال بالمصحف' : 'Connection Note'}</span>
                </div>
                <p>
                  {isAr
                    ? 'تعذر تحميل كامل آيات هذه السورة الكريمة عبر الشبكة. يمكنك النقر على إعادة المحاولة أو الاستماع للترتيل.'
                    : 'Unable to reach the Quran server. You can tap retry to attempt reloading.'}
                </p>
              </div>
              <button
                onClick={handleRetryLoad}
                className="py-1.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
              </button>
            </div>
          )}

          {/* Bismillah Header */}
          {!isLoadingSurah && surahContent?.bismillah && (
            <div className="text-center py-5 font-quran text-2xl md:text-3xl text-sky-900 dark:text-sky-300 border-b border-sky-100 dark:border-stone-800/60">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}

          {/* Ayahs Display */}
          {!isLoadingSurah && filteredAyahs && (
            <div className="space-y-6 divide-y divide-stone-200/80 dark:divide-stone-800/80">
              {filteredAyahs.map((ayah) => {
                const isBookmarked = bookmarks.some(
                  (b) => b.surahNumber === selectedSurahNumber && b.ayahNumber === ayah.numberInSurah
                );

                return (
                  <div key={ayah.numberInSurah} className="pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* Arabic Quranic Verse */}
                      <p
                        className={`font-quran ${fontSizeClass} text-stone-900 dark:text-stone-100 leading-loose text-end flex-1`}
                      >
                        {ayah.textAr}
                        <span className="inline-flex items-center justify-center w-8 h-8 mx-2 rounded-full border-2 border-amber-600/70 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 align-middle">
                          {ayah.numberInSurah}
                        </span>
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyAyah(ayah.textAr, ayah.numberInSurah)}
                          title={isAr ? 'نسخ الآية' : 'Copy Ayah'}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                        >
                          {copiedAyahNumber === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Bookmark button */}
                        <button
                          onClick={() => {
                            if (isBookmarked) {
                              const found = bookmarks.find(
                                (b) =>
                                  b.surahNumber === selectedSurahNumber &&
                                  b.ayahNumber === ayah.numberInSurah
                              );
                              if (found) onRemoveBookmark(found.id);
                            } else {
                              onAddBookmark({
                                id: `bm-${Date.now()}`,
                                surahNumber: selectedSurahNumber,
                                surahNameAr: surahContent?.titleAr ?? `سورة ${selectedSurahNumber}`,
                                ayahNumber: ayah.numberInSurah,
                                date: new Date().toLocaleDateString(),
                              });
                            }
                          }}
                          title={
                            isBookmarked
                              ? isAr
                                ? 'إزالة الفاصل'
                                : 'Remove bookmark'
                              : isAr
                                ? 'حفظ علامة القراءة'
                                : 'Bookmark ayah'
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            isBookmarked
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200 dark:hover:bg-stone-800'
                          }`}
                        >
                          <BookmarkIcon
                            className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Translation if enabled */}
                    {showTranslation && ayah.translationEn && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 italic font-sans leading-relaxed">
                        {ayah.translationEn}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reader Footer Navigation */}
          <div className="pt-4 border-t border-sky-100 dark:border-stone-800 flex items-center justify-between">
            <button
              disabled={selectedSurahNumber <= 1}
              onClick={() => handleSelectSurah(Math.max(1, selectedSurahNumber - 1))}
              className="py-1.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? 'السورة السابقة' : 'Previous Surah'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedSurahNumber(null);
                setIsFullScreenReader(false);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold"
            >
              {isAr ? 'العودة إلى فهرس السور ↑' : 'Back to Surah List ↑'}
            </button>

            <button
              disabled={selectedSurahNumber >= 114}
              onClick={() => handleSelectSurah(Math.min(114, selectedSurahNumber + 1))}
              className="py-1.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <span>{isAr ? 'السورة التالية' : 'Next Surah'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Search Input for Surahs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{isAr ? 'فهرس سور القرآن الكريم (114 سورة):' : 'All 114 Chapters of the Holy Quran:'}</span>
            <span className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/50 py-0.5 px-2 rounded-md border border-sky-100 dark:border-sky-900/40">
              {isAr ? 'انقر على أي سورة لبدء القراءة فوراً' : 'Click any surah to read'}
            </span>
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث برقم أو اسم السورة...' : 'Search by name or number...'}
              className="w-full py-1.5 px-9 text-xs bg-stone-50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* 114 Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto p-1.5 border border-sky-100 dark:border-stone-800/60 rounded-2xl">
          {filteredSurahs.map((surah) => {
            const isSelected = selectedSurahNumber === surah.number;

            return (
              <button
                key={surah.number}
                type="button"
                onClick={() => handleSelectSurah(surah.number)}
                className={`p-3 rounded-xl border text-start flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-500/50'
                    : 'bg-white dark:bg-stone-800/40 border-sky-100 dark:border-stone-800 hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-50 dark:bg-stone-700 text-sky-800 dark:text-stone-300 border border-sky-100 dark:border-transparent'
                    }`}
                  >
                    {surah.number}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-xs truncate">
                      {isAr ? surah.nameAr : surah.nameEn}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 truncate ${
                        isSelected ? 'text-sky-100' : 'text-stone-400'
                      }`}
                    >
                      {isAr
                        ? `${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · ${surah.numberOfAyahs} آية`
                        : `${surah.revelationType} · ${surah.numberOfAyahs} Ayahs`}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40'
                  }`}
                >
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  <span>{isAr ? 'اقرأ' : 'Read'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
