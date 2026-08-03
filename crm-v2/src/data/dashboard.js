export const dashboardFallback = {
  metrics: [
    { label: 'Tänased tunnid', value: '12', meta: '3 õpetajat töös' },
    { label: 'Aktiivsed õpilased', value: '148', meta: '+6 sel kuul' },
    { label: 'Laekumata arved', value: '€2 840', meta: '11 arvet vajab tähelepanu' },
    { label: 'Kodutööd kontrollida', value: '27', meta: '8 tähtajaga täna' },
  ],
  lessons: [
    { id: 'lesson-1', time: '09:00', student: 'Anna Petrova', subject: 'Eesti keel A2', teacher: 'Maria Saar' },
    { id: 'lesson-2', time: '11:00', student: 'Maksim Ivanov', subject: 'Eesti keel B1', teacher: 'Karl Tamm' },
    { id: 'lesson-3', time: '14:30', student: 'Sofia Kuznetsova', subject: 'Vestluspraktika', teacher: 'Maria Saar' },
  ],
  alerts: [
    { id: 'alert-1', title: '3 uut õppematerjali ootab kinnitamist', tone: 'info' },
    { id: 'alert-2', title: '11 arvet on tähtaja ületanud', tone: 'warning' },
    { id: 'alert-3', title: '2 õpetaja tööaeg vajab ülevaatamist', tone: 'neutral' },
  ],
};
