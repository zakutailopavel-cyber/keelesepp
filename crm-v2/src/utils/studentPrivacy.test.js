import { isStudentFieldHidden, studentValueLabel, visibleStudentValue } from './studentPrivacy.js';

describe('legacy student field visibility', () => {
  const student = { email: 'private@example.com', phone: '+372 5555', hiddenFields: { email: true } };

  it('does not expose a field marked hidden by the legacy CRM', () => {
    expect(isStudentFieldHidden(student, 'email')).toBe(true);
    expect(visibleStudentValue(student, 'email')).toBe('');
    expect(studentValueLabel(student, 'email')).toBe('Peidetud');
  });

  it('keeps visible fields available', () => {
    expect(visibleStudentValue(student, 'phone')).toBe('+372 5555');
  });
});
