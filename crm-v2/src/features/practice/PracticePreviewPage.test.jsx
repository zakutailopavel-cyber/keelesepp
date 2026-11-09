import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { B } from '../worksheet-generator/admin/course/blocks.js';
import PracticePreviewPage from './PracticePreviewPage.jsx';

const lessons = {
  'a2b1-037': {
    title: 'Ma ja da',
    practice: [
      B.gaps('g', 'Ma või da?', 'Kirjuta sulgudes olev tegusõna ma- või da-vormis.', [
        'Liis lubas Annaga soome keeles [rääkida] (rääkima).', 'Anna peab enne eksamit palju [harjutama] (harjutama).',
        'Kas sa oskad soome keeles numbreid kiiresti [lugeda] (lugema)?', 'Markus hakkas sel kuul kursusel [käima] (käima).',
        'Annal on õhtuti raske uusi sõnu meelde [jätta] (jätma).',
      ]),
      B.wordorder('w', 'Pane lause kokku.', 'Pane sõnad õigesse järjekorda.', [
        'Kuna päeval pole aega, õpib Anna õhtul.', 'Anna tõuseb vara, sest koer tahab õue minna.', 'Kursus lõpeb hilja, seepärast teeb Anna kodutöö hommikul.',
        'Liis soovitab hommikul õppida, sest siis on aju puhanud.',
      ]),
    ],
  },
};
const MODULES = [{ MODULE: { id: 'a2b1-module-08', title: 'Õppimine ja kool', course: 'b1' }, LESSONS: lessons }];
const loaders = { a2: async () => ({ MODULES: [] }), b1: async () => ({ MODULES }), b2: async () => ({ MODULES: [] }), c1: async () => ({ MODULES: [] }) };

describe('PracticePreviewPage', () => {
  it('loads a course, shows its coverage and runs a lesson', async () => {
    render(<PracticePreviewPage loaders={loaders} />);
    expect(screen.getByRole('heading', { name: 'Harjutuste eelvaade' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Katvus: B1 (A2 → B1)')).toBeInTheDocument());
    expect(screen.getByRole('option', { name: '1. Õppimine ja kool' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /ma- ja da-infinitiiv \(5\)/ })).toBeInTheDocument();
    expect(screen.getByText('ma- või da-infinitiiv').closest('li')).toHaveTextContent('5');
    fireEvent.click(screen.getByRole('button', { name: 'Koosta tund' }));
    expect(screen.getByRole('region', { name: 'Harjutus' })).toBeInTheDocument();
    expect(screen.getByText(/9 ülesannet/)).toBeInTheDocument();
  });
});
