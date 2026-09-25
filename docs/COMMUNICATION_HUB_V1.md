# Communication Hub v1

## Goal

CRM v2 evolves the existing student-linked `messages` workflow into one channel-neutral communication surface.
The compatibility-first foundation is extended by a server-only Meta adapter. The adapter is not active until its
Firebase Function secrets are configured, the function is deployed, and the callback is verified in Meta.

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

The internal composer continues to use the legacy-compatible Firestore writer. Administrators can reply to Facebook
and Instagram conversations only through the authenticated `metaMessagingApi/reply` endpoint. Teachers and parents
cannot send through the external adapter. The UI never routes an external reply through the internal student writer.

## Firebase boundary

`crm-v2/src/services/firebase/messages.js` remains the browser access layer. Existing `messages` records stay
compatible. Inbound Meta events and outbound Meta replies are persisted by Firebase Admin in the same collection;
no migration, new collection, Firestore index, or rules change is required.

## Meta adapter

`metaMessagingApi` provides:

- `GET /webhook` — Meta challenge verification using `META_VERIFY_TOKEN`;
- `POST /webhook` — HMAC-SHA256 validation using `META_APP_SECRET`, followed by idempotent ingest;
- `POST /reply` — administrator-authenticated send through Meta Graph API using `META_PAGE_ACCESS_TOKEN`.

Inbound document IDs are a deterministic SHA-256 projection of channel plus Meta message ID. Meta retries therefore
cannot duplicate messages. Provider secrets are Firebase Function secrets and are never returned to CRM v2.

The connected assets are Facebook Page `571647362697524` (`KeeleSepp - õpi meiega.`) and Instagram account
`17841474277841669` (`keelesepp`). Access is restricted to those current assets, not future pages/accounts.

## Verification

Required before merge:

- focused CRM v2 message model/service/UI tests;
- focused Meta signature, webhook projection, idempotency-key and reply validation tests;
- lint and production build;
- test proving conversation identity is unchanged when input array order changes;
- test proving an external conversation uses the Meta API path and cannot use the internal send path;
- no production deploy or webhook activation before owner approval.
