# Lesson Builder Image Block v1

## Result

An authored activity may contain up to five student-visible image assets. The first UI slice edits
one image per activity. The normalized activity ID and route identity remain unchanged.

```json
{
  "assets": [{
    "id": "asset-stable-id",
    "type": "image",
    "url": "https://example.com/image.jpg",
    "alt": "Required description for the student",
    "caption": "Optional caption"
  }]
}
```

Rules:

- `id` is stable across URL, text, route and ordering edits;
- `type` is exactly `image`;
- `url` is HTTPS and at most 2000 characters;
- `alt` is required and at most 300 characters;
- `caption` is optional and at most 500 characters;
- unknown fields, duplicate IDs and more than five assets are rejected;
- student projection uses an explicit allowlist and excludes teacher/evaluation metadata.

Builder preview and the assigned student runner render the same safe projection with DOM APIs.
Preview remains local and creates no assignment, answer, evidence or LearningSession write.

## Compatibility and operations

Assets remain optional. Existing JS lessons, cloud drafts, immutable versions, assignments,
responses, evidence, resume and activity IDs require no migration. This slice does not add
Firebase Storage or direct Firestore access.

`lessonDraftsApi` must eventually receive the stricter publication validator and
`interactiveLessonApi` must receive the asset projection before genuine production use. No
Firebase deployment is included in this branch; it requires explicit owner permission after merge.

## Known limitations

- v1 accepts an external HTTPS URL; it does not upload or proxy media;
- broken or access-controlled external images may fail to load;
- the Builder UI edits one image although the contract reserves up to five;
- image crop, focal point, resizing, gallery search and asset ownership belong to a later Media &
  Asset Library workstream.
