const messages = Object.freeze({
  'permission-denied': 'Sul puudub selle toimingu jaoks Firebase ligipääs.',
  'firestore/permission-denied': 'Sul puudub selle toimingu jaoks Firebase ligipääs.',
  unauthenticated: 'Kasutajaseanss on aegunud. Logi uuesti sisse.',
  'firestore/unauthenticated': 'Kasutajaseanss on aegunud. Logi uuesti sisse.',
  unavailable: 'Firebase ei ole praegu kättesaadav. Kontrolli ühendust ja proovi uuesti.',
  'firestore/unavailable': 'Firebase ei ole praegu kättesaadav. Kontrolli ühendust ja proovi uuesti.',
  'failed-precondition': 'Firebase vajab selle päringu jaoks täiendavat indeksit.',
  'firestore/failed-precondition': 'Firebase vajab selle päringu jaoks täiendavat indeksit.',
});

export function firebaseErrorMessage(error, fallback = 'Toiming ebaõnnestus. Proovi uuesti.') {
  return messages[error?.code] || error?.message || fallback;
}
