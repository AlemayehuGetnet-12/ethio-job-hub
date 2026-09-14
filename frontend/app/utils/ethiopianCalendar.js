/**
 * Ethiopian Calendar utilities
 * Converts Gregorian dates to Ethiopian Calendar (EC) dates.
 * Ethiopian calendar is ~7-8 years behind Gregorian and has 13 months.
 */

const ET_MONTHS = [
  "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
];

const ET_MONTHS_EN = [
  "Meskerem", "Tikmt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
];

/**
 * Convert a Gregorian Date to Ethiopian Calendar components.
 * Returns { year, month (1-13), day, monthName, monthNameEn }
 */
export function toEthiopian(date) {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdnToEthiopian(jdn);
}

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToEthiopian(jdn) {
  const r = (jdn - 1723856) % 1461;
  const n = r % 365 + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = n % 30 + 1;
  return {
    year,
    month,
    day,
    monthName: ET_MONTHS[month - 1] ?? "ጳጉሜ",
    monthNameEn: ET_MONTHS_EN[month - 1] ?? "Pagume",
  };
}

/**
 * Format a Gregorian date as Ethiopian Calendar string.
 * @param {Date|string} date
 * @param {"am"|"en"} lang
 */
export function formatEthiopian(date, lang = "en") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const et = toEthiopian(d);
  if (lang === "am") {
    return `${et.day} ${et.monthName} ${et.year} ዓ.ም`;
  }
  return `${et.day} ${et.monthNameEn} ${et.year} EC`;
}

/**
 * Returns both Gregorian and Ethiopian date strings.
 */
export function dualDate(date, lang = "en") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const greg = d.toLocaleDateString("en-ET", { year: "numeric", month: "short", day: "numeric" });
  const eth = formatEthiopian(d, lang);
  return `${greg} (${eth})`;
}
