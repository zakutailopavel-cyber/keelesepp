import { describe, expect, it } from 'vitest';
import { TEMPLATES, duePosts, normalizeCampaign, progressOf, recordOf, sortCampaigns, validateCampaign } from './campaignModel.js';

describe('campaigns („Kampaaniad”)', () => {
  it('cleans a stored campaign: known kinds, statuses, channels; limits', () => {
    const campaign = normalizeCampaign('c1', { title: '  Eelkool ', kind: 'x', status: 'y', channels: ['facebook', 'tiktok', 'facebook'], targetSignups: -3, posts: [{ channel: 'z', lang: 'de', text: 'Tere', posted: 'yes' }], checklist: [{ text: '' }, { text: 'Hind', done: true }] });
    expect(campaign).toMatchObject({ id: 'c1', title: 'Eelkool', kind: 'offer', status: 'idea', channels: ['facebook'], targetSignups: 0 });
    expect(campaign.posts).toEqual([{ channel: 'facebook', lang: 'et', text: 'Tere', imageNote: '', postDate: '', posted: false }]);
    expect(campaign.checklist).toEqual([{ text: 'Hind', done: true }]);
    expect(Object.keys(recordOf(campaign))).not.toContain('id');
    expect(Object.keys(recordOf(campaign))).not.toContain('createdByUid');
  });

  it('needs a name and dates in order', () => {
    expect(validateCampaign({ title: ' ' })).toMatch(/nimi/);
    expect(validateCampaign({ title: 'A', startDate: '2026-11-10', endDate: '2026-11-01' })).toMatch(/Lõpp/);
    expect(validateCampaign({ title: 'A' })).toBe('');
  });

  it('the pre-school template is ready to prepare: offer, ET + RU posts, checklist, group of five', () => {
    const campaign = normalizeCampaign('', TEMPLATES.preschool.campaign);
    expect(campaign).toMatchObject({ kind: 'offer', status: 'preparing', targetSignups: 5 });
    expect(campaign.posts.map((post) => `${post.channel}:${post.lang}`)).toEqual(['facebook:et', 'facebook:ru', 'instagram:ru', 'whatsapp:ru']);
    expect(campaign.posts.every((post) => post.text.length > 50)).toBe(true);
    expect(progressOf(campaign)).toMatchObject({ checklistDone: 0, checklistTotal: 9, postsReady: 4, postsPosted: 0, signupsPercent: 0 });
  });

  it('posts due today, live campaigns first', () => {
    const a = normalizeCampaign('a', { title: 'A', status: 'ready', posts: [{ text: 'x', postDate: '2026-10-27' }, { text: 'y', postDate: '2026-10-28' }, { text: 'z', postDate: '2026-10-20', posted: true }] });
    const b = normalizeCampaign('b', { title: 'B', status: 'idea', posts: [{ text: 'x', postDate: '2026-10-01' }] });
    expect(duePosts([a, b], '2026-10-27').map((item) => [item.campaign.id, item.index])).toEqual([['a', 0]]);
    expect(sortCampaigns([b, normalizeCampaign('c', { title: 'C', status: 'live' }), a]).map((item) => item.id)).toEqual(['c', 'a', 'b']);
  });
});
