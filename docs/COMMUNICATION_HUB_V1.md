# Communication Hub v1 foundation

## Goal

CRM v2 evolves the existing student-linked `messages` workflow into one channel-neutral communication surface.
The first slice is deliberately compatibility-first: it does not connect Meta, create webhooks, store access tokens,
or send any external message.

## Identity contract

Conversation and message identity must never depend on array position, current sort order, or a React render index.

Each normalized message may carry:

- `id` — immutable Firestore document/message identity;
- `channel` — `internal`, `facebook`, or `instagram`;
- `conversationId` — preferred stable conversation key when the source supplies one;
- `externalThreadId` — source thread identity for future Meta adapters;
- `externalMessageId` — source message identity for idempotent ingest;
- `externalSenderId` and `externalSenderName` — source contact projection;
- `studentId` — optional exact KeeleSepp student link.

For legacy internal records, `studentId` remains the durable conversation identity. The model adds compatible
fields on new internal messages without rewriting historical records.

External fallback identities are channel-qualified. A Facebook and Instagram thread with the same source ID must
therefore remain distinct conversations.

## UI boundary

`crm-v2/src/features/messages/` owns the channel-neutral conversation projection. Sorting changes presentation only;
selection and React keys use stable conversation/message IDs.

The current internal composer remains enabled only for `internal` conversations. A projected Facebook or Instagram
conversation is read-only until the trusted server adapter exists. The UI must fail closed rather than accidentally
calling the internal student-message writer for an external thread.

## Firebase boundary

`crm-v2/src/services/firebase/messages.js` remains the only browser Firebase access layer for this feature.
Existing `messages` records stay compatible. This slice introduces no new collection, Firestore index, rules change,
migration, production write, or external API call.

## Planned Meta adapter

A later bounded slice may add trusted server-side Meta webhook verification, idempotent inbound ingest, account/page
mapping and outbound replies. Secrets/tokens must remain server-side. The adapter must translate Meta payloads into
this stable channel contract and must not expose raw credentials to CRM v2.

## Verification

Required before merge:

- focused CRM v2 message model/service/UI tests;
- lint and production build;
- test proving conversation identity is unchanged when input array order changes;
- test proving an external conversation cannot use the internal send path;
- no production deployment or Meta API call.
