import React, { useState, useMemo } from 'react';
import { CITIES } from '../data/cities';
import { Language, Location } from '../types';
import { MapPin, Search, Navigation, X, Check, ShieldCheck, Globe, Loader2, PlusCircle } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: Location;
  onSelectLocation: (loc: Location) => void;
  lang: Language;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<Location[]>([]);

  const isAr = lang === 'ar';

  const regionTabs = [
    { id: 'all', nameAr: 'كافة المناطق', nameEn: 'All Regions' },
    { id: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia' },
    { id: 'EG', nameAr: 'مصر', nameEn: 'Egypt' },
    { id: 'gulf', nameAr: 'الخليج العربي', nameEn: 'Arabian Gulf' },
    { id: 'levant', nameAr: 'الشام وفلسطين والعراق', nameEn: 'Levant & Iraq' },
    { id: 'maghreb', nameAr: 'المغرب العربي', nameEn: 'North Africa' },
    { id: 'world', nameAr: 'أوروبا والعالم', nameEn: 'Global' },
  ];

  const filteredCities = useMemo(() => {
    let list = CITIES;

    if (selectedRegionFilter !== 'all') {
      if (selectedRegionFilter === 'SA') {
        list = list.filter((c) => c.countryCode === 'SA');
      } else if (selectedRegionFilter === 'EG') {
        list = list.filter((c) => c.countryCode === 'EG');
      } else if (selectedRegionFilter === 'gulf') {
        list = list.filter((c) => ['AE', 'QA', 'KW', 'BH', 'OM'].includes(c.countryCode));
      } else if (selectedRegionFilter === 'levant') {
        list = list.filter((c) => ['JO', 'PS', 'IQ', 'SY', 'LB'].includes(c.countryCode));
      } else if (selectedRegionFilter === 'maghreb') {
        list = list.filter((c) => ['MA', 'DZ', 'TN', 'LY', 'SD', 'MR'].includes(c.countryCode));
      } else if (selectedRegionFilter === 'world') {
        list = list.filter((c) => !['SA', 'EG', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'PS', 'IQ', 'SY', 'LB', 'MA', 'DZ', 'TN', 'LY', 'SD', 'MR'].includes(c.countryCode));
      }
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.cityAr.includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.countryAr.includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [searchQuery, selectedRegionFilter]);

  if (!isOpen) return null;

  const handleAutoDetect = () => {
    setDetectError(null);
    if (!navigator.geolocation) {
      setDetectError(
        isAr
          ? 'المتصفح لا يدعم تحديد الموقع الجغرافي. يرجى اختيار مدينتك من القائمة.'
          : 'Geolocation is not supported by your browser. Please pick a city manually.'
      );
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const { latitude, longitude } = pos.coords;

        // Find nearest city in database to match timezone and name
        let nearestCity = CITIES[0];
        let minDistance = Number.MAX_VALUE;

        for (const city of CITIES) {
          const d = Math.hypot(city.latitude - latitude, city.longitude - longitude);
          if (d < minDistance) {
            minDistance = d;
            nearestCity = city;
          }
        }

        const customLoc: Location = {
          id: `custom-${Date.now()}`,
          city: minDistance < 0.6 ? nearestCity.city : (isAr ? 'موقعي الجغرافي الحالي' : 'My Current Location'),
          cityAr: minDistance < 0.6 ? nearestCity.cityAr : 'موقعي الجغرافي الحالي',
          country: nearestCity.country,
          countryAr: nearestCity.countryAr,
          countryCode: nearestCity.countryCode,
          latitude: Math.round(latitude * 10000) / 10000,
          longitude: Math.round(longitude * 10000) / 10000,
          timezone: nearestCity.timezone,
        };

        onSelectLocation(customLoc);
        onClose();
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDetectError(
            isAr
              ? 'تم رفض إذن تحديد الموقع. يمكنك اختيار مدينتك يدوياً بكل سهولة من القائمة أدناه أو البحث عنها.'
              : 'Location permission was denied. You can easily pick your city from the list or search for it.'
          );
        } else {
          setDetectError(
            isAr
              ? 'تعذر تحديد الموقع بدقة. يُرجى اختيار منطقتك أو مدينتك من القائمة.'
              : 'Could not obtain exact location. Please select your region manually.'
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchWorldWide = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingOnline(true);
    setDetectError(null);

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5&accept-language=${lang}`
      );
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();

      if (Array.isArray(data) && data.length > 0) {
        const mapped: Location[] = data.map((item: any, idx: number) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const address = item.address || {};
          const cityName = address.city || address.town || address.village || address.state || item.display_name.split(',')[0];
          const countryName = address.country || (isAr ? 'منطقة عالمية' : 'Global Region');

          // Estimate approximate timezone from longitude
          const offsetHours = Math.round(lon / 15);
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

          return {
            id: `online-${idx}-${Date.now()}`,
            city: cityName,
            cityAr: cityName,
            country: countryName,
            countryAr: countryName,
            countryCode: (address.country_code || 'XX').toUpperCase(),
            latitude: Math.round(lat * 10000) / 10000,
            longitude: Math.round(lon * 10000) / 10000,
            timezone: tz,
          };
        });

        setOnlineResults(mapped);
      } else {
        setDetectError(
          isAr
            ? 'لم يتم العثور على نتائج إضافية في الخريطة العالمية. جرب كتابة اسم المدينة أو الدولة بشكل أدق.'
            : 'No additional locations found in global map. Try typing the full city name.'
        );
      }
    } catch {
      setDetectError(
        isAr
          ? 'تعذر الاتصال بخدمة الخرائط العالمية حالياً. اختر إحدى المدن المسجلة في القائمة.'
          : 'Could not connect to online map search. Please pick from available cities.'
      );
    } finally {
      setIsSearchingOnline(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <div>
              <h2 id="location-modal-title" className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {isAr ? 'تحديد المنطقة والمدينة (مواقيت الصلاة والقبلة)' : 'Select Region & City (Prayer & Qibla)'}
              </h2>
              <span className="text-[11px] text-stone-400">
                {isAr ? 'فهرس شامل لكافة المحافظات والمناطق العربية والعالمية' : 'Comprehensive directory of all provinces & worldwide regions'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transparent Privacy Explanation Banner */}
        <div className="p-3.5 mx-6 mt-3 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 rounded-2xl">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-sky-950 dark:text-sky-200 leading-relaxed">
              <span className="font-bold">
                {isAr ? 'حساب فلكي محلي آمن: ' : 'Local Astronomical Privacy: '}
              </span>
              <span>
                {isAr
                  ? 'يتم حساب مواقيت الصلاة وزاوية القبلة محلياً بالكامل استناداً لإحداثيات الأفق دون مشاركة أو تتبع.'
                  : 'Prayer times and Qibla bearings are calculated 100% locally on your device without transmitting data.'}
              </span>
            </div>
          </div>
        </div>

        {/* GPS Auto Detect CTA */}
        <div className="px-6 pt-3 pb-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>
              {isDetecting
                ? (isAr ? 'جاري استشعار إحداثيات موقعك...' : 'Detecting your coordinates...')
                : (isAr ? 'استخدام الموقع التلقائي بدقة (GPS)' : 'Auto-Detect via GPS')}
            </span>
          </button>
        </div>

        {detectError && (
          <div className="mx-6 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {detectError}
          </div>
        )}

        {/* Search Input with online fallback button */}
        <div className="px-6 py-2 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchWorldWide();
              }}
              placeholder={isAr ? 'ابحث عن اسم أي منطقة، محافظة، أو مدينة بالعالم...' : 'Search any region, province, or world city...'}
              className="w-full py-2.5 px-10 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/80 border border-sky-100 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOnlineResults([]);
                }}
                className="absolute top-2.5 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {regionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegionFilter(tab.id)}
                className={`py-1 px-2.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedRegionFilter === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-700'
                }`}
              >
                {isAr ? tab.nameAr : tab.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Global Online Search Trigger Banner when typing */}
        {searchQuery.trim().length > 1 && (
          <div className="mx-6 px-3 py-2 bg-sky-50/50 dark:bg-stone-800/70 rounded-xl flex items-center justify-between text-xs border border-sky-100 dark:border-stone-700">
            <span className="text-stone-600 dark:text-stone-300">
              {isAr ? `البحث عن "${searchQuery}" في كافة مناطق العالم:` : `Search "${searchQuery}" worldwide:`}
            </span>
            <button
              onClick={handleSearchWorldWide}
              disabled={isSearchingOnline}
              className="flex items-center gap-1.5 py-1 px-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-[11px] transition-colors disabled:opacity-50"
            >
              {isSearchingOnline ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{isAr ? 'جاري البحث...' : 'Searching...'}</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>{isAr ? 'بحث عالمي متقدم' : 'Global Search'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Online search results if any */}
        {onlineResults.length > 0 && (
          <div className="mx-6 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 px-2 py-0.5">
              {isAr ? 'نتائج البحث العالمي المباشر:' : 'Global Map Results:'}
            </div>
            {onlineResults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectLocation(item);
                  onClose();
                }}
                className="w-full text-start p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{item.city}</span>
                  <span className="text-stone-500 ms-2">({item.country})</span>
                  <div className="text-[10px] text-stone-400">
                    {item.latitude.toFixed(3)}°, {item.longitude.toFixed(3)}°
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-sky-600 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Cities List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-sky-50 dark:divide-stone-800/60">
          {filteredCities.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-500 space-y-3">
              <Globe className="w-8 h-8 mx-auto text-stone-400 opacity-60" />
              <p>{isAr ? 'لم تظهر نتائج محلية مطابقة.' : 'No local matches found in preset list.'}</p>
              <button
                onClick={handleSearchWorldWide}
                className="py-1.5 px-4 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isAr ? 'ابحث عنها في خرائط العالم أونلاين' : 'Search in World Atlas Online'}</span>
              </button>
            </div>
          ) : (
            filteredCities.map((city) => {
              const isSelected = currentLocation.id === city.id || currentLocation.cityAr === city.cityAr;
              return (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectLocation(city);
                    onClose();
                  }}
                  className={`w-full text-start py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                      : 'hover:bg-sky-50/50 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs sm:text-sm">
                      {isAr ? city.cityAr : city.city}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {isAr ? city.countryAr : city.country} · {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}° · {city.timezone}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>{CITIES.length} {isAr ? 'منطقة ومحافظة مسجلة' : 'regions and provinces cataloged'}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
