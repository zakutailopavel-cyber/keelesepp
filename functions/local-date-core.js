// Calendar date of an instant in the school's time zone (Europe/Tallinn). Finance dates (invoice date and number
// year, payment and refund dates, the financial lock check) must follow the local day, not UTC: an invoice made on
// 1 January at 01:30 in Tallinn is still 31 December in UTC.
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || 'Europe/Tallinn';

function appToday(value = new Date(), timeZone = APP_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

module.exports = { appToday, APP_TIME_ZONE };
