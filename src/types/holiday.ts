export type HolidayType = 'fixed' | 'moveable';

export interface HolidayEntry {
  name: string;
  /** ISO 8601 date string: "YYYY-MM-DD" */
  date: string;
  type: HolidayType;
  country: string;
}

export interface CountryHolidays {
  country: string;
  year: number;
  holidays: HolidayEntry[];
}
