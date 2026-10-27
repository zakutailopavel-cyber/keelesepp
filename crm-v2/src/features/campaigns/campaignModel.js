// „Kampaaniad” (owner 2026-10-27: „групповые уроки для дошкольников по воскресеньям, группа из 5 человек … в кабинете
// сделать будущие кампании или акции, рекламные кампании и мероприятия, чтобы готовить прямо в кабинете админа и
// потом уже готовый формат постить”). A campaign is prepared here — offer, dates, goal, the posts per channel and
// language, a checklist — and the administrator posts the finished texts by hand. Nothing is published from the CRM.

export const KINDS = { offer: 'Aktsioon / uus teenus', ad: 'Reklaamikampaania', event: 'Üritus' };
export const STATUSES = { idea: 'Idee', preparing: 'Ettevalmistus', ready: 'Valmis postitamiseks', live: 'Käib', done: 'Lõppenud', archived: 'Arhiiv' };
export const CHANNELS = { facebook: 'Facebook', instagram: 'Instagram', website: 'Koduleht', whatsapp: 'WhatsApp', email: 'E-kiri', flyer: 'Flaier / plakat' };
export const LANGS = { et: 'ET', ru: 'RU' };

const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max);
const day = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '');
const count = (value, max = 1000000) => Math.min(max, Math.max(0, Math.round(Number(value) || 0)));
const dateOf = (value) => (typeof value?.toDate === 'function' ? value.toDate().toISOString() : clean(value, 40));

export function normalizePost(post = {}) {
  return {
    channel: CHANNELS[post.channel] ? post.channel : 'facebook',
    lang: LANGS[post.lang] ? post.lang : 'et',
    text: clean(post.text, 3000),
    imageNote: clean(post.imageNote, 500),
    postDate: day(post.postDate),
    posted: post.posted === true,
  };
}

export function normalizeCampaign(id, data = {}) {
  return {
    id,
    title: clean(data.title, 120),
    kind: KINDS[data.kind] ? data.kind : 'offer',
    status: STATUSES[data.status] ? data.status : 'idea',
    startDate: day(data.startDate),
    endDate: day(data.endDate),
    audience: clean(data.audience, 300),
    offer: clean(data.offer, 1000),
    goal: clean(data.goal, 300),
    targetSignups: count(data.targetSignups, 10000),
    signups: count(data.signups, 10000),
    budgetCents: count(data.budgetCents),
    spentCents: count(data.spentCents),
    groupId: clean(data.groupId, 128),
    channels: (Array.isArray(data.channels) ? data.channels : []).filter((channel) => CHANNELS[channel]).filter((channel, index, all) => all.indexOf(channel) === index),
    posts: (Array.isArray(data.posts) ? data.posts : []).slice(0, 30).map(normalizePost),
    checklist: (Array.isArray(data.checklist) ? data.checklist : []).slice(0, 40).map((item) => ({ text: clean(item?.text, 200), done: item?.done === true })).filter((item) => item.text),
    notes: clean(data.notes, 3000),
    createdAt: dateOf(data.createdAt),
    createdByUid: clean(data.createdByUid, 128),
    createdByName: clean(data.createdByName, 120),
    updatedAt: dateOf(data.updatedAt),
  };
}

// the stored fields (firestore.rules campaignValid); the service adds createdAt / createdBy* / updatedAt
export function recordOf(campaign) {
  const value = normalizeCampaign('', campaign);
  const META = new Set(['id', 'createdAt', 'createdByUid', 'createdByName', 'updatedAt']);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !META.has(key)));
}

export function validateCampaign(campaign) {
  if (!clean(campaign.title)) return 'Kirjuta kampaania nimi.';
  if (campaign.startDate && campaign.endDate && campaign.endDate < campaign.startDate) return 'Lõpp ei saa olla enne algust.';
  return '';
}

// how far the preparation is
export function progressOf(campaign) {
  const checklist = campaign.checklist || [];
  const posts = campaign.posts || [];
  return {
    checklistDone: checklist.filter((item) => item.done).length,
    checklistTotal: checklist.length,
    postsReady: posts.filter((post) => post.text).length,
    postsPosted: posts.filter((post) => post.posted).length,
    postsTotal: posts.length,
    signupsPercent: campaign.targetSignups ? Math.min(100, Math.round((campaign.signups / campaign.targetSignups) * 100)) : null,
  };
}

// posts to put out today or earlier that are not marked posted
export function duePosts(campaigns, today) {
  return campaigns.filter((campaign) => !['done', 'archived', 'idea'].includes(campaign.status))
    .flatMap((campaign) => campaign.posts.map((post, index) => ({ campaign, post, index })))
    .filter(({ post }) => post.text && !post.posted && post.postDate && post.postDate <= today)
    .sort((a, b) => a.post.postDate.localeCompare(b.post.postDate));
}

const ORDER = ['live', 'ready', 'preparing', 'idea', 'done', 'archived'];
export function sortCampaigns(list) {
  return [...list].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || (a.startDate || '9999').localeCompare(b.startDate || '9999') || a.title.localeCompare(b.title, 'et'));
}

// a ready-made start (the owner's first one: the Sunday pre-school group of five)
export const TEMPLATES = {
  preschool: {
    label: 'Eelkool — pühapäevarühm',
    campaign: {
      title: 'Eelkool pühapäeviti (5–6-aastased)',
      kind: 'offer',
      status: 'preparing',
      audience: '5–6-aastased lapsed, kes lähevad varsti kooli; vene keelt kõnelevad pered, kes tahavad, et laps alustaks kooli eesti keelega julgelt.',
      offer: 'Kord nädalas pühapäeviti, grupp kuni 5 last. Eesti keel mänguliselt + kooliks ettevalmistus (tähed, numbrid, kuulamine, rääkimine). Hind: [hind] € kuus / [hind] € tund. Esimene tund proovitund.',
      goal: 'Komplekteerida 1 grupp (5 last) enne algust.',
      targetSignups: 5,
      channels: ['facebook', 'instagram', 'whatsapp', 'website'],
      checklist: [
        'Kinnita kellaaeg, ruum / Zoom ja õpetaja',
        'Pane paika hind ja proovitunni tingimused',
        'Loo grupp „Grupid” lehel (5 kohta, vanus 5–6)',
        'Vali „Kellele pakkuda grupitunde” nimekirjast pered, kellel on 4–6-aastane laps',
        'Valmista pilt / plakat (vt pildi kirjeldust postituste juures)',
        'Postita Facebooki ja Instagrami (ET + RU)',
        'Saada WhatsAppi sõnum olemasolevatele peredele',
        'Lisa info kodulehele',
        'Helista huvilistele tagasi ja pane proovitund kalendrisse',
      ].map((text) => ({ text, done: false })),
      posts: [
        { channel: 'facebook', lang: 'et', imageNote: 'Hele foto või illustratsioon: 4–5 last laua ümber tähekaartidega, roheline aktsent, pealkiri „Eelkool pühapäeviti”.', text: '🎒 Eelkool pühapäeviti — KeeleSepp\n\nKas Sinu laps läheb varsti kooli? Aitame tal alustada julgelt eesti keeles!\n\n✅ 5–6-aastastele\n✅ Kord nädalas pühapäeviti kell [kellaaeg]\n✅ Väike grupp — kuni 5 last\n✅ Mänguliselt: tähed, numbrid, kuulamine ja rääkimine\n✅ Esimene tund — proovitund\n\nAlgus: [kuupäev]. Hind: [hind].\nKohti on ainult 5 — kirjuta meile või helista [telefon].' },
        { channel: 'facebook', lang: 'ru', imageNote: 'Та же картинка, что и для ET-поста.', text: '🎒 Подготовка к школе по воскресеньям — KeeleSepp\n\nВаш ребёнок скоро пойдёт в школу? Поможем начать уверенно на эстонском!\n\n✅ Для детей 5–6 лет\n✅ Раз в неделю по воскресеньям в [время]\n✅ Маленькая группа — до 5 детей\n✅ В игре: буквы, цифры, слушаем и говорим по-эстонски\n✅ Первое занятие — пробное\n\nСтарт: [дата]. Стоимость: [цена].\nМест всего 5 — напишите нам или позвоните [телефон].' },
        { channel: 'instagram', lang: 'ru', imageNote: 'Квадрат 1080×1080: крупно «Подготовишка по воскресеньям», 5 мест, 5–6 лет.', text: 'Подготовишка по воскресеньям 🎒\nЭстонский язык и подготовка к школе для детей 5–6 лет.\nГруппа до 5 детей · первое занятие пробное.\nЗапись в директ или по ссылке в профиле ✨\n#эстонскийязык #подготовкакшколе #таллинн #keelesepp' },
        { channel: 'whatsapp', lang: 'ru', imageNote: '', text: 'Здравствуйте! Это школа KeeleSepp 😊 Мы открываем группу подготовки к школе для детей 5–6 лет: по воскресеньям, раз в неделю, до 5 детей в группе — эстонский язык в игре, буквы, цифры, речь. Первое занятие пробное. Старт [дата], стоимость [цена]. Если интересно — ответьте на это сообщение, и мы забронируем место.' },
      ],
    },
  },
  event: {
    label: 'Üritus',
    campaign: { title: 'Uus üritus', kind: 'event', status: 'idea', checklist: ['Kuupäev ja koht', 'Kava', 'Kutse tekst ET + RU', 'Postitused', 'Meeldetuletus päev enne'].map((text) => ({ text, done: false })), posts: [{ channel: 'facebook', lang: 'et', text: '' }, { channel: 'facebook', lang: 'ru', text: '' }] },
  },
  ad: {
    label: 'Reklaamikampaania',
    campaign: { title: 'Uus reklaamikampaania', kind: 'ad', status: 'idea', checklist: ['Sihtrühm', 'Eelarve ja kestus', 'Pilt / video', 'Tekst ET + RU', 'Reklaam käima', 'Tulemuste kontroll'].map((text) => ({ text, done: false })), posts: [{ channel: 'facebook', lang: 'et', text: '' }, { channel: 'instagram', lang: 'ru', text: '' }] },
  },
};
