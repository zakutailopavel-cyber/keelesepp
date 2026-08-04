# KeeleSepp CRM v2 — передача контекста

Актуально: 4 августа 2026 года, Europe/Tallinn

Репозиторий: `zakutailopavel-cyber/keelesepp`

Рабочая директория: `/Users/pavel/Documents/ep koolitus/keelesepp`

Основная ветка: `main`

Production: https://keelesepp-crm-v2.vercel.app

Firebase project: `keelesepp-5136b`

Этот файл — оперативная точка входа для следующего агента. Подробные постоянные контракты находятся в `ARCHITECTURE.md`, финансовый план — в `FINANCIAL_CORE_ROADMAP.md`, ручной release gate — в `crm-v2/ACCEPTANCE.md`.

## 1. Цель и продуктовая концепция

KeeleSepp CRM v2 заменяет старую CRM по модулям, без одномоментного переписывания и без остановки школы.

Главные правила:

1. Старый `haldus.html` остаётся рабочим rollback-интерфейсом до окончания миграции.
2. Новая CRM — отдельное React/Vite-приложение в `crm-v2/`.
3. Не решать архитектурные проблемы дополнительными слоями CSS. Приоритет: компоненты, маршруты, состояния, сервисы, права, формы, таблицы, Firebase и тестируемая бизнес-логика.
4. Компоненты не обращаются к Firestore напрямую. Все обращения проходят через `crm-v2/src/services/firebase/`.
5. Денежные, аудируемые и другие доверенные изменения выполняются Cloud Functions, а не браузером.
6. Существующие коллекции и legacy-поля сохраняются. Миграция добавляет совместимые поля и стабильные ID, а не переписывает историю.
7. Интерфейс CRM — на эстонском языке; рабочее обсуждение с владельцем проекта — на русском.
8. `Live Classroom` сейчас не делать. Владелец явно решил оставить его последним блоком.
9. Тарифный модуль сейчас не нужен. Цена урока задаётся на карточке/финансовом плане ученика.
10. Не считать демоданные интеграцией. Production-модули должны работать с реальным Firebase и иметь loading/empty/error состояния.

Целевая финансовая цепочка:

```text
проведённый урок
  → оплачиваемая позиция
  → счёт
  → платёж / банковская операция
  → распределение платежа
  → аванс или долг
  → зарплата преподавателя и расходы школы
  → закрытие периода
  → бухгалтерский экспорт и аналитика
```

Каждая финансовая мутация должна быть аутентифицирована, транзакционна, идемпотентна при повторе и отражена в неизменяемом аудите.

## 2. Текущее техническое устройство

### CRM v2

- `crm-v2/src/app/` — провайдеры, AuthContext, маршруты и навигация.
- `crm-v2/src/components/ui/` — переиспользуемые кнопки, поля, модальные окна и состояния.
- `crm-v2/src/components/layout/` — адаптивный authenticated shell.
- `crm-v2/src/features/` — самостоятельные функциональные модули.
- `crm-v2/src/services/firebase/` — единственный клиентский Firebase-слой.
- `crm-v2/src/hooks/` — общие React hooks.
- `crm-v2/src/utils/` — роли, privacy, teacher identity и ошибки.
- `crm-v2/src/styles/` — общие токены и responsive-стили.

Стек: Vite, React, React Router, Lucide React, Firebase modular SDK, Vitest, Testing Library, ESLint.

### Доверенный backend

- `functions/index.js` — HTTP/trigger/scheduled Cloud Functions.
- `functions/finance-core.js` — чистая финансовая бизнес-логика.
- `functions/staff-operations-core.js` — рабочее время, ставки и payroll-расчёты.
- `firestore.rules` и `storage.rules` — серверные границы доступа.

### Аутентификация и роли

- `admin` — полное администрирование.
- `teacher` — данные только своего UID-scope.
- `finance` — финансовые маршруты без управления учениками.
- `student` и `parent` — свои кабинеты и явно привязанные данные.

Источники прав: доверенная роль профиля и signed custom claims. Клиентские флаги вроде `isAdmin` права не дают.

## 3. Что уже перенесено и работает

### Основа приложения

- современный sidebar/topbar, глобальный поиск и мобильное меню;
- защищённые маршруты и role-based guards;
- Firebase Auth и восстановление пользовательской сессии;
- конфигурационные, loading, empty и recoverable error states;
- production deployment из корня `crm-v2/` на Vercel.

### Dashboard и кабинеты

- dashboard на реальных данных с ближайшими уроками и attention queue;
- кабинет преподавателя с UID-scoped данными;
- кабинет ученика с прогрессом, уроками, домашними заданиями, счетами и сообщениями;
- кабинет родителя только по явно принадлежащим ему ученикам.

### Ученики и преподаватели

- список, поиск, фильтры, desktop/mobile views и карточка ученика;
- создание, редактирование, назначение преподавателя и недеструктивный архив;
- защита от дублей;
- teacher UID directory и нормализация вариантов имён преподавателей;
- production backfill teacher UID завершён; два действительно неназначенных ученика остаются admin-only;
- страница преподавателей с нагрузкой и количеством учеников.

### Календарь и группы

- month/week/day календарь;
- создание и редактирование занятий, проверка конфликтов и отмена;
- индивидуальные и групповые уроки;
- управление группами, участниками и шаблонами расписания;
- отметка посещаемости создаёт детерминированные lesson records и не допускает тихого двойного выставления счёта;
- Google Calendar sync имеет отдельный server-owned контракт, но финальный строгий production smoke test ещё нужен.

### Родители

- каталог родителей, контакты, статусы, заметки, follow-up и задолженность;
- teacher-scoped видимость;
- review новых регистраций;
- безопасное объединение точных email-дублей без удаления Firebase Auth аккаунтов;
- связь одного родителя с несколькими детьми;
- опубликована кнопка `Lisa laps`;
- менеджер показывает уже привязанных детей;
- можно добавить существующего ученика или создать новую карточку ребёнка с произвольным именем;
- после добавления окно остаётся открытым, поэтому можно последовательно добавить несколько детей;
- карточка родителя сразу показывает всех детей и их количество.

### Учебные материалы и домашние задания

- единая библиотека `curriculumLessons` + `exercises`;
- папки предмет → уровень/возраст → программа/тема;
- поиск и фильтры;
- создание и редактирование legacy-compatible материалов;
- полный набор worksheet-блоков;
- интерактивные упражнения: fill, choice, writing, word order, matching, reading и translation;
- загрузка PDF/изображений в Firebase Storage;
- просмотр материала и PDF/изображений по `Eelvaade` без обязательного скачивания;
- назначение одному ученику или всей группе;
- домашние задания, completion/review, вложения и resilient assignment snapshot;
- сообщения, unread/read state и teacher/owner scope.

### Настройки

- редактирование текущего имени и телефона;
- email, UID и роли read-only;
- password reset для текущего аккаунта.

### Финансы и учёт уроков

- сумма за урок и количество уроков в неделю на ученика;
- недельный, средний месячный и годовой прогноз дохода;
- проведённые и ещё не выставленные уроки;
- создание счёта из выбранных immutable lesson lines;
- отсутствие/поздняя отмена с явным billing disposition;
- счета, остатки, частичные оплаты и просрочка;
- PDF, отправка счёта и напоминания;
- кредит-ноты с неизменяемой историей;
- банковский CSV import, автоматическое сопоставление и idempotent external IDs;
- распределение одной банковской операции, частичная оплата и остаток в аванс;
- авансы ученика, использование на счёте и возврат;
- отмена ошибочного платежа с восстановлением источника;
- immutable financial audit;
- месячная сверка lessons/invoices/payments/bank/credits;
- Excel-friendly CSV отчёт;
- проверка и repair дублированной нумерации счетов;
- production-нумерация сейчас уникальна; после repair уже создан и виден счёт `KS-2026-046`;
- исправленные счета различают `Saada uuesti`, `Uuesti saadetud` и `Saatmine polnud vajalik`;
- строки ошибок месячной сверки теперь показывают имя ученика/группы, дату, время и преподавателя; Firebase ID оставлен только вторичной технической деталью.

## 4. Последнее опубликованное изменение

Коммит: `fa80172 feat: support multiple parent children and readable finance issues`

В нём:

- `Lisa laps` и multi-child flow на странице родителей;
- список уже связанных детей внутри modal;
- добавление существующей карточки без закрытия modal;
- создание нового ребёнка из карточки любого родителя;
- свободный ввод имени ребёнка вместо ограничения только именами регистрации;
- readable identity для financial-period issues;
- structured identity fields в `finance-core`;
- имя/дата/преподаватель в интерфейсе и CSV;
- новые component/unit tests.

Публикация проверена:

- GitHub `main` содержит `fa80172`;
- Vercel production отдаёт новый bundle;
- Firebase Functions успешно задеплоены 04.08.2026;
- production `/parents`: modal `Lisa laps: …` показывает текущих детей и кнопку `Loo uus lapse kaart`;
- production `/finance`: июльская сверка показывает понятные строки вроде имени/группы, даты и преподавателя, а ID — ниже;
- production-проверка была read-only, детей и финансовые данные не изменяли.

Последняя полная проверка:

```text
CRM v2: 53 test files, 217 tests passed
Functions: 83 tests passed
ESLint: passed
Vite production build: passed
git diff --check: passed
```

## 5. Незавершённая локальная работа — не потерять

В рабочем дереве есть отдельный, ещё не закоммиченный payroll-блок. Он намеренно не был смешан с коммитом родителей/финансовой читаемости.

Изменённые/новые файлы этого блока:

- `crm-v2/.env.example`
- `crm-v2/src/app/routes.jsx`
- `crm-v2/src/features/finance/FinancePage.jsx`
- `crm-v2/src/services/firebase/workTime.js`
- `crm-v2/src/features/payroll/PayrollPage.jsx`
- `crm-v2/src/features/payroll/payroll.js`
- `crm-v2/src/features/payroll/payroll.css`
- `crm-v2/src/features/payroll/payroll.test.js`

Задуманный scope payroll-блока:

- admin-route `/finance/payroll`;
- ссылка из финансового workspace;
- просмотр всех work sessions за месяц;
- ставка сотрудника;
- расчёт часов и суммы в центах;
- approve/reject/adjust через trusted `staffOperationsApi`;
- immutable audit и snapshot ставки при утверждении;
- переменная `VITE_STAFF_OPERATIONS_API_URL`.

До последнего опубликованного изменения targeted payroll tests, workTime tests, Finance tests, lint и build проходили. Перед публикацией payroll всё равно нужно повторить полный набор тестов и визуальную production-проверку.

### Пользовательские файлы, которые нельзя случайно коммитить

В рабочем дереве лежат неотслеживаемые копии с суффиксом ` 2`. Считать их пользовательскими и не добавлять в git без отдельного решения:

- `crm-v2/README 2.md`
- `crm-v2/src/features/finance/FinancePage 2.jsx`
- `crm-v2/src/features/homework/HomeworkPage 2.jsx`
- `crm-v2/src/features/messages/MessagesPage 2.jsx`
- `crm-v2/src/features/teachers/TeachersPage 2.jsx`

Не использовать `git add .` в грязном дереве. Добавлять только точный список файлов.

## 6. Что осталось — приоритетный порядок

### P0. Закончить payroll

1. Проверить контракт UI ↔ `staffOperationsApi`.
2. Проверить admin-only маршрут и отсутствие payroll у teacher/finance/student/parent.
3. Проверить ставки, approve/reject/adjust, повторный запрос и audit.
4. Убедиться, что прошлые утверждённые выплаты не меняются после новой ставки.
5. Полные тесты, сборка, production smoke test.

### P1. Расходы и поставщики

- категории расходов;
- поставщик и supplier invoice;
- дата, сумма, VAT metadata;
- чек/документ в Storage;
- recurring costs;
- исправление/void только через audit, без удаления истории.

### P1. Настоящее закрытие периода

Текущая месячная сверка — reviewed snapshot, а не жёсткий бухгалтерский lock.

Нужно:

- checklist payroll + expenses + invoices + payments + bank;
- lock месяца;
- dated correction entries после lock;
- opening/closing balances;
- архив evidence/export;
- запрет обычных мутаций закрытого периода на сервере.

### P1. Бухгалтерский экспорт

- invoice register;
- payment/bank register;
- lesson-to-invoice evidence;
- advances/refunds;
- payroll;
- expenses/VAT;
- attachments/evidence manifest;
- стабильные ID и UTF-8 CSV/XLSX либо согласованный API.

### P2. Финансовая аналитика

- cash flow;
- aged debt;
- выручка по предмету/курсу/группе;
- маржа после payroll и расходов;
- forecast vs actual;
- drill-down к исходным операциям.

### P2. Teacher-scope release gate

- ручной smoke test отдельными admin/teacher/student/parent/finance аккаунтами;
- проверить прямые URL и отсутствие чужих данных;
- после успешного теста включить строгий teacher read enforcement;
- сохранить и проверить rollback endpoint.

### P2. Финальный UX/качество

- 390 px, 768 px и desktop;
- keyboard/Escape/focus return;
- отсутствие horizontal overflow;
- понятные empty/error states;
- проверить console errors;
- обновить `crm-v2/ACCEPTANCE.md` фактическими результатами.

### Последним: Live Classroom

Не начинать без нового явного указания владельца. Текущие legacy-файлы и архитектурные контракты Live Classroom не удалять.

## 7. Не делать

- Не ломать и не удалять `haldus.html`.
- Не переносить остаток одним огромным PR/коммитом.
- Не копировать TailAdmin как готовый шаблон.
- Не выдавать статические данные за Firebase-интеграцию.
- Не вводить тарифный модуль: владелец сказал, что тарифы не нужны.
- Не начинать Live Classroom сейчас.
- Не удалять финансовые записи для «исправления»; использовать void/correction/audit.
- Не угадывать родителя, ученика или преподавателя по похожему имени, если есть/нужен стабильный ID.
- Не включать strict teacher reads до role-based smoke test.
- Не коммитить пользовательские `* 2.*` файлы.

## 8. Обычный цикл проверки и публикации

Из `crm-v2/`:

```bash
npm test
npm run lint
npm run build
```

Из корня репозитория:

```bash
npm --prefix functions test
git diff --check
git status --short
```

Firebase Functions:

```bash
npx firebase-tools deploy --only functions --project keelesepp-5136b --non-interactive
```

После push дождаться нового Vercel bundle и проверить production в авторизованной сессии. Для финансовых smoke checks сначала использовать только preview/read-only действия. Любую тестовую запись делать только на явно тестовых данных.

## 9. Текущие технические предупреждения

- Firebase deploy сообщает, что версия `firebase-functions` устарела. Обновление нужно делать отдельным контролируемым изменением с полным тестом, а не попутно.
- Trigger `syncScheduleToGoogle` и функция расположены в разных регионах (`europe-west3` trigger / `us-central1` function). Это создаёт потенциальные cross-region hops; перенос региона требует отдельного плана.
- Firebase client bundle остаётся самым большим build chunk.
- React Router закреплён на версии, выбранной с учётом известных advisory; не менять вслепую.

## 10. Как продолжить новому агенту

1. Прочитать этот файл полностью.
2. Выполнить `git status --short` и сохранить все пользовательские изменения.
3. Прочитать `ARCHITECTURE.md`, `FINANCIAL_CORE_ROADMAP.md` и нужный раздел `crm-v2/ACCEPTANCE.md`.
4. Не трогать Live Classroom и тарифы.
5. Начать с аудита незакоммиченного payroll-блока.
6. Довести один блок до тестов, production и записи в этот handoff-файл.
7. После каждого крупного релиза обновлять разделы 4–6 и новый HEAD-коммит.
