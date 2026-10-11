import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RoomPet from './RoomPet.jsx';

describe('RoomPet', () => {
  it('cheers for the teacher\'s lesson words and for words the student adds from the sheet', async () => {
    let push = null;
    const words = { subscribeForStudent: (_id, onNext) => { push = onNext; return () => {}; } };
    const repository = { get: async () => ({ kind: 'rebane', name: 'Lisa' }) };
    render(<RoomPet user={{ uid: 'u1' }} studentId="s1" invitationId="inv1" repository={repository} wordsService={words} homeworkService={{}} />);
    expect(await screen.findByText(/Lisa on ka tunnis/)).toBeInTheDocument();
    act(() => push([{ id: 'old', word: 'kass', invitationId: 'inv0' }]));
    act(() => push([{ id: 'old', word: 'kass', invitationId: 'inv0' }, { id: 'w1', word: 'linn', invitationId: 'inv1' }]));
    expect(screen.getByText('Uus sõna: linn!')).toBeInTheDocument();
    act(() => push([{ id: 'old', word: 'kass', invitationId: 'inv0' }, { id: 'w1', word: 'linn', invitationId: 'inv1' }, { id: 'w2', word: 'raamatukogu', invitationId: '', source: 'double-click' }]));
    expect(screen.getByText('Uus sõna: raamatukogu!')).toBeInTheDocument();
    act(() => push([{ id: 'old', word: 'kass', invitationId: 'inv0' }, { id: 'w1', word: 'linn', invitationId: 'inv1' }, { id: 'w2', word: 'raamatukogu', invitationId: '', source: 'double-click' }, { id: 'w3', word: 'pood', invitationId: 'inv9' }]));
    expect(screen.queryByText('Uus sõna: pood!')).not.toBeInTheDocument();
  });
});
