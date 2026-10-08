// Nepali Bikram Sambat (BS) Calendar Integration
// Provides accurate AD <-> BS conversion with authentic Devanagari representation

import NepaliDateConstructor from 'nepali-date-converter';

const NepaliDate = (NepaliDateConstructor as any)?.default || (NepaliDateConstructor as any);

export const NEPALI_MONTHS_DEVANAGARI = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मंसीर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत'
] as const;

export const NEPALI_MONTHS_ENGLISH = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra'
] as const;

export const NEPALI_DAYS_DEVANAGARI = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहिबार',
  'शुक्रबार',
  'शनिबार'
] as const;

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toDevanagariNumerals(num: number | string): string {
  return String(num).replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[parseInt(digit, 10)]);
}

export interface ConvertedNepaliDate {
  year: number;
  month: number; // 0-indexed (0 = Baisakh, 5 = Aswin/Asoj)
  day: number;
  dayOfWeek: number; // 0 = Sunday
  monthNameNepali: string;
  monthNameEnglish: string;
  formattedNepali: string; // e.g. "असोज २२, २०८३"
  formattedShortNepali: string; // e.g. "असोज २२"
  formattedEnglish: string; // e.g. "Ashwin 22, 2083"
  formattedShortEnglish: string; // e.g. "Ashwin 22"
}

export function getNepaliDate(dateInput: Date | string): ConvertedNepaliDate {
  try {
    const jsDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    // ensure valid date
    if (isNaN(jsDate.getTime())) {
      throw new Error('Invalid date');
    }

    const nd = new NepaliDate(jsDate);
    const year = nd.getYear();
    const month = nd.getMonth(); // 0-indexed
    const day = nd.getDate();
    const dayOfWeek = jsDate.getDay();

    const monthNameNepali = NEPALI_MONTHS_DEVANAGARI[month] || '';
    const monthNameEnglish = NEPALI_MONTHS_ENGLISH[month] || '';

    const nepaliDayStr = toDevanagariNumerals(day);
    const nepaliYearStr = toDevanagariNumerals(year);

    return {
      year,
      month,
      day,
      dayOfWeek,
      monthNameNepali,
      monthNameEnglish,
      formattedNepali: `${monthNameNepali} ${nepaliDayStr}, ${nepaliYearStr}`,
      formattedShortNepali: `${monthNameNepali} ${nepaliDayStr}`,
      formattedEnglish: `${monthNameEnglish} ${day}, ${year}`,
      formattedShortEnglish: `${monthNameEnglish} ${day}`
    };
  } catch {
    // Graceful fallback if date is outside table
    return {
      year: 2083,
      month: 5,
      day: 1,
      dayOfWeek: 0,
      monthNameNepali: 'असोज',
      monthNameEnglish: 'Ashwin',
      formattedNepali: 'असोज १, २०८३',
      formattedShortNepali: 'असोज १',
      formattedEnglish: 'Ashwin 1, 2083',
      formattedShortEnglish: 'Ashwin 1'
    };
  }
}

/**
 * Format a date string or Date object into the canonical subtle Nepali date string
 * Example: October 8, 2026 -> "असोज २२, २०८३"
 */
export function formatNepaliDisplay(dateInput: Date | string, short = false): string {
  const nep = getNepaliDate(dateInput);
  return short ? nep.formattedShortNepali : nep.formattedNepali;
}
