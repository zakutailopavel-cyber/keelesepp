import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ConversionQueuePage from './ConversionQueuePage.jsx';
import { conversionQueue, conversionStatus, originalFiles } from './conversion.js';

const lessons = [
  { id: 'img', title: 'Minu päev', level: 'A2', topic: 'Päev', files: [{ name: 'leht.png', url: 'https://f.example/leht.png', type: 'image/png' }] },
  { id: 'pdf', title: 'Pere', level: 'A1', files: [{ name: 'pere.pdf', url: 'https://f.example/pere.pdf' }] },
  { id: 'v1', title: 'Vana', level: 'A1', worksheetData: { blocks: [{ type: 'fill' }] } },
  { id: 'v2', title: 'Uus', level: 'A2', worksheetDoc: { blocks: [{ type: 'text' }] }, files: [{ name: 'x.png', url: 'https://f.example/x.png' }] },
  { id: 'plan', title: 'Tunnikava', level: 'A1', files: [{ name: 'plan.docx', url: 'https://f.example/plan.docx' }] },
  { id: 'test', title: 'Kontrolltöö', type: 'test', files: [{ name: 't.png', url: 'https://f.example/t.png' }] },
];

describe('conversion queue model', () => {
  it('classifies materials by migration status and ignores non-worksheets', () => {
    expect(conversionStatus(lessons[0])).toBe('image');
    expect(conversionStatus(lessons[1])).toBe('image');
    expect(conversionStatus(lessons[2])).toBe('structured');
    expect(conversionStatus(lessons[3])).toBe('done');
    expect(conversionStatus(lessons[4])).toBeNull();
    const q = conversionQueue(lessons);
    expect(q.rows.map((r) => r.id)).toEqual(['pdf', 'img', 'v1', 'v2']);
    expect(q.counts).toEqual({ image: 2, structured: 1, done: 1 });
    expect(q.pct).toBe(25);
  });

  it('collects unique original files from the lesson and its phases', () => {
    const files = originalFiles({ files: [{ name: 'a.png', url: 'https://f.example/a.png' }], phaseData: { p1: { files: [{ name: 'a.png', url: 'https://f.example/a.png' }, { name: 'b.jpg', downloadUrl: 'https://f.example/b.jpg' }] } } });
    expect(files.map((f) => f.url)).toEqual(['https://f.example/a.png', 'https://f.example/b.jpg']);
  });
});

describe('ConversionQueuePage', () => {
  it('shows progress and lists work to do, linking each item to the studio', async () => {
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: lessons, exercises: [] }) };
    render(<MemoryRouter><ConversionQueuePage repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('25%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Minu päev/ })).toHaveAttribute('href', '/library/worksheets/img');
    expect(screen.queryByRole('link', { name: /Uus/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Olek'), { target: { value: 'done' } });
    expect(screen.getByRole('link', { name: /Uus/ })).toHaveAttribute('href', '/library/worksheets/v2');
  });
});
