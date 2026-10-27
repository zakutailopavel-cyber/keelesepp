import { Check, ClipboardCopy, Megaphone, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { campaignsService, groupsService } from '../../services/firebase/index.js';
import { CHANNELS, KINDS, LANGS, STATUSES, TEMPLATES, duePosts, normalizeCampaign, progressOf, sortCampaigns, validateCampaign } from './campaignModel.js';
import './campaigns.css';

const TONE = { idea: 'neutral', preparing: 'info', ready: 'warning', live: 'success', done: 'neutral', archived: 'neutral' };
const VIEWS = [['active', 'Käimas ja tulekul'], ['all', 'Kõik'], ['archived', 'Lõppenud ja arhiiv']];
const euros = (cents) => (cents ? String(cents / 100).replace('.', ',') : '');
const cents = (value) => Math.max(0, Math.round(Number(String(value || '').replace(',', '.')) * 100) || 0);
const date = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '');
const todayIso = () => new Intl.DateTimeFormat('sv-SE').format(new Date());

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function CopyButton({ text, label = 'Kopeeri tekst' }) {
  const [done, setDone] = useState('');
  return <Button variant="secondary" disabled={!text} onClick={async () => setDone((await copyText(text)) ? 'Kopeeritud' : 'Vali tekst ja kopeeri käsitsi')}>
    <ClipboardCopy size={15} /> {done || label}
  </Button>;
}

function PostEditor({ post, index, onChange, onRemove }) {
  const set = (patch) => onChange({ ...post, ...patch });
  return <div className={`cp-post${post.posted ? ' is-posted' : ''}`}>
    <div className="cp-post__head">
      <Select label="Kanal" id={`cp-post-${index}-channel`} value={post.channel} onChange={(event) => set({ channel: event.target.value })}>{Object.entries(CHANNELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
      <Select label="Keel" id={`cp-post-${index}-lang`} value={post.lang} onChange={(event) => set({ lang: event.target.value })}>{Object.entries(LANGS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
      <Input label="Postitamise päev" id={`cp-post-${index}-date`} type="date" value={post.postDate} onChange={(event) => set({ postDate: event.target.value })} />
    </div>
    <label className="cp-text"><span>Tekst ({post.text.length}/3000)</span>
      <textarea aria-label={`Postituse ${index + 1} tekst`} rows={8} maxLength={3000} value={post.text} onChange={(event) => set({ text: event.target.value })} />
    </label>
    <Input label="Pilt / video (mida näidata)" id={`cp-post-${index}-image`} value={post.imageNote} maxLength={500} onChange={(event) => set({ imageNote: event.target.value })} />
    <div className="cp-post__actions">
      <CopyButton text={post.text} />
      <label className="cp-check"><input type="checkbox" checked={post.posted} onChange={(event) => set({ posted: event.target.checked })} /> Postitatud</label>
      <button type="button" className="cp-icon" aria-label={`Eemalda postitus ${index + 1}`} onClick={onRemove}><Trash2 size={15} /></button>
    </div>
  </div>;
}

function CampaignEditor({ initial, groups, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...initial, budget: euros(initial.budgetCents), spent: euros(initial.spentCents) }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const setPost = (index, post) => set({ posts: form.posts.map((item, at) => (at === index ? post : item)) });
  const setItem = (index, patch) => set({ checklist: form.checklist.map((item, at) => (at === index ? { ...item, ...patch } : item)) });
  const save = async (event) => {
    event.preventDefault();
    const values = { ...form, budgetCents: cents(form.budget), spentCents: cents(form.spent), checklist: form.checklist.filter((item) => item.text.trim()) };
    const problem = validateCampaign(values);
    if (problem) { setError(problem); return; }
    setSaving(true); setError('');
    try { await onSave(values); } catch (failure) { setError(failure.message || 'Ei saanud salvestada.'); setSaving(false); }
  };
  return <Card className="cp-editor">
    <form onSubmit={save} aria-label="Kampaania">
      <div className="section-heading"><h2>{initial.id ? form.title || 'Kampaania' : 'Uus kampaania'}</h2></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="cp-grid">
        <Input label="Nimi *" id="cp-title" value={form.title} maxLength={120} onChange={(event) => set({ title: event.target.value })} />
        <Select label="Liik" id="cp-kind" value={form.kind} onChange={(event) => set({ kind: event.target.value })}>{Object.entries(KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Select label="Seis" id="cp-status" value={form.status} onChange={(event) => set({ status: event.target.value })}>{Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Input label="Algus" id="cp-start" type="date" value={form.startDate} onChange={(event) => set({ startDate: event.target.value })} />
        <Input label="Lõpp" id="cp-end" type="date" value={form.endDate} onChange={(event) => set({ endDate: event.target.value })} />
        <Select label="Grupp" id="cp-group" value={form.groupId} onChange={(event) => set({ groupId: event.target.value })}><option value="">— pole —</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</Select>
      </div>
      <label className="cp-text"><span>Kellele (sihtrühm)</span><textarea rows={2} maxLength={300} value={form.audience} onChange={(event) => set({ audience: event.target.value })} /></label>
      <label className="cp-text"><span>Pakkumine (mis, millal, hind, tingimused)</span><textarea rows={3} maxLength={1000} value={form.offer} onChange={(event) => set({ offer: event.target.value })} /></label>
      <div className="cp-grid">
        <Input label="Eesmärk" id="cp-goal" value={form.goal} maxLength={300} onChange={(event) => set({ goal: event.target.value })} />
        <Input label="Soovitud registreerumisi" id="cp-target" type="number" min="0" value={form.targetSignups || ''} onChange={(event) => set({ targetSignups: Number(event.target.value) || 0 })} />
        <Input label="Registreerunud" id="cp-signups" type="number" min="0" value={form.signups || ''} onChange={(event) => set({ signups: Number(event.target.value) || 0 })} />
        <Input label="Eelarve (€)" id="cp-budget" inputMode="decimal" value={form.budget} onChange={(event) => set({ budget: event.target.value })} />
        <Input label="Kulutatud (€)" id="cp-spent" inputMode="decimal" value={form.spent} onChange={(event) => set({ spent: event.target.value })} />
      </div>
      <fieldset className="cp-channels"><legend>Kanalid</legend>{Object.entries(CHANNELS).map(([value, label]) => <label key={value} className="cp-check"><input type="checkbox" checked={form.channels.includes(value)} onChange={(event) => set({ channels: event.target.checked ? [...form.channels, value] : form.channels.filter((item) => item !== value) })} /> {label}</label>)}</fieldset>

      <h3>Postitused <small>valmis tekstid — kopeeri ja postita käsitsi</small></h3>
      {form.posts.map((post, index) => <PostEditor key={index} post={post} index={index} onChange={(next) => setPost(index, next)} onRemove={() => set({ posts: form.posts.filter((_, at) => at !== index) })} />)}
      {form.posts.length < 30 ? <Button variant="secondary" onClick={() => set({ posts: [...form.posts, { channel: form.channels[0] || 'facebook', lang: 'et', text: '', imageNote: '', postDate: '', posted: false }] })}><Plus size={15} /> Lisa postitus</Button> : null}

      <h3>Ettevalmistus</h3>
      <div className="cp-checklist">{form.checklist.map((item, index) => <div className="cp-item" key={index}>
        <input type="checkbox" aria-label={`Tehtud: ${item.text}`} checked={item.done} onChange={(event) => setItem(index, { done: event.target.checked })} />
        <input className="field__input" aria-label={`Samm ${index + 1}`} value={item.text} maxLength={200} onChange={(event) => setItem(index, { text: event.target.value })} />
        <button type="button" className="cp-icon" aria-label={`Eemalda samm ${index + 1}`} onClick={() => set({ checklist: form.checklist.filter((_, at) => at !== index) })}><Trash2 size={15} /></button>
      </div>)}</div>
      {form.checklist.length < 40 ? <Button variant="secondary" onClick={() => set({ checklist: [...form.checklist, { text: '', done: false }] })}><Plus size={15} /> Lisa samm</Button> : null}

      <label className="cp-text"><span>Märkmed</span><textarea rows={3} maxLength={3000} value={form.notes} onChange={(event) => set({ notes: event.target.value })} /></label>
      <div className="cp-actions"><Button type="submit" loading={saving}>Salvesta</Button><Button variant="secondary" disabled={saving} onClick={onCancel}>Loobu</Button></div>
    </form>
  </Card>;
}

function CampaignCard({ campaign, groups, onOpen }) {
  const progress = progressOf(campaign);
  const group = groups.find((item) => item.id === campaign.groupId);
  return <button type="button" className="cp-card" onClick={() => onOpen(campaign)}>
    <span className="cp-card__top"><Badge tone={TONE[campaign.status]}>{STATUSES[campaign.status]}</Badge><small>{KINDS[campaign.kind]}</small></span>
    <strong>{campaign.title}</strong>
    <small>{[campaign.startDate ? `${date(campaign.startDate)}${campaign.endDate ? ` – ${date(campaign.endDate)}` : ''}` : 'kuupäev määramata', group ? `grupp: ${group.name}` : '', campaign.channels.map((channel) => CHANNELS[channel]).join(', ')].filter(Boolean).join(' · ')}</small>
    <span className="cp-card__stats">
      <span>Samme {progress.checklistDone}/{progress.checklistTotal}</span>
      <span>Postitatud {progress.postsPosted}/{progress.postsTotal}</span>
      {campaign.targetSignups ? <span>Registreerunud {campaign.signups}/{campaign.targetSignups}</span> : null}
      {campaign.budgetCents ? <span>Eelarve {euros(campaign.spentCents) || 0}/{euros(campaign.budgetCents)} €</span> : null}
    </span>
    {progress.signupsPercent !== null ? <span className="cp-bar" aria-hidden="true"><span style={{ width: `${progress.signupsPercent}%` }} /></span> : null}
  </button>;
}

/**
 * „Kampaaniad” (owner 2026-10-27: „будущие кампании или акции, рекламные кампании и мероприятия, чтобы готовить прямо в
 * кабинете админа и потом уже готовый формат постить”). Administrator only. Nothing is posted from here: the texts are
 * copied and posted by hand, then marked „Postitatud”.
 */
export default function CampaignsPage({ repository = campaignsService, groupsRepository = groupsService, today = todayIso() }) {
  const { user } = useAuth();
  const state = useAsyncData(async () => {
    const [campaigns, groups] = await Promise.all([repository.list(), Promise.resolve().then(() => groupsRepository.list()).catch(() => [])]);
    return { campaigns, groups };
  }, [repository, groupsRepository]);
  const [saved, setSaved] = useState({});
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('active');
  const [message, setMessage] = useState('');

  const campaigns = useMemo(() => {
    const list = new Map((state.data?.campaigns || []).map((campaign) => [campaign.id, campaign]));
    Object.values(saved).forEach((campaign) => list.set(campaign.id, campaign));
    return sortCampaigns([...list.values()]);
  }, [state.data, saved]);
  const shown = campaigns.filter((campaign) => (view === 'all' ? true : view === 'archived' ? ['done', 'archived'].includes(campaign.status) : !['done', 'archived'].includes(campaign.status)));
  const due = duePosts(campaigns, today);
  const groups = state.data?.groups || [];

  const start = (template) => { setMessage(''); setEditing(normalizeCampaign('', template ? TEMPLATES[template].campaign : { title: '', status: 'idea' })); };
  const save = async (values) => {
    const result = editing.id ? await repository.update(editing, values, user) : await repository.create(values, user);
    setSaved((current) => ({ ...current, [result.id]: result }));
    setEditing(null);
    setMessage(`Salvestatud: ${result.title}.`);
  };
  const markPosted = async ({ campaign, index }) => {
    const values = { ...campaign, posts: campaign.posts.map((post, at) => (at === index ? { ...post, posted: true } : post)) };
    try { const result = await repository.update(campaign, values, user); setSaved((current) => ({ ...current, [result.id]: result })); } catch (error) { setMessage(error.message || 'Ei saanud salvestada.'); }
  };

  return <div className="page cp-page">
    <PageHeader eyebrow="Turundus" title="Kampaaniad" description="Aktsioonid, reklaamikampaaniad ja üritused: valmista siin ette pakkumine, postitused (ET + RU) ja sammud. Postitad ise — CRM ei avalda midagi." />
    {state.loading ? <LoadingState label="Laen kampaaniaid…" /> : state.error ? <ErrorState title="Kampaaniaid ei saanud laadida" description={state.error.message} /> : <>
      {editing ? <CampaignEditor key={editing.id || 'new'} initial={editing} groups={groups} onSave={save} onCancel={() => setEditing(null)} /> : <>
        <div className="cp-toolbar">
          <Button onClick={() => start('')}><Plus size={16} /> Uus kampaania</Button>
          {Object.entries(TEMPLATES).map(([key, template]) => <Button key={key} variant="secondary" onClick={() => start(key)}><Megaphone size={15} /> {template.label}</Button>)}
          <div className="cp-views" role="group" aria-label="Vaade">{VIEWS.map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} className={view === value ? 'is-active' : ''} onClick={() => setView(value)}>{label}</button>)}</div>
        </div>
        {message ? <p className="form-hint" role="status">{message}</p> : null}
        {due.length ? <Card className="cp-due" role="region" aria-label="Täna postitada">
          <h2>Täna postitada ({due.length})</h2>
          {due.map((item) => <div className="cp-due__row" key={`${item.campaign.id}-${item.index}`}>
            <span><strong>{item.campaign.title}</strong><small>{CHANNELS[item.post.channel]} · {LANGS[item.post.lang]} · {date(item.post.postDate)}</small></span>
            <CopyButton text={item.post.text} />
            <Button variant="secondary" onClick={() => markPosted(item)}><Check size={15} /> Postitatud</Button>
          </div>)}
        </Card> : null}
        {shown.length ? <div className="cp-list">{shown.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} groups={groups} onOpen={(item) => { setMessage(''); setEditing(item); }} />)}</div>
          : <EmptyState title="Kampaaniaid pole" description="Alusta tühjalt või valmis mallist, nt „Eelkool — pühapäevarühm”." />}
      </>}
    </>}
  </div>;
}
