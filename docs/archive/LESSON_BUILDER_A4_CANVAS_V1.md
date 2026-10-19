# Lesson Builder A4 Canvas v1

## Purpose

A teacher prepares the digital student task and the printable worksheet in one Lesson Builder. A4 mode is a
second visual projection of the same normalized lesson; it does not copy the lesson or create another content
system.

## Teacher flow

1. Create or open a lesson in Lesson Builder.
2. Select **A4 tööleht** in the existing header.
3. Add a ready block from the left library or select an existing lesson block.
4. Edit task text directly on the paper.
5. Choose full width, two thirds, half or one third. Drag a block to a new insertion point or page.
6. Toggle answers for a teacher key and use **Prindi / PDF** for the browser print dialog.
7. Return to the editor and save the same local or cloud draft.

## Contract

Lesson-level optional metadata:

```json
{"authoring":{"a4":{"pageCount":2,"answers":false,"studentName":"","date":"14.09.2026"}}}
```

Per-activity optional metadata, keyed by the existing immutable activity ID:

```json
{"authoring":{"activities":{"act-stable":{"a4":{"page":1,"span":8,"order":0}}}}}
```

`span` is one of `12`, `8`, `6`, `4`. `page` is 1–30 in the persisted contract. `order` controls only A4
presentation order. The canonical `activities` array and every activity ID remain unchanged, so resume,
responses and evidence keep the same identity.

Old drafts normalize deterministically to page 1, full width, in lesson order. A4 metadata is validated by the
browser contract and the exact server-side contract copy used by Cloud Draft Library.

## Boundaries

The slice uses browser Print/PDF and existing HTTPS image assets. It does not add freeform pixel positioning,
image upload, PDF generation on the server, new Firebase collections, student writes or production deployment.
A later visual pass can add true row-height resizing and richer worksheet-specific block rendering without
changing this persisted contract.
