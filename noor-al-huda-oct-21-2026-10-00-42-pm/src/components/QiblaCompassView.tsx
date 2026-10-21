import React, { useState, useEffect } from 'react';
import { Language, Location } from '../types';
import {
  calculateDistanceToKaaba,
  calculateQiblaDirection,
  extractCompassHeading,
  requestOrientationPermission,
} from '../services/qiblaEngine';
import { Compass, RotateCw, CheckCircle2, AlertCircle, Info, Smartphone } from 'lucide-react';

interface QiblaCompassViewProps {
  location: Location;
  lang: Language;
}

export const QiblaCompassView: React.FC<QiblaCompassViewProps> = ({ location, lang }) => {
  const isAr = lang === 'ar';

  const qiblaAngle = calculateQiblaDirection(location.latitude, location.longitude);
  const distanceKm = calculateDistanceToKaaba(location.latitude, location.longitude);

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [sensorPermissionRequired, setSensorPermissionRequired] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(0);

  // Effective compass heading
  const currentHeading = hasSensor ? deviceHeading : manualHeading;
  const relativeQiblaAngle = (qiblaAngle - currentHeading + 360) % 360;

  // Is phone pointed at Kaaba within ±4 degrees
  const isAligned = relativeQiblaAngle <= 4 || relativeQiblaAngle >= 356;

  useEffect(() => {
    // Check if permission is needed (iOS Safari)
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      setSensorPermissionRequired(true);
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const heading = extractCompassHeading(e);
      if (heading !== null) {
        setDeviceHeading(heading);
        setHasSensor(true);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestOrientationPermission();
    if (granted) {
      setSensorPermissionRequired(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-sky-100 dark:border-stone-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>{isAr ? 'بوصلة اتجاه القبلة المشرفة' : 'Qibla Direction Compass'}</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAr
              ? `سمت القبلة من ${location.cityAr}: ${qiblaAngle}° من الشمال الحقيقي · المسافة للكعبة: ${distanceKm.toLocaleString('ar-SA')} كم`
              : `True Qibla bearing from ${location.city}: ${qiblaAngle}° from North · Distance to Kaaba: ${distanceKm.toLocaleString('en-US')} km`}
          </p>
        </div>

        {sensorPermissionRequired && (
          <button
            onClick={handleRequestPermission}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isAr ? 'تفعيل مستشعر البوصلة' : 'Enable Compass Sensor'}</span>
          </button>
        )}
      </div>

      {/* Main Compass Workspace */}
      <div className="py-8 flex flex-col items-center justify-center">
        {/* Alignment Status Banner */}
        <div className="mb-6">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 py-2 px-5 bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 rounded-full text-sm font-semibold shadow-sm animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>{isAr ? 'أنت متجه مباشرة نحو الكعبة المشرفة!' : 'Directly Facing the Holy Kaaba!'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-sky-50/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-xs border border-sky-100 dark:border-stone-700">
              <RotateCw className="w-4 h-4 text-amber-500" />
              <span>
                {isAr
                  ? `أدر الجهاز حتى يطابق المؤشر السماوي رأس البوصلة (${Math.round(relativeQiblaAngle)}° متبقية)`
                  : `Rotate until sky blue pointer matches compass top (${Math.round(relativeQiblaAngle)}° remaining)`}
              </span>
            </div>
          )}
        </div>

        {/* Visual Compass Rose */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Compass Outer Ring */}
          <div
            className={`w-full h-full rounded-full border-4 transition-all duration-300 relative flex items-center justify-center shadow-xl ${
              isAligned
                ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-950/20 shadow-sky-500/20'
                : 'border-sky-200 dark:border-stone-700 bg-sky-50/20 dark:bg-stone-950/60'
            }`}
            style={{
              transform: `rotate(${-currentHeading}deg)`,
              transition: hasSensor ? 'transform 0.15s ease-out' : 'transform 0.3s ease',
            }}
          >
            {/* Cardinal Direction Markers */}
            <span className="absolute top-2 font-bold text-xs text-rose-500">N (ش)</span>
            <span className="absolute bottom-2 font-bold text-xs text-stone-400">S (ج)</span>
            <span className="absolute right-3 font-bold text-xs text-stone-400">E (ق)</span>
            <span className="absolute left-3 font-bold text-xs text-stone-400">W (غ)</span>

            {/* Degree ticks around edge */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-full pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="w-0.5 h-2 bg-sky-200 dark:bg-stone-700 mx-auto" />
              </div>
            ))}

            {/* Qibla Needle Pointer */}
            <div
              className="absolute w-full h-full flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              {/* Pointing to Kaaba */}
              <div className="absolute top-4 flex flex-col items-center">
                <div className="w-5 h-5 bg-sky-600 border-2 border-white rounded-full shadow-md flex items-center justify-center text-[9px] text-white font-bold">
                  🕋
                </div>
                <div className="w-1 h-20 bg-gradient-to-t from-sky-600 to-amber-400 rounded-full mt-1" />
              </div>
            </div>

            {/* Compass Center Hub */}
            <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 border-2 border-sky-200 dark:border-stone-700 shadow-md flex flex-col items-center justify-center z-10">
              <span className="text-[10px] text-stone-400 font-mono">
                {Math.round(qiblaAngle)}°
              </span>
              <span className="text-[9px] font-bold text-sky-700 dark:text-sky-400 font-arabic">
                القبلة
              </span>
            </div>
          </div>
        </div>

        {/* Readout Metrics */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
          <div className="p-3 bg-sky-50/50 dark:bg-stone-800/60 border border-sky-100 dark:border-stone-800 rounded-xl text-center">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
              {isAr ? 'زاوية السمت الحقيقي' : 'True Azimuth Bearing'}
            </span>
            <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {qiblaAngle}°
            </span>
          </div>
          <div className="p-3 bg-sky-50/50 dark:bg-stone-800/60 border border-sky-100 dark:border-stone-800 rounded-xl text-center">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
              {isAr ? 'المسافة إلى مكة المكرمة' : 'Distance to Kaaba'}
            </span>
            <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {distanceKm.toLocaleString(isAr ? 'ar-SA' : 'en-US')} {isAr ? 'كم' : 'km'}
            </span>
          </div>
        </div>

        {/* Interactive Manual Heading Slider for Desktop */}
        {!hasSensor && (
          <div className="w-full max-w-md mt-6 p-4 bg-sky-50/40 dark:bg-stone-800/40 border border-sky-100 dark:border-stone-800 rounded-2xl">
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-stone-400" />
                {isAr ? 'محاكاة تدوير الهاتف (لأجهزة الحاسوب):' : 'Desktop Compass Simulator:'}
              </span>
              <span className="font-mono text-sky-700 dark:text-sky-400 font-bold">{manualHeading}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={manualHeading}
              onChange={(e) => setManualHeading(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>0° N</span>
              <span>90° E</span>
              <span>180° S</span>
              <span>270° W</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-md mt-6 p-4 bg-amber-50/50 dark:bg-stone-800/40 border border-amber-200/50 dark:border-stone-800 rounded-2xl flex items-start gap-3 text-xs text-stone-600 dark:text-stone-400">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            {isAr
              ? 'للحصول على أدق نتيجة: ضع الهاتف على سطح مستوٍ أفقياً بعيداً عن المعادن والأجهزة الإلكترونية. وإذا دعت الحاجة، حرّك الهاتف في الهواء على شكل رقم 8 لمعايرة المستشعر.'
              : 'For highest precision: keep your phone on a flat horizontal surface away from metallic objects or magnets. If necessary, move your device in a figure-8 motion to calibrate the magnetometer.'}
          </p>
        </div>
      </div>
    </div>
  );
};
