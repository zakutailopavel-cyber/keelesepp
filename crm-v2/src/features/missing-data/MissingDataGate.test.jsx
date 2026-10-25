import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import AppShell from '../../components/layout/AppShell.jsx';
import MissingDataGate from './MissingDataGate.jsx';
import { cardErrors, cardQuestions, normalizePhone, payloadOf } from './missingDataModel.js';

// the full shell opens at the end of one test: the lesson-invitation pop-up listens to Firestore, not needed here
vi.mock('../../components/layout/LessonInvitationOverlay.jsx', () => ({ default: () => null }));

const student = { uid: 'stu1', displayName: 'Kai', roles: ['student'] };
const parent = { uid: 'par1', displayName: 'Ema Tamm', roles: ['parent'] };
const app = <p>Rakendus avatud</p>;
const noProfile = { ask: [], required: [] };
const serviceWith = (result, save = vi.fn().mockResolvedValue({ ok: true })) => ({ mine: vi.fn().mockResolvedValue(result), save });

describe('„Puuduvad andmed” model', () => {
  it('checks e-mail, Estonian / international phone and class like the server', () => {
    expect(normalizePhone('5123 4567')).toBe('+37251234567');
    expect(normalizePhone('+358 40 123 4567')).toBe('+358401234567');
    expect(normalizePhone('123')).toBe('');
    const card = { studentId: 's', kind: 'child', ask: ['email', 'phone', 'parentName', 'grade'], required: ['email', 'grade'] };
    expect(cardErrors(card, {})).toEqual({ email: 'required', grade: 'required' });
    expect(cardErrors(card, { email: 'x@', phone: '12', parentName: 'Ema', grade: '1999x' })).toEqual({ email: 'email', phone: 'phone', parentName: 'name', grade: 'grade' });
    expect(cardErrors(card, { email: 'ema@x.ee', grade: '2014' })).toEqual({});
  });

  it('an unknown age asks the class first, then the adult or the child questions', () => {
    const card = { studentId: 's', kind: 'unknown', ask: ['availability', 'grade', 'email'], variants: { adult: ['availability', 'email', 'language'], child: ['availability', 'email', 'parentName', 'language', 'grade'] }, required: ['availability', 'email', 'language', 'grade'] };
    expect(cardQuestions(card, {}).items).toEqual(['grade', 'availability', 'language']);
    expect(cardQuestions(card, { grade: 'Täiskasvanu' })).toEqual({ kind: 'adult', items: ['grade', 'availability', 'email', 'language'] });
    expect(cardQuestions(card, { grade: '5. klass' }).items).toEqual(['grade', 'availability', 'email', 'parentName', 'language']);
    const questions = { cards: [card], profile: noProfile };
    expect(payloadOf(questions, { s: { grade: 'Täiskasvanu', email: 'a@b.ee', parentName: 'left over', gradeYear: false } }, {})).toEqual({ cards: { s: { grade: 'Täiskasvanu', email: 'a@b.ee' } }, profile: {} });
  });
});

describe('„Puuduvad andmed” gate', () => {
  it('opens the app straight away when nothing required is missing', async () => {
    const service = serviceWith({ blocks: false, cards: [{ studentId: 's1', studentName: 'Kai', role: 'student', kind: 'adult', ask: ['phone'], required: [] }], profile: noProfile });
    render(<MissingDataGate enabled user={student} service={service}>{app}</MissingDataGate>);
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('staff are not asked and the server is not called', () => {
    const service = serviceWith({ blocks: true, cards: [], profile: noProfile });
    render(<MissingDataGate enabled={false} user={student} service={service}>{app}</MissingDataGate>);
    expect(screen.getByText('Rakendus avatud')).toBeInTheDocument();
    expect(service.mine).not.toHaveBeenCalled();
  });

  it('fails open when the server cannot be reached', async () => {
    const service = { mine: vi.fn().mockRejectedValue(new Error('404')), save: vi.fn() };
    render(<MissingDataGate enabled user={student} service={service}>{app}</MissingDataGate>);
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('an adult student: only the missing items, required ones block, the account e-mail prefilled, values checked', async () => {
    const service = serviceWith({ blocks: true, cards: [{ studentId: 's1', studentName: 'Kai', role: 'student', kind: 'adult', ask: ['availability', 'email', 'phone', 'language'], required: ['availability', 'email', 'language'], accountEmail: 'kai@x.ee' }], profile: noProfile });
    render(<MissingDataGate enabled user={student} service={service}>{app}</MissingDataGate>);
    expect(await screen.findByRole('heading', { name: 'Palun täida puuduvad andmed' })).toBeInTheDocument();
    expect(screen.queryByText('Rakendus avatud')).toBeNull();
    expect(screen.getByLabelText(/Sinu e-post/)).toHaveValue('kai@x.ee');
    expect(screen.getByText(/Sinu telefon/)).toHaveTextContent('soovi korral');
    expect(screen.queryByLabelText(/Klass või sünniaasta/)).toBeNull();
    expect(screen.queryByLabelText(/Lapsevanema/)).toBeNull();

    fireEvent.change(screen.getByLabelText(/Sinu telefon/), { target: { value: '12' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(service.save).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('(3)');
    expect(screen.getByText(/Telefoninumber ei ole korrektne/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Sinu telefon/), { target: { value: '5123 4567' } });
    fireEvent.click(screen.getByLabelText('Русский'));
    fireEvent.click(screen.getByRole('button', { name: 'Tööpäeva õhtud 17–21' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(service.save).toHaveBeenCalledTimes(1);
    const sent = service.save.mock.calls[0][0];
    expect(sent.cards.s1.email).toBe('kai@x.ee');
    expect(sent.cards.s1.phone).toBe('5123 4567');
    expect(sent.cards.s1.language).toBe('ru');
    expect(sent.cards.s1.availability.slots).toContain('Mon-17:00');
    expect(sent.cards.s1.cells).toBeUndefined();
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('a student of unknown age: „Täiskasvanu” asks the own e-mail, a class asks the parent', async () => {
    const service = serviceWith({ blocks: true, cards: [{ studentId: 's1', studentName: 'Kai', role: 'student', kind: 'unknown', ask: ['grade', 'email'], variants: { adult: ['email'], child: ['email', 'parentName'] }, required: ['grade', 'email'], accountEmail: 'kai@x.ee' }], profile: noProfile });
    render(<MissingDataGate enabled user={student} service={service}>{app}</MissingDataGate>);
    const grade = await screen.findByLabelText(/Klass või sünniaasta/);
    expect(screen.queryByLabelText(/e-post/)).toBeNull();
    fireEvent.change(grade, { target: { value: 'Täiskasvanu' } });
    expect(screen.getByLabelText(/Sinu e-post/)).toHaveValue('kai@x.ee');
    fireEvent.change(grade, { target: { value: '7. klass' } });
    expect(screen.getByLabelText(/Lapsevanema e-post/)).toHaveValue('');
    fireEvent.change(screen.getByLabelText(/Lapsevanema e-post/), { target: { value: 'ema@x.ee' } });
    fireEvent.change(screen.getByLabelText(/Lapsevanema ees- ja perekonnanimi/), { target: { value: 'Ema Tamm' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(service.save).toHaveBeenCalledWith({ cards: { s1: { grade: '7. klass', email: 'ema@x.ee', parentName: 'Ema Tamm' } }, profile: {} });
  });

  it('a parent with two children fills per child, own phone and language once', async () => {
    const service = serviceWith({
      blocks: true,
      cards: [
        { studentId: 'k1', studentName: 'Mari', role: 'parent', kind: 'child', ask: ['availability'], required: ['availability'] },
        { studentId: 'k2', studentName: 'Jüri', role: 'parent', kind: 'child', ask: ['availability', 'grade'], required: ['availability', 'grade'] },
      ],
      profile: { ask: ['phone', 'language'], required: ['language'] },
    });
    render(<MissingDataGate enabled user={parent} service={service}>{app}</MissingDataGate>);
    const mari = await screen.findByRole('region', { name: 'Laps · Ребёнок: Mari' });
    const juri = screen.getByRole('region', { name: 'Laps · Ребёнок: Jüri' });
    expect(within(mari).queryByLabelText(/Klass/)).toBeNull();
    const own = screen.getByRole('region', { name: /Sinu andmed/ });
    expect(within(own).getAllByRole('radio')).toHaveLength(3);
    fireEvent.click(within(own).getByLabelText('Eesti keel'));
    fireEvent.click(within(mari).getByRole('button', { name: 'Nädalavahetus 10–18' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(service.save).not.toHaveBeenCalled();
    expect(within(juri).getAllByText(/Palun täida/)).toHaveLength(2);
    fireEvent.click(within(juri).getByRole('button', { name: 'Tööpäeva õhtud 17–21' }));
    fireEvent.change(within(juri).getByLabelText(/Klass või sünniaasta/), { target: { value: 'year' } });
    fireEvent.change(within(juri).getByLabelText(/Sünniaasta/), { target: { value: '2014' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    const sent = service.save.mock.calls[0][0];
    expect(Object.keys(sent.cards)).toEqual(['k1', 'k2']);
    expect(sent.cards.k1.availability.slots).toContain('Sat-10:00');
    expect(sent.cards.k2.grade).toBe('2014');
    expect(sent.profile).toEqual({ language: 'et' });
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('shows the server\'s field errors and lets the learner continue when saving fails', async () => {
    const card = { studentId: 's1', studentName: 'Kai', role: 'student', kind: 'adult', ask: ['email'], required: ['email'] };
    const bad = Object.assign(new Error('Mõni vastus on puudu või vigane.'), { status: 400, details: { s1: { email: 'email' } } });
    const save = vi.fn().mockRejectedValueOnce(bad).mockRejectedValueOnce(new Error('Internal error'));
    render(<MissingDataGate enabled user={student} service={serviceWith({ blocks: true, cards: [card], profile: noProfile }, save)}>{app}</MissingDataGate>);
    fireEvent.change(await screen.findByLabelText(/Sinu e-post/), { target: { value: 'kai@x.ee' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(screen.getByText(/E-posti aadress ei ole korrektne/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(screen.getByText(/Internal error/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Jätka praegu ilma/ }));
    expect(screen.getByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('logging out stays possible', async () => {
    const signOut = vi.fn();
    render(<MissingDataGate enabled user={student} onSignOut={signOut} service={serviceWith({ blocks: true, cards: [{ studentId: 's1', studentName: 'Kai', role: 'student', kind: 'adult', ask: ['email'], required: ['email'] }], profile: noProfile })}>{app}</MissingDataGate>);
    fireEvent.click(await screen.findByRole('button', { name: /Logi välja/ }));
    expect(signOut).toHaveBeenCalled();
  });

  it('in the shell „Teated” come first, then the missing data, then the app', async () => {
    const announcements = {
      mine: vi.fn().mockResolvedValue({ pending: [{ announcement: { id: 'a1', title: 'Uus õppeaasta', body: 'Tere', responseType: 'read', question: { mode: 'text', options: [], allowOther: false }, allowChange: false }, target: { key: 'u_stu1', kind: 'student', studentId: 's1', studentName: 'Kai' }, response: null }], past: [] }),
      respond: vi.fn().mockResolvedValue({ ok: true }),
    };
    const missingData = serviceWith({ blocks: true, cards: [{ studentId: 's1', studentName: 'Kai', role: 'student', kind: 'adult', ask: ['language'], required: ['language'] }], profile: noProfile });
    render(
      <AuthContext.Provider value={{ user: student, signOut: vi.fn() }}>
        <MemoryRouter initialEntries={['/']}><Routes><Route path="*" element={<AppShell announcements={announcements} missingData={missingData} approvals={{}} messages={{}} />}><Route path="*" element={app} /></Route></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(await screen.findByRole('heading', { name: 'Uus õppeaasta' })).toBeInTheDocument();
    expect(missingData.mine).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Sain aru/ })); });
    expect(await screen.findByRole('heading', { name: 'Palun täida puuduvad andmed' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('English'));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta ja jätka/ })); });
    expect(missingData.save).toHaveBeenCalledWith({ cards: { s1: { language: 'en' } }, profile: {} });
    await waitFor(() => expect(screen.getByText('Rakendus avatud')).toBeInTheDocument());
  });

  it('the administrator and the admin preview are never asked', async () => {
    const missingData = serviceWith({ blocks: true, cards: [], profile: noProfile });
    const announcements = { mine: vi.fn().mockResolvedValue({ pending: [], past: [] }), respond: vi.fn() };
    const view = render(
      <AuthContext.Provider value={{ user: { ...student, roles: ['admin'] }, signOut: vi.fn() }}>
        <MemoryRouter initialEntries={['/']}><Routes><Route path="*" element={<AppShell announcements={announcements} missingData={missingData} approvals={{}} messages={{}} />}><Route path="*" element={app} /></Route></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText('Rakendus avatud')).toBeInTheDocument();
    view.unmount();
    render(
      <AuthContext.Provider value={{ user: student, signOut: vi.fn(), preview: { readOnly: true }, stopPreview: vi.fn() }}>
        <MemoryRouter initialEntries={['/']}><Routes><Route path="*" element={<AppShell announcements={announcements} missingData={missingData} approvals={{}} messages={{}} />}><Route path="*" element={app} /></Route></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    await waitFor(() => expect(screen.getByText('Rakendus avatud')).toBeInTheDocument());
    expect(missingData.mine).not.toHaveBeenCalled();
  });
});
