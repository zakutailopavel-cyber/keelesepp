import { CheckCircle2, ChevronDown, Database, Save, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card } from '../../../components/ui/index.js';
import { validateGeneratorProfile } from '../profiles/authoring.js';
import { editorFieldsToProfile, profileToEditorFields } from '../profiles/editorFormat.js';

const FIELD_HELP = {
  focuses: 'id :: type :: label',
  vocabulary: 'id :: sõna/väljend :: tõlge :: sõnaliik :: focus-id, focus-id',
  contexts: 'id :: nimetus :: 08:00, 12:30, 18:00',
  sentences: 'id :: focus-id :: context-id :: raskus 1–5 :: {"slot":["väärtus"]} :: lause',
  errorPairs: 'id :: focus-id :: vigane lause :: õige lause',
  translations: 'id :: focus-id :: lähtekeel :: lähtelause :: eestikeelne vastus',
  speakingPrompts: 'id :: focus-id :: context-id :: rääkimisjuhis',
  writingPrompts: 'id :: focus-id :: context-id :: kirjutamisjuhis',
};

function TextAreaField({ label, help, value, onChange, rows = 5, placeholder = '' }) {
  return (
    <label className="generator-profile-field">
      <span>{label}</span>
      {help ? <small>{help}</small> : null}
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export default function GeneratorProfileEditor({
  lesson,
  initialProfile,
  source = 'none',
  updatedAt = '',
  onSave,
  saving = false,
  onCancel,
}) {
  const [fields, setFields] = useState(() => profileToEditorFields(initialProfile, lesson));
  const set = (name) => (value) => setFields((current) => ({ ...current, [name]: value }));

  const computed = useMemo(() => {
    const parsed = editorFieldsToProfile(fields, { lesson, baseProfile: initialProfile });
    if (!parsed.profile) return { profile: null, ready: false, diagnostics: parsed.diagnostics, counts: {}, catalog: {} };
    const validation = validateGeneratorProfile(parsed.profile, { lessonId: lesson.id, lesson });
    return {
      ...validation,
      diagnostics: [...parsed.diagnostics, ...validation.diagnostics],
    };
  }, [fields, initialProfile, lesson]);

  const blocking = computed.diagnostics.filter((item) => item.severity === 'error');
  const counts = computed.counts || {};

  return (
    <Card className="generator-profile-editor">
      <div className="generator-profile-editor__head">
        <div>
          <div className="generator-profile-editor__title">
            <Database size={19} aria-hidden="true" />
            <h2>Generaatori sisupakett</h2>
            <Badge tone={computed.ready ? 'green' : 'yellow'}>{computed.ready ? 'Valmis' : 'Mustand'}</Badge>
          </div>
          <p>
            See sisu elab õppetunni juures Firestore'is. Salvestada võib ka poolelioleva mustandi;
            genereerimine aktiveerub siis, kui readiness on roheline.
          </p>
        </div>
        <div className="generator-profile-editor__source">
          <span>Allikas: {source === 'embedded' ? 'õppetund' : source === 'static' ? 'Git fallback' : 'uus'}</span>
          {updatedAt ? <span>Muudetud {new Intl.DateTimeFormat('et-EE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(updatedAt))}</span> : null}
        </div>
      </div>

      <div className="generator-profile-meta">
        <label><span>Pealkiri</span><input value={fields.title} onChange={(event) => set('title')(event.target.value)} /></label>
        <label><span>Tase</span><select value={fields.level} onChange={(event) => set('level')(event.target.value)}>{['A1','A2','B1','B2','C1'].map((level) => <option key={level}>{level}</option>)}</select></label>
        <label><span>Tunni liik</span><select value={fields.lessonKind} onChange={(event) => set('lessonKind')(event.target.value)}>{['grammar','vocabulary','communication','reading','listening','writing','assessment','integrated'].map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select></label>
      </div>

      <div className="generator-readiness">
        <div className={computed.ready ? 'is-ready' : 'is-draft'}>
          {computed.ready ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />}
          <div>
            <b>{computed.ready ? 'Pakett on genereerimiseks valmis' : `Puudu: ${blocking.length} readiness nõuet`}</b>
            <span>{counts.focuses || 0} fookust · {counts.vocabulary || 0} sõna · {counts.contexts || 0} konteksti · {counts.sentences || 0} lauset</span>
          </div>
        </div>
        <div className="generator-readiness__phases">
          {['discover','practice','transfer'].map((phase) => (
            <span key={phase}>{phase}: <b>{computed.catalog?.[phase]?.available || 0}/5+</b></span>
          ))}
        </div>
      </div>

      {blocking.length ? (
        <div className="generator-profile-diagnostics" role="status">
          {blocking.slice(0, 8).map((item, index) => <div key={`${item.code}-${index}`}><TriangleAlert size={14} /> {item.message}</div>)}
        </div>
      ) : null}

      <details open className="generator-profile-section">
        <summary><ChevronDown size={16} /> Fookused ja sõnavara</summary>
        <div className="generator-profile-section__body">
          <TextAreaField label="Fookused" help={FIELD_HELP.focuses} value={fields.focuses} onChange={set('focuses')} rows={5} />
          <TextAreaField label="Sihtsõnavara" help={FIELD_HELP.vocabulary} value={fields.vocabulary} onChange={set('vocabulary')} rows={8} />
        </div>
      </details>

      <details open className="generator-profile-section">
        <summary><ChevronDown size={16} /> Kontekstid ja kontrollitud laused</summary>
        <div className="generator-profile-section__body">
          <TextAreaField label="Kontekstid" help={FIELD_HELP.contexts} value={fields.contexts} onChange={set('contexts')} rows={5} />
          <TextAreaField label="Lausepank" help={FIELD_HELP.sentences} value={fields.sentences} onChange={set('sentences')} rows={10} />
          <TextAreaField label="Veaparandused" help={FIELD_HELP.errorPairs} value={fields.errorPairs} onChange={set('errorPairs')} rows={5} />
          <TextAreaField label="Tõlkeülesanded" help={FIELD_HELP.translations} value={fields.translations} onChange={set('translations')} rows={5} />
        </div>
      </details>

      <details className="generator-profile-section">
        <summary><ChevronDown size={16} /> Produktiivsed ülesanded ja edukriteeriumid</summary>
        <div className="generator-profile-section__body">
          <TextAreaField label="Rääkimisjuhised" help={FIELD_HELP.speakingPrompts} value={fields.speakingPrompts} onChange={set('speakingPrompts')} rows={5} />
          <TextAreaField label="Kirjutamisjuhised" help={FIELD_HELP.writingPrompts} value={fields.writingPrompts} onChange={set('writingPrompts')} rows={5} />
          <TextAreaField label="Edukriteeriumid" help="üks kriteerium real" value={fields.successCriteria} onChange={set('successCriteria')} rows={5} />
        </div>
      </details>

      <details className="generator-profile-section">
        <summary><ChevronDown size={16} /> Täpsem: dialoogipank JSON</summary>
        <div className="generator-profile-section__body">
          <TextAreaField
            label="Dialoogid"
            help="JSON massiiv. Seda osa on vaja ainult siis, kui soovid guided-dialogue variatsioone."
            value={fields.dialoguesJson}
            onChange={set('dialoguesJson')}
            rows={10}
          />
        </div>
      </details>

      <div className="generator-profile-actions">
        <Button
          onClick={() => computed.profile && onSave?.(computed.profile, computed)}
          loading={saving}
          disabled={!computed.profile || saving}
        >
          <Save size={16} /> Salvesta sisupakett
        </Button>
        {onCancel ? <Button variant="secondary" onClick={onCancel} disabled={saving}>Sulge</Button> : null}
        {!computed.ready ? <span>Mustandi salvestamine on lubatud; töölehtede genereerimine jääb seni fallback’i või lukku.</span> : null}
      </div>
    </Card>
  );
}
