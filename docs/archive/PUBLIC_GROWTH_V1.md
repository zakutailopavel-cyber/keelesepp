# Public growth platform v1

## Goal

Turn `www.epkoolitus.ee` into one traceable path: useful public material -> adaptive level test -> course enquiry -> CRM follow-up.

## Public surfaces

- `/tasemetest/` remains the adaptive Estonian/English diagnostic. It asks 6 starter questions and conditionally expands to 10 or 15; the page must not describe it as a fixed 15-question test.
- `/oppematerjalid/` is the indexable learning-material hub. The first topic pages cover B1 exam preparation, Estonian case forms and workplace Estonian.
- The homepage links to the material hub. All public pages are listed in `sitemap.xml`.

## Lead contract

`websiteLeadApi` accepts the existing registration fields plus:

- `source`: `website-registration` or `level-test`;
- `assessment.diagnosticId` (bounded text);
- `assessment.score` (0-100);
- `assessment.answered` (0-50);
- `assessment.skills.grammar|vocabulary|reading` (0-100).

Unknown properties are not persisted by `normalizeWebsiteLead`. A hidden `website` field remains the honeypot and the per-IP hourly throttle remains in force. The function stores the normalized record in `websiteLeads` and sends the existing notification e-mail.

## CRM workflow

Staff can open `/leads` (`Päringud`) and read `websiteLeads`. They may change only `status`, `contactOwner`, `contactLastAt` and `contactNotes`; public clients cannot read, write or delete the collection. Supported UI statuses are `new`, `contacted`, `converted` and `closed`.

## Release gates

This block changes both hosting and Firebase rules/function code. Merge or Vercel deployment alone is incomplete. Production requires explicit owner approval for:

1. deploying `websiteLeadApi`;
2. deploying Firestore rules;
3. merging the single reviewed PR, which triggers the Vercel builds.

After deployment, verify one non-personal test enquiry end to end: public result confirmation, Firestore record, notification mail and visible CRM queue item.
