import type { CozySeason } from '../assets/images';

export type SeasonMode = CozySeason | 'auto';
export type WeatherKind = 'clear' | 'rain' | 'snow' | 'leaves' | 'fireflies';

export const SEASONS: readonly CozySeason[] = ['spring', 'summer', 'autumn', 'winter'];

/** Northern hemisphere calendar seasons; calendar-based ambience, not gameplay event eligibility. */
export function seasonForDate(date: Date): CozySeason {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}

export function resolveSeason(mode: SeasonMode, date: Date = new Date()): CozySeason {
  return mode === 'auto' ? seasonForDate(date) : mode;
}

export function defaultWeather(season: CozySeason): WeatherKind {
  return {spring:'clear', summer:'fireflies', autumn:'rain', winter:'snow'}[season] as WeatherKind;
}

/** Effects must be opt-in presentation only, never used by card or reward rules. */
export interface AmbiencePreferences {
  season: SeasonMode;
  effectsEnabled: boolean;
  reduceMotion: boolean;
  weather: WeatherKind | 'auto';
}

export const DEFAULT_AMBIENCE: AmbiencePreferences = {
  season: 'auto',
  effectsEnabled: true,
  reduceMotion: false,
  weather: 'auto',
};

export function resolveWeather(settings: AmbiencePreferences, date = new Date()): WeatherKind {
  if (!settings.effectsEnabled || settings.reduceMotion) return 'clear';
  return settings.weather === 'auto' ? defaultWeather(resolveSeason(settings.season, date)) : settings.weather;
}
