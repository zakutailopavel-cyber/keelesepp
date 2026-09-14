# Curriculum Document Upload & Preview v1

Status: implemented on `agent/curriculum-document-upload-preview-v1`; awaiting review.

## Teacher flow

In `Õppevara → Õppekavad`, a teacher opens or creates a material and uses the `Failid` section:

1. choose files or drag them into the upload area;
2. see the active filename and upload percentage;
3. save the curriculum material after every upload has completed;
4. click an attached file chip to preview it in the same KeeleSepp window;
5. download the original file when needed.

PDF, JPG, PNG, WEBP, GIF and TXT have an embedded preview. Browsers do not provide a private,
reliable native renderer for Word and PowerPoint, so those formats receive a clear file card and
download action. KeeleSepp does not send private file URLs to an external document viewer.

## Validation and storage

- accepted: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG, WEBP, GIF, TXT;
- limit: less than 20 MB, matching current Storage rules;
- empty, oversized and unsupported files are rejected before upload;
- Storage path remains `curriculum/{timestamp}_{safeFileName}`;
- saved file metadata adds optional `storagePath`; existing `{name,url,size,type}` records remain valid;
- upload stays staff-only and document reads stay authenticated under existing `storage.rules`.

No Firestore schema, Function, rule, index or migration changes are required. Existing curriculum
topics, materials and files are unchanged. Removing a file from an edited material removes its
reference from that material; v1 does not delete an existing Storage object.

## Verification

- `curriculum-document-core.test.js`: safe formats, size validation, preview selection and safe paths;
- `curriculum-document-ui.test.js`: validated uploader and same-page PDF/image preview;
- existing curriculum, roadmap and homework upload regression suites.

## Handoff

The next agent should start from this branch, run the focused tests above, then visually verify a
PDF and image in the authenticated Vercel preview. Do not use a real sensitive student document for
the smoke. A production deploy is not required; merge to main is the release mechanism for these
static files.
