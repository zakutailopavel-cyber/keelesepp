# LHV Paytech LinkPay — taotlus tootmiskeskkonna aktiveerimiseks

**Staatus:** kiri on ette valmistatud, **saatmata**. Tootmiskeskkonda ega maksete seadeid ei ole selle ülesande käigus muudetud.  
**Koostatud:** 2026-10-12

## Saadetav kiri (eesti keeles)

**Saaja:** makselahendused@lhv.ee  
**Teema:** LinkPay tootmiskeskkonna aktiveerimise taotlus – E&P Koolitus OÜ

Tere!

Pöördun Teie poole E&P Koolitus OÜ (registrikood **17270880**) nimel. Tegutseme kaubamärgi **KeeleSepp** all ning pakume eesti ja inglise keele õpet, sealhulgas individuaalõpet ja eksamiteks ettevalmistust. Soovime võtta LHV Paytechi LinkPay lahenduse kasutusele päris maksete vastuvõtmiseks meie klientidelt.

Oleme LHV Paytechi testkeskkonnas (**merchant.sandbox.lhv.ee**) LinkPay lahenduse seadistanud ja oma CRM-süsteemiga ühendanud. Meie süsteem (**crm.epkoolitus.ee**) koostab iga tasumisele kuuluva arve jaoks HMAC-SHA256 abil allkirjastatud eeltäidetud makselingi. Lingil on arve tasumata summa, arve number, maksja nimi ja e-posti aadress ning unikaalne tellimuse viide. Maksja ei saa neid andmeid makselehel muuta. Link on kättesaadav arve PDF-ist, arvega saadetavast e-kirjast või kliendi kontolt CRM-is.

Testkeskkonnas oleme kontrollinud eri summade ja arveandmetega allkirjastatud linke ning teinud **ühe eduka pangalingi testmakse**. Testis toimisid makselehelt tagasisuunamine ja makseteavitus. Makse staatust kontrollib meie server LHV Paytechi API kaudu makse viite alusel; arve märgitakse tasutuks alles pärast kinnitatud makse kontrollimist. Korduv teavitus ei registreeri sama laekumist teist korda. Kaardimakseid ei ole me eraldi edukate tehingutena testinud.

Palume Teilt järgmist:

1. Selgitada, millised sammud on vajalikud LinkPay **tootmiskeskkonna** aktiveerimiseks E&P Koolitus OÜ-le, sealhulgas **Visa/Mastercardi kaardimaksete** ning **Eesti pankade pangalinkide** kasutamiseks.
2. Võimaldada juurdepääs tootmiskeskkonna kaupmeheportaalile (**https://merchant.lhv.ee**) pärast vajalike tingimuste täitmist.
3. Kinnitada tootmiskeskkonna LinkPay makselinkide baas-aadress ja API aadress ning testkeskkonna API aadress. Meie senised eeldused on vastavalt **https://payment.lhv.ee/lp**, **https://payment.lhv.ee/api/v4** ja **https://payment.sandbox.lhv.ee/api/v4**; palume vajaduse korral need parandada.
4. Edastada lepingu tingimused ja hinnakiri, sh kaardimaksete ja pangalinkide teenustasud, võimalikud kuutasud, väljamaksete sagedus ning tagasimaksete ja vaidlustatud tehingute tasud.
5. Anda teada, kas vajate meilt täiendavaid dokumente, veebilehe täiendusi, maksetingimusi või muid andmeid. Vajaduse korral saame eraldi esitada ka prognoosi igakuiste tehingute arvu ja keskmise maksesumma kohta.

**Ettevõtte andmed**

- Ärinimi: E&P Koolitus OÜ
- Registrikood: **17270880**
- Kaubamärk: KeeleSepp
- Veebileht: https://www.epkoolitus.ee
- CRM ja kliendiportaal: https://crm.epkoolitus.ee
- Tegevus: eesti ja inglise keele õpe, individuaaltunnid ja eksamiteks ettevalmistus
- Kontaktisik: Pavel Zakutailo
- Telefon: **+372 5374 0753**
- E-post: zakutailo.pavel@gmail.com

Täname Teid ette abi eest ja jääme ootama vastust!

Lugupidamisega

Pavel Zakutailo  
E&P Koolitus OÜ

---

## Краткий перевод для владельца (не отправлять в LHV)

**Тема:** Запрос на подключение LinkPay в рабочей среде для E&P Koolitus OÜ.

Здравствуйте! Я представляю языковую школу KeeleSepp (E&P Koolitus OÜ, рег. код 17270880). Мы хотим принимать реальные платежи за обучение через банковские ссылки и карты Visa/Mastercard.

Мы уже настроили LinkPay в тестовой среде и подключили его к CRM. Система создаёт для каждого счёта подписанную ссылку с точной суммой, номером счёта и данными плательщика. Проверены ссылки с разными суммами, а также **один успешный тестовый платёж через банк**: возврат, уведомление, проверка банковского статуса и защита от повторного зачисления. **Успешный карточный платёж пока не подтверждён тестом.**

Просим LHV объяснить порядок активации рабочего режима, открыть доступ к рабочему кабинету, подтвердить адреса платёжных сервисов, сообщить тарифы и условия договора, а также перечислить необходимые документы и требования к сайту. По запросу предоставим прогноз числа транзакций и среднего платежа.

Контакт: Pavel Zakutailo, +372 5374 0753, zakutailo.pavel@gmail.com. **Письмо не отправлено.**

---

## Kontrollitud andmed ja piirangud (ei kuulu saadetava kirja teksti)

- **Ärinimi ja registrikood:** E&P Koolitus OÜ, 17270880; varasem ettevõtte teave, lisaks avalik äriregistri koondinfo: https://www.inforegister.ee/17270880-E-P-KOOLITUS-OU/.
- **Kaubamärk, tegevus, veebileht ja CRM-i aadress:** https://www.epkoolitus.ee (avalik veebileht viitab CRM-ile aadressil crm.epkoolitus.ee); samuti projekti \`docs/LINKPAY_INTEGRATION.md\`.
- **Kontakttelefon:** +372 5374 0753 (omaniku varem antud isiklik kontakttelefon). Avalikul veebilehel on ettevõtte üldtelefonina **+372 5434 4155**; vajaduse korral otsustab omanik enne saatmist, millist numbrit eelistada.
- **Testi tegelik ulatus:** \`docs/LINKPAY_INTEGRATION.md\` ja \`docs/PROJECT_STATE.md\`, sissekanded 2026-10-12. Edukas oli **üks pangalingi testmakse**; kaardimakse edukust ei ole nende allikatega kinnitatud. Testkeskkonna makselahendus on klientide jaoks välja lülitatud.
- **Arvete maht ja keskmine summa:** selle ülesande käigus puudus autoriseeritud lugemisühendus tootmise Firestore'i kollektsiooniga \`invoices\`. Neid **ei olnud võimalik arvutada ega sõltumatult kinnitada**, seepärast pole väljamõeldud arvearvu ega summat kirja lisatud. Kui lugemisühendus muutub kättesaadavaks, arvuta näiteks kolme viimase täiskuu **2026-07-01 kuni 2026-09-30** kohta: arvesta iga arve üks kord, jäta välja \`status === 'Tühistatud'\`, loenda arved ning arvuta \`amountCents\` (või \`amount\`) põhjal aritmeetiline keskmine. **Arveid kuus = sobivate arvete arv / 3**. Arvuta statistika ainult lugemisrežiimis ning lisa numbrid kirja alles pärast kinnitamist.
- **Konfidentsiaalsus:** ei sisalda API kasutajanime, API saladust, makselingi tokenit ega muid võtmeid. Töö ei hõlmanud makse saatmist, e-kirja saatmist, Firestore'i kirjutamist ega tootmiskeskkonna aktiveerimist.
