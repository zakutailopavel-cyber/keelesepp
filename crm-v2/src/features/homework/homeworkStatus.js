// Homework is open until it is done („Tehtud”) or closed by staff („Suletud”, e.g. an old task nobody will do any more).
export const CLOSED_HOMEWORK = ['Tehtud', 'Suletud'];
export const isHomeworkOpen = (item) => !CLOSED_HOMEWORK.includes(item?.status);
