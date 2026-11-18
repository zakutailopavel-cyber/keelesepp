import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import EnrollmentManager from './EnrollmentManager.jsx';
import StudentDirectionsCard from './StudentDirectionsCard.jsx';
import BillingSettingsCard from './BillingSettingsCard.jsx';
import LessonTokensCard from './LessonTokensCard.jsx';
import TokenInvoiceDialog from '../finance/TokenInvoiceDialog.jsx';
import { DEFAULT_DIRECTIONS } from './studyDirections.js';

// „Õppesuunad: individuaalne / grupp” (team 2026-11-18): the format choice, the badges, the group price and package
const groups = [{ id: 'g1', name: 'Eesti A2 õhtu', subject: 'Eesti keel', students: ['s1'] }];
const both = { id: 's1', name: 'Mari', subject: 'Eesti keel', parentName: 'Kati', parentEmail: 'kati@example.ee', active: true, enrollments: [
  { id: 'i', subject: 'Eesti keel', teacher: 'Pavel', active: true },
  { id: 'g', subject: 'Eesti keel', teacher: 'Pavel', active: true, format: 'group', groupId: 'g1' },
] };
const nb = (text) => text.replace(/\u00a0/g, ' ');

describe('„Õppesuunad” window: the format choice', () => {
  it('a legacy track in a calendar group reads „Grupp?”; choosing „Individuaalne” stores it', async () => {
    const service = { updateEnrollment: vi.fn().mockResolvedValue({}), addEnrollment: vi.fn() };
    const student = { id: 's1', name: 'Mari', subject: 'Eesti keel', enrollments: [{ id: 'et', subject: 'Eesti keel', teacher: 'Pavel', active: true }] };
    render(<EnrollmentManager student={student} teachers={['Pavel']} service={service} directions={DEFAULT_DIRECTIONS} groups={groups} onClose={vi.fn()} onChanged={vi.fn()} />);
    const editor = document.querySelector('.enrollment-editor');
    expect(within(editor).getByText('Grupp?')).toBeInTheDocument();
    expect(editor).toHaveTextContent('kalendrigrupis');
    expect(document.querySelector('input[name="format-et"][value="group"]')).toBeChecked();
    fireEvent.click(document.querySelector('input[name="format-et"][value="individual"]'));
    await act(async () => { fireEvent.click(within(editor).getByRole('button', { name: 'Salvesta õppesuund' })); });
    expect(service.updateEnrollment).toHaveBeenCalledWith('s1', expect.any(String), expect.objectContaining({ format: 'individual', groupId: '' }));
  });

  it('adds Eesti keel as a group next to the individual one, with its calendar group; the same format twice is refused', async () => {
    const service = { updateEnrollment: vi.fn(), addEnrollment: vi.fn().mockResolvedValue({}) };
    const student = { id: 's1', name: 'Mari', subject: 'Eesti keel', enrollments: [{ id: 'et', subject: 'Eesti keel', teacher: 'Pavel', active: true, format: 'individual' }] };
    render(<EnrollmentManager student={student} teachers={['Pavel']} service={service} directions={DEFAULT_DIRECTIONS} groups={groups} onClose={vi.fn()} onChanged={vi.fn()} />);
    const form = document.querySelector('.enrollment-editor--new');
    fireEvent.change(within(form).getByLabelText('Õppeaine'), { target: { value: 'Eesti keel' } });
    fireEvent.change(within(form).getByLabelText('Õpetaja'), { target: { value: 'Pavel' } });
    // individual again: refused
    await act(async () => { fireEvent.click(within(form).getByRole('button', { name: /Lisa õppesuund/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Eesti keel (individuaalne) on sellel kaardil juba olemas');
    expect(service.addEnrollment).not.toHaveBeenCalled();
    fireEvent.click(within(form).getByRole('radio', { name: 'Grupp' }));
    fireEvent.change(within(form).getByLabelText('Kalendrigrupp (valikuline)'), { target: { value: 'g1' } });
    await act(async () => { fireEvent.click(within(form).getByRole('button', { name: /Lisa õppesuund/ })); });
    expect(service.addEnrollment).toHaveBeenCalledWith('s1', expect.objectContaining({ subject: 'Eesti keel', teacher: 'Pavel', format: 'group', groupId: 'g1' }));
  });
});

describe('format badges and prices', () => {
  it('the student card lists both directions with a badge and the group price', () => {
    const plan = { lessonPriceCents: 2500, lessonMinutes: 60, groupPrices: { 'Eesti keel': { lessonPriceCents: 1200, lessonMinutes: 60 } } };
    render(<StudentDirectionsCard student={both} plan={plan} groups={groups} canViewFinance today="2026-11-18" />);
    const [individual, group] = screen.getAllByRole('listitem');
    expect(within(individual).getByText('Individuaalne')).toBeInTheDocument();
    expect(individual).toHaveTextContent('Hind: 25,00 € / 60 min');
    expect(within(group).getByText('Grupp')).toBeInTheDocument();
    expect(group).toHaveTextContent('Eesti A2 õhtu');
    expect(group).toHaveTextContent('Grupi hind: 12,00 € / 60 min');
  });

  it('a group direction without a group price warns on the card', () => {
    render(<StudentDirectionsCard student={both} plan={{ lessonPriceCents: 2500, lessonMinutes: 60 }} groups={groups} canViewFinance today="2026-11-18" />);
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('grupi hind puudub — arvel individuaalne hind');
  });

  it('Arveldus: the group price of the subject is its own field and is saved in groupPrices', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={both} plan={{ lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 2, billingMode: 'advance' }} canEdit onSave={onSave} />);
    expect(document.querySelector('[data-billing-group-price="Eesti keel"]')).toHaveTextContent('Grupi hind määramata');
    fireEvent.change(screen.getByLabelText('Grupi tunnitasu (€ / h)'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Grupitunni pikkus'), { target: { value: '90' } });
    expect(nb(document.querySelector('[data-billing-group-price="Eesti keel"]').textContent)).toContain('18,00 € / 90 min');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta/ })); });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ groupPrices: { 'Eesti keel': { lessonPrice: '18', lessonMinutes: '90' } } }));
  });

  it('a card without a group direction never sends groupPrices (the plan stays as it was)', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's2', name: 'Jaan', subject: 'Eesti keel' }} plan={{ lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 1, billingMode: 'advance' }} canEdit onSave={onSave} />);
    expect(screen.queryByLabelText('Grupi tunnitasu (€ / h)')).toBeNull();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta/ })); });
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('groupPrices');
  });
});

describe('lesson packages per format', () => {
  it('Tunnipakett card: a format badge per package and a warning when the group direction has no group package', async () => {
    const packages = [{ id: 'p1', status: 'active', tokenSubject: 'Eesti keel', grantedCredits: 8, consumedCredits: 2, balanceCredits: 6, issuedAt: '2026-11-01', sourceInvoiceNum: 'KS-1' }];
    const service = { listByStudent: vi.fn().mockResolvedValue(packages), ledgerByStudent: vi.fn().mockResolvedValue([{ id: 'e1', entryType: 'lesson_consumption', creditsDelta: -1, balanceAfter: 6, lessonDate: '2026-11-03', formatFallback: true }]), owedByStudent: vi.fn().mockResolvedValue([]) };
    render(<LessonTokensCard student={both} service={service} />);
    await waitFor(() => expect(screen.getByText(/grupi tunnipaketti pole/)).toBeInTheDocument());
    expect(screen.getByText(/Eesti keel · grupp: grupi tunnipaketti pole/)).toBeInTheDocument();
    expect(screen.getByText(/grupitund individuaalsest paketist/)).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Individuaalne')).toBeInTheDocument();
  });

  it('the dialog offers „Vorm” for a subject with a group direction; a group package is sent with format group at the group price', async () => {
    const api = { createTokens: vi.fn().mockResolvedValue({ invoice: { id: 'inv', num: 'KS-9' } }), createTokensCombined: vi.fn() };
    const plans = [{ studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60, groupPrices: { 'Eesti keel': { lessonPriceCents: 1200, lessonMinutes: 60 } } }];
    render(<TokenInvoiceDialog studentCards={[both]} plans={plans} api={api} tokensApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} directionsService={{ list: vi.fn().mockResolvedValue([]) }} notesRepository={{ saveCreationNote: vi.fn() }} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane'), { target: { value: 's1' } });
    expect(nb(document.querySelector('[data-token-price="1"]').textContent)).toContain('25,00 € / h (Eesti keel)');
    fireEvent.change(screen.getByLabelText('Vorm'), { target: { value: 'group' } });
    expect(nb(document.querySelector('[data-token-price="1"]').textContent)).toContain('12,00 € / h (Eesti keel · grupp)');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Loo arve' })); });
    expect(api.createTokens).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', subject: 'Eesti keel', format: 'group' }));
  });

  it('a group package without a group price warns before the invoice is made', () => {
    const plans = [{ studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60 }];
    render(<TokenInvoiceDialog studentCards={[both]} plans={plans} api={{}} tokensApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} directionsService={{ list: vi.fn().mockResolvedValue([]) }} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane'), { target: { value: 's1' } });
    fireEvent.change(screen.getByLabelText('Vorm'), { target: { value: 'group' } });
    expect(document.querySelector('[data-token-price="1"]')).toHaveTextContent('Grupi hind puudub — pakett arveldatakse individuaalse hinnaga');
  });
});
