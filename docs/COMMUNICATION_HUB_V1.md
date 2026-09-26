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
- `POST /reply` — administrator-authenticated send through the channel-specific Meta Send API.

Before any outbound call, the server verifies that the requested channel, conversation ID and recipient match an
existing inbound Meta message created by the signed webhook. A browser-supplied recipient ID is therefore not enough
to send a message.

Facebook replies use `https://graph.facebook.com/<version>/<page-id>/messages` with
`META_PAGE_ACCESS_TOKEN`. Instagram replies use
`https://graph.facebook.com/<version>/<instagram-account-id>/messages` with
`META_INSTAGRAM_ACCESS_TOKEN`. The default API version is `v26.0` and can be overridden with
`META_GRAPH_VERSION`. The known sender assets are pinned to Facebook Page `571647362697524` and Instagram
account `17841474277841669`; optional non-secret env overrides are `META_FACEBOOK_PAGE_ID` and
`META_INSTAGRAM_ACCOUNT_ID`.

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
- test proving outbound replies fail closed when the recipient is not bound to the signed inbound conversation;
- test proving Facebook and Instagram use their own sender endpoint/token contract;
- no production deploy or webhook activation before owner approval.

## Production activation gate

After owner merge and explicit deployment approval, configure these Firebase Function secrets:

- `META_VERIFY_TOKEN`;
- `META_APP_SECRET`;
- `META_PAGE_ACCESS_TOKEN`;
- `META_INSTAGRAM_ACCESS_TOKEN`.

Then deploy only `metaMessagingApi`, verify `GET /webhook` with the Meta challenge, configure the callback and
message subscriptions in Meta, and run one inbound + outbound smoke test for Facebook and one for Instagram.
No production Firestore migration or rules/index deployment is required for this workstream.
