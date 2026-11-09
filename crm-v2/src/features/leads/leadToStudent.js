// the lead's contact details as a new student card (StudentForm fields); a parent's lead: the e-mail is the parent's
export function leadToStudent(lead = {}) {
  const level = ['A1', 'A2', 'B1', 'B2', 'C1'].find((item) => String(lead.level || '').toUpperCase().startsWith(item)) || '';
  const subject = /keel/i.test(lead.language || '') ? lead.language : '';
  return {
    name: lead.name || '',
    phone: lead.phone || '',
    ...(lead.parentName ? { parentName: lead.parentName, parentEmail: lead.email || '' } : { email: lead.email || '' }),
    ...(level ? { level } : {}),
    ...(subject ? { subject } : {}),
  };
}
