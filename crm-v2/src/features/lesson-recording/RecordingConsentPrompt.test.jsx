import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RecordingConsentPrompt from './RecordingConsentPrompt.jsx';
import { consentQuestionFor } from './consentModel.js';

const user = { uid: 'u-1', displayName: 'Mari' };

describe('RecordingConsentPrompt', () => {
  it('asks only cards without a decision; a card with a parent account is the parent\'s question', () => {
    const cards = [
      { id: 'a' },
      { id: 'b', recordingConsent: true },
      { id: 'c', recordingConsent: false },
      { id: 'd', linkedParentId: 'p-1' },
      { id: 'e', linkedParentIds: ['p-1'] },
    ];
    expect(consentQuestionFor(cards, 'student').map((card) => card.id)).toEqual(['a']);
    expect(consentQuestionFor(cards, 'parent').map((card) => card.id)).toEqual(['a', 'd', 'e']);
  });

  it('stores the student\'s own answer once and closes', async () => {
    const service = { answerConsent: vi.fn().mockResolvedValue({ recordingConsent: true }) };
    render(<RecordingConsentPrompt students={[{ id: 'st-1', name: 'Mari' }]} user={user} service={service} />);
    expect(screen.getByRole('dialog', { name: /Tunni salvestamine/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Nõustun/ }));
    await waitFor(() => expect(service.answerConsent).toHaveBeenCalledWith({ studentId: 'st-1', value: true, user }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('asks a parent for each child in turn and records a refusal too', async () => {
    const service = { answerConsent: vi.fn().mockResolvedValue({}) };
    render(<RecordingConsentPrompt role="parent" students={[{ id: 'k1', name: 'Kati', parentUid: 'u-1' }, { id: 'k2', name: 'Jaan', parentUid: 'u-1' }]} user={user} service={service} />);
    expect(screen.getAllByText(/Kati:/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Ei nõustu/ }));
    await waitFor(() => expect(screen.getAllByText(/Jaan:/).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: /Nõustun/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(service.answerConsent.mock.calls.map(([call]) => [call.studentId, call.value])).toEqual([['k1', false], ['k2', true]]);
  });

  it('shows nothing when everything is decided, and keeps the question open on a save error', async () => {
    const { rerender } = render(<RecordingConsentPrompt students={[{ id: 'x', recordingConsent: true }]} user={user} service={{ answerConsent: vi.fn() }} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    const service = { answerConsent: vi.fn().mockRejectedValue(new Error('permission-denied')) };
    rerender(<RecordingConsentPrompt students={[{ id: 'y' }]} user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Nõustun/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('permission-denied');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
