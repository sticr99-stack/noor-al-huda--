/**
 * Qibla Direction Great Circle Calculation & Compass Engine
 */

export const KAABA_COORDINATES = {
  latitude: 21.4225, // 21° 25' 21" N
  longitude: 39.8262, // 39° 49' 34" E
};

const d2r = (deg: number) => (deg * Math.PI) / 180;
const r2d = (rad: number) => (rad * 180) / Math.PI;

/**
 * Calculates the forward azimuth (bearing) from a location to the Kaaba in Makkah.
 * Returns an angle in degrees [0, 360) clockwise from True North.
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const phi1 = d2r(latitude);
  const lambda1 = d2r(longitude);
  const phi2 = d2r(KAABA_COORDINATES.latitude);
  const lambda2 = d2r(KAABA_COORDINATES.longitude);

  const deltaLambda = lambda2 - lambda1;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = r2d(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return Math.round(bearing * 10) / 10;
}

/**
 * Calculates the Great Circle distance to the Kaaba in kilometers
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371; // Earth's mean radius in km
  const phi1 = d2r(latitude);
  const phi2 = d2r(KAABA_COORDINATES.latitude);
  const deltaPhi = d2r(KAABA_COORDINATES.latitude - latitude);
  const deltaLambda = d2r(KAABA_COORDINATES.longitude - longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Request device orientation permission for mobile browsers (iOS 13+)
 */
export async function requestOrientationPermission(): Promise<boolean> {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
  ) {
    try {
      const permissionState = await (
        DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
      ).requestPermission();
      return permissionState === 'granted';
    } catch {
      return false;
    }
  }
  // Android and desktop browsers do not require explicit requestPermission
  return true;
}

/**
 * Normalize compass heading from alpha or webkitCompassHeading
 */
export function extractCompassHeading(event: DeviceOrientationEvent): number | null {
  // iOS Safari provides webkitCompassHeading (degrees from True North directly)
  if ('webkitCompassHeading' in event && typeof (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
    return (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
  }
  // Standard alpha angle
  if (typeof event.alpha === 'number') {
    // Invert for compass rotation
    return (360 - event.alpha) % 360;
  }
  return null;
}
