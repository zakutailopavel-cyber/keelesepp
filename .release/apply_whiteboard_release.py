from pathlib import Path
import base64
import gzip
import hashlib

ROOT = Path(__file__).resolve().parents[1]


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


# Reconstruct the already-audited whiteboard byte-for-byte.
payload = ''.join((ROOT / '.release' / f'wb.part{i}').read_text().strip() for i in (1, 2, 3))
whiteboard = ROOT / 'haldus-whiteboard' / 'index.html'
whiteboard.parent.mkdir(parents=True, exist_ok=True)
whiteboard.write_bytes(gzip.decompress(base64.b64decode(payload)))
assert sha256(whiteboard) == '99336fa506d9ae506a1129fe95c2b343c34a8cb542c34473ac66fadf5d91e11c', 'whiteboard payload checksum mismatch'

# Patch haldus.html only at the two audited integration points.
haldus = ROOT / 'haldus.html'
text = haldus.read_text(encoding='utf-8')

skillmap = """              <button onClick={()=>window.open('/haldus-skillmap/?student='+currentStu.id,'_blank')}
  className=\"btn btn-sm\"
  style={{background:'rgba(14,116,144,.12)',color:'#0e7490',border:'1px solid rgba(14,116,144,.2)'}}>
  🗺 Oskuste kaart
</button>"""
whiteboard_button = """              <button onClick={()=>window.open('/haldus-whiteboard/?student='+currentStu.id,'_blank')}
  className=\"btn btn-sm\"
  style={{background:'rgba(201,136,42,.12)',color:'#A96E1A',border:'1px solid rgba(201,136,42,.2)'}}>
  🖊 Ava tahvel
</button>"""
if "/haldus-whiteboard/?student=" not in text:
    assert text.count(skillmap) == 1, 'haldus skillmap anchor changed'
    text = text.replace(skillmap, skillmap + '\n' + whiteboard_button, 1)

live_nav = "    {id:'live_classroom',icon:'fa-display',label:'Live Classroom',isExternal:true,href:'/live-classroom/'},"
whiteboard_nav = "    {id:'whiteboard',icon:'fa-note-sticky',label:'Tahvel',isExternal:true,href:'/haldus-whiteboard/'},"
if whiteboard_nav not in text:
    assert text.count(live_nav) == 1, 'haldus nav anchor changed'
    text = text.replace(live_nav, live_nav + '\n' + whiteboard_nav, 1)

haldus.write_text(text, encoding='utf-8')
assert sha256(haldus) == '82c67034f5c1504826ae67944699b617c2a22016c39ef8d31c2add534290dbb6', 'haldus final checksum does not match audited upload'

# Insert only the audited whiteboard security block into current Firestore rules.
rules = ROOT / 'firestore.rules'
rules_text = rules.read_text(encoding='utf-8')
rules_block = r'''    // One persistent canvas per student. Admin always has access. A teacher
    // may open a board only for a student they own (same teacherUid scoping
    // rule used everywhere else once the migration flag is enforced, with
    // the same permissive name-matching fallback during migration). The
    // linked student/parent can always reach their own board.
    //
    // Each drawn object is its OWN document in the elements subcollection —
    // whiteboards/{studentId}/elements/{elementId} — so two people editing
    // different objects at once can never overwrite each other; only two
    // simultaneous edits to the SAME object fall back to Firestore's normal
    // last-write-wins, which is the deliberately simple model here (no CRDT).
    function whiteboardAccessAllowed(studentId) {
      return isAdmin()
        || (isTeacher() && exists(studentPath(studentId)) && teacherCanRead(studentDoc(studentId)))
        || ownsStudent(studentId);
    }

    // Firestore rules cannot cheaply validate every point in a stroke's
    // point list, so this caps the point count and overall shape of each
    // element type; per-point numeric shape is left to the client plus
    // Firestore's own per-document size ceiling.
    function validWhiteboardElement(data) {
      return data is map
        && data.keys().hasAll(['type', 'updatedByUid'])
        && data.updatedByUid == uid()
        && data.type in ['stroke', 'shape', 'text', 'note']
        && (
          data.type != 'stroke'
          || (
            data.keys().hasOnly(['type', 'points', 'color', 'strokeWidth', 'updatedAt', 'updatedByUid', 'updatedByName', 'lastClientId', 'revision'])
            && data.points is list
            && data.points.size() > 0
            && data.points.size() <= 800
            && data.color is string
            && data.strokeWidth is number
            && data.strokeWidth > 0
            && data.strokeWidth <= 40
          )
        )
        && (
          data.type != 'shape'
          || (
            data.keys().hasOnly(['type', 'shape', 'x', 'y', 'w', 'h', 'color', 'strokeWidth', 'updatedAt', 'updatedByUid', 'updatedByName', 'lastClientId', 'revision'])
            && data.shape in ['rect', 'ellipse', 'line', 'arrow']
            && data.x is number && data.y is number
            && data.w is number && data.h is number
            && data.color is string
            && data.strokeWidth is number
            && data.strokeWidth > 0
            && data.strokeWidth <= 40
          )
        )
        && (
          data.type != 'text'
          || (
            data.keys().hasOnly(['type', 'x', 'y', 'w', 'h', 'text', 'color', 'fontSize', 'updatedAt', 'updatedByUid', 'updatedByName', 'lastClientId', 'revision'])
            && data.x is number && data.y is number
            && data.w is number && data.h is number
            && data.text is string
            && data.text.size() <= 4000
            && data.color is string
            && data.fontSize is number
            && data.fontSize > 0
            && data.fontSize <= 96
          )
        )
        && (
          data.type != 'note'
          || (
            data.keys().hasOnly(['type', 'x', 'y', 'w', 'h', 'text', 'color', 'updatedAt', 'updatedByUid', 'updatedByName', 'lastClientId', 'revision'])
            && data.x is number && data.y is number
            && data.w is number && data.h is number
            && data.text is string
            && data.text.size() <= 2000
            && data.color is string
          )
        );
    }

    match /whiteboards/{studentId} {
      // The parent document holds board metadata (schemaVersion, updatedAt)
      // and, only for boards created before the element-subcollection
      // migration, a legacy `elements` array kept around for one-time,
      // idempotent migration on first open — not deleted automatically.
      allow read: if whiteboardAccessAllowed(studentId);
      allow create, update: if whiteboardAccessAllowed(studentId)
        && request.resource.data.updatedByUid == uid()
        && request.resource.data.keys().hasOnly([
          'schemaVersion', 'updatedAt', 'updatedByUid', 'updatedByName', 'lastClientId', 'elements'
        ])
        && (
          !('elements' in request.resource.data)
          || (request.resource.data.elements is list && request.resource.data.elements.size() <= 800)
        );
      allow delete: if isAdmin();

      match /elements/{elementId} {
        allow read: if whiteboardAccessAllowed(studentId);
        allow create, update: if whiteboardAccessAllowed(studentId) && validWhiteboardElement(request.resource.data);
        allow delete: if whiteboardAccessAllowed(studentId);
      }
    }

'''
if 'function whiteboardAccessAllowed(studentId)' not in rules_text:
    anchor = '    match /oauthStates/{stateId} {'
    assert rules_text.count(anchor) == 1, 'firestore oauthStates anchor changed'
    rules_text = rules_text.replace(anchor, rules_block + anchor, 1)
rules.write_text(rules_text, encoding='utf-8')
assert sha256(rules) == '59a4028081825a0ebb1e47f4cf5dc2e1f8a74f64880147025583d0044f57db82', 'firestore.rules final checksum does not match audited upload'

print('release files reconstructed and checksums verified')
