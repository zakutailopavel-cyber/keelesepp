// TSD rates by the year of the PAYMENT (taxation is cash-based, emta.ee „Maksumäärad”). This is the only place with the
// numbers; a year without a row stops the calculation instead of silently using old rates. A finance user can set or
// correct a year in the TSD tab (tsdSettings/<year>), which overrides this table. Sources: docs/ACCOUNTING.md „TSD”.
export const RATE_FIELDS = Object.freeze([
  ['incomeTaxBps', 'Tulumaks', 'percent'],
  ['socialTaxBps', 'Sotsiaalmaks', 'percent'],
  ['socialMinBaseCents', 'Sotsiaalmaksu kuumäär', 'euro'],
  ['unemploymentEmployeeBps', 'Töötuskindlustus, töötaja', 'percent'],
  ['unemploymentEmployerBps', 'Töötuskindlustus, tööandja', 'percent'],
  ['exemptionGeneralCents', 'Üldine maksuvaba tulu kuus (610)', 'euro'],
  ['exemptionPensionAgeCents', 'Maksuvaba tulu vanaduspensionieas kuus (650)', 'euro'],
]);

export const TSD_RATES = Object.freeze({
  2026: Object.freeze({
    incomeTaxBps: 2200,
    socialTaxBps: 3300,
    socialMinBaseCents: 88600,
    unemploymentEmployeeBps: 160,
    unemploymentEmployerBps: 80,
    exemptionGeneralCents: 70000,
    exemptionPensionAgeCents: 77600,
  }),
});

// the funded pension rate is the person's own choice at the Pensionikeskus, so it is on the person, not on the year
export const PENSION_RATES = Object.freeze([0, 2, 4, 6]);

export function ratesForYear(year, overrides = null) {
  const rates = overrides || TSD_RATES[year];
  if (!rates) return null;
  return RATE_FIELDS.every(([key]) => Number.isInteger(rates[key])) ? rates : null;
}

// Lisa 1, part I: the payment types a language school can have, from the official table
// tsd_lisa_1_valjamakseliikide_tabel_01.01.2026.xlsx. exemption = MVT 610/650, minimum = social tax from the monthly
// base (kuumäär), pension = KP, unemployment = TK/TTK. The A1/E101, pension and sea-carriage types are left out. The
// data-based TSD from 01.10.2026 keeps these codes and attributes (APA_TSD_valjamakseliikide maatrikstabel_20251118.xlsx).
export const PAYMENT_TYPES = Object.freeze({
  10: { label: 'palgatulu (tööleping)', exemption: true, social: true, minimum: true, pension: true, unemployment: true },
  15: { label: 'seaduse alusel töö eest makstud tasu', exemption: true, social: true, minimum: false, pension: true, unemployment: false },
  16: { label: 'muu väljamakse töötajale, ainult tulumaks', exemption: true, social: false, minimum: false, pension: false, unemployment: false },
  17: { label: 'töövõtu-, käsundus- või muu võlaõiguslik leping', exemption: true, social: true, minimum: false, pension: true, unemployment: true },
  21: { label: 'juhatuse või nõukogu liikme tasu', exemption: true, social: true, minimum: false, pension: true, unemployment: false },
  24: { label: 'tööandja makstud haigushüvitis', exemption: true, social: false, minimum: false, pension: false, unemployment: false },
  33: { label: 'hüvitis töölepingu ülesütlemisel', exemption: true, social: true, minimum: true, pension: true, unemployment: false },
  54: { label: 'intressid', exemption: true, social: false, minimum: false, pension: false, unemployment: false },
  55: { label: 'muu tulu', exemption: true, social: false, minimum: false, pension: false, unemployment: false },
  57: { label: 'eluruumi üüritulu', exemption: true, social: false, minimum: false, pension: false, unemployment: false },
});

// not on Lisa 1: an FIE or a company bills the school; a non-resident belongs on Lisa 2 with other rules
export const NOT_ON_LISA_1 = Object.freeze({
  fie: 'FIE või ettevõte (arve alusel, TSD-le ei kuulu)',
  nonresident: 'Mitteresident (lisa 2, CRM ei arvuta)',
});
