import { STUDY_TERMS_VERSION } from '../../services/firebase/auth.js';

export { STUDY_TERMS_VERSION };

export const STUDY_TERMS_SECTIONS = [
  {
    title: 'Õppetasu ja arved',
    paragraphs: [
      'Õppetundide hind kinnitatakse õppija või lapsevanemaga enne õppetöö algust.',
      'Jooksva kuu õppetundide eest tuleb tasuda hiljemalt sama kuu 10. kuupäevaks vastavalt esitatud arvele või kokkulepitud makseandmetele.',
      'Makse loetakse tasutuks, kui kogu arvel märgitud summa on laekunud E&P Koolitus OÜ arvelduskontole.',
    ],
  },
  {
    title: 'Puudumised ja tunni tühistamine',
    paragraphs: [
      'Kui õppija ei saa tunnis osaleda, tuleb sellest õpetajale võimalikult vara teada anda.',
      'Puudutud tunni arvestamise, tühistamise või ümbertõstmise tingimused lähtuvad enne õppetöö algust kokkulepitud kursuse või individuaalõppe tingimustest.',
      'KeeleSepast või õpetajast tingitud tunni ärajäämise korral lepitakse kokku uus tunni aeg või muu sobiv lahendus.',
    ],
  },
  {
    title: 'Tunniplaan ja õppetöö info',
    paragraphs: [
      'Õppija osaleb tundides kokkulepitud ajal. Kehtiv tunniplaan, kodutööd, õppematerjalid ja õpetaja tagasiside on nähtavad KeeleSepa iseteeninduses.',
      'Lapsevanem hoiab oma kontaktandmed ajakohased ning jälgib iseteenindusse lisatud olulist õppetöö infot.',
    ],
  },
  {
    title: 'Küsimused ja suhtlus',
    paragraphs: [
      'Õppetööga seotud küsimustes saab pöörduda õpetaja poole. Arvete, maksete ja korralduslike küsimuste korral palume kirjutada aadressile info@epkoolitus.ee.',
      'Need õppetingimused täiendavad KeeleSepa kasutustingimusi ja privaatsuspoliitikat.',
    ],
  },
];

export function hasAcceptedCurrentStudyTerms(user) {
  if (!user?.roles?.includes('parent')) return true;
  return Boolean(
    user.profile?.studyTermsAcceptedAt
    && user.profile?.studyTermsVersion === STUDY_TERMS_VERSION,
  );
}

export function needsStudyTermsAcceptance(user) {
  return Boolean(user?.roles?.includes('parent') && !hasAcceptedCurrentStudyTerms(user));
}
