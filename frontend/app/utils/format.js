export function formatSalary(amount, lang = 'en') {
  if (amount === null || amount === undefined || amount === '') return '-';
  const localeMap = { en: 'en-ET', am: 'am-ET', om: 'om-ET' };
  const locale = localeMap[lang] || 'en-ET';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(Number(amount));
  } catch (e) {
    // fallback
    return `${amount} ETB`;
  }
}

export default formatSalary;