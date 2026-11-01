import { BookOpen, BookOpenCheck, PawPrint, SpellCheck, CalendarDays, CircleDollarSign, GraduationCap, HeartHandshake, Inbox, Languages, Layers3, TrendingUp, LayoutDashboard, LibraryBig, ListTodo, Megaphone, MessageSquareText, PenLine, Settings, UserRoundCog, UserRoundPlus, Users, Video, Wallet } from 'lucide-react';
import { ACCESS } from './accessPolicy.js';

// Grouped so the menu stays short on a laptop screen: own pages first, then teaching, people, communication and money.
export const navigation = [
  { to: '/', label: 'Ülevaade', icon: LayoutDashboard, end: true, roles: ACCESS.DASHBOARD },
  { to: '/parent', label: 'Minu pere', icon: HeartHandshake, roles: ACCESS.PARENT },
  { to: '/student', label: 'Minu õpingud', icon: GraduationCap, roles: ACCESS.STUDENT, end: true },
  { to: '/student/sonavara', label: 'Sõnavara', icon: Languages, roles: ACCESS.STUDENT },
  { to: '/calendar', label: 'Kalender', icon: CalendarDays, roles: ACCESS.STAFF, group: 'Õppetöö' },
  { to: '/live-classroom', label: 'Live Classroom', icon: Video, roles: ACCESS.LIVE_CLASSROOM, group: 'Õppetöö' },
  { to: '/homework', label: 'Kodutööd', icon: BookOpen, roles: ACCESS.HOMEWORK, group: 'Õppetöö' },
  { to: '/library', label: 'Õppevara', icon: LibraryBig, roles: ACCESS.STAFF, group: 'Õppetöö' },
  { to: '/board', label: 'Tahvel', icon: PenLine, roles: ACCESS.BOARD, group: 'Õppetöö' },
  { to: '/tasks', label: 'Ülesanded', icon: ListTodo, roles: ACCESS.STAFF, group: 'Õppetöö' },
  { to: '/students', label: 'Õpilased', icon: Users, roles: ACCESS.STAFF, group: 'Inimesed' },
  { to: '/parents', label: 'Lapsevanemad', icon: HeartHandshake, roles: ACCESS.STAFF, group: 'Inimesed' },
  { to: '/groups', label: 'Grupid', icon: Layers3, roles: ACCESS.STAFF, group: 'Inimesed' },
  { to: '/teachers', label: 'Õpetajad', icon: UserRoundCog, roles: ACCESS.ADMIN, group: 'Inimesed' },
  { to: '/accounts', label: 'Uued kontod', icon: UserRoundPlus, roles: ACCESS.ADMIN, group: 'Inimesed' },
  { to: '/messages', label: 'Suhtlus', icon: MessageSquareText, roles: ACCESS.MESSAGES, group: 'Suhtlus ja raha' },
  { to: '/leads', label: 'Päringud', icon: Inbox, roles: ACCESS.LEADS, group: 'Suhtlus ja raha' },
  { to: '/kampaaniad', label: 'Kampaaniad', icon: Megaphone, roles: ACCESS.ADMIN, group: 'Suhtlus ja raha' },
  { to: '/finance', label: 'Finantsid', icon: CircleDollarSign, roles: ACCESS.FINANCE, group: 'Suhtlus ja raha' },
  { to: '/kassa', label: 'Kassa', icon: Wallet, roles: ACCESS.STAFF, group: 'Suhtlus ja raha' },
];

// A student's own short menu (owner 2026-11-01: the cabinet was overloaded): what he does every day first; the board,
// his mistakes, his progress and the pet under a quieter group. The lesson invitation pops up on every page, so the
// lesson room needs no menu item. Parents and staff keep the menu above.
export const studentNavigation = [
  { to: '/student', label: 'Täna', icon: GraduationCap, roles: ACCESS.STUDENT, end: true, hint: 'mida täna teha' },
  { to: '/homework', label: 'Ülesanded', icon: ListTodo, roles: ACCESS.STUDENT, hint: 'mida õpetaja andis' },
  { to: '/student/kursus', label: 'Kursus', icon: BookOpenCheck, roles: ACCESS.STUDENT, hint: 'kogu kursuse kaart' },
  { to: '/student/sonavara', label: 'Sõnad', icon: Languages, roles: ACCESS.STUDENT, hint: 'õpi sõnu kaartidega' },
  { to: '/messages', label: 'Suhtlus', icon: MessageSquareText, roles: ACCESS.STUDENT, hint: 'kirjuta õpetajale' },
  { to: '/board', label: 'Tahvel', icon: PenLine, roles: ACCESS.STUDENT, group: 'Veel', hint: 'tundide lehed, joonista ise' },
  { to: '/student/vead', label: 'Minu vead', icon: SpellCheck, roles: ACCESS.STUDENT, group: 'Veel', hint: 'harjuta oma lauseid' },
  { to: '/student/areng', label: 'Minu areng', icon: TrendingUp, roles: ACCESS.STUDENT, group: 'Veel', hint: 'vaata, kuidas läheb' },
  { to: '/student/lemmik', label: 'Lemmik', icon: PawPrint, roles: ACCESS.STUDENT, group: 'Veel', hint: 'sinu õppesõber' },
];

// a pure student account (not also staff or a parent) gets the short menu
export const navigationFor = (roles = []) => (roles.includes('student') && !roles.some((role) => ['admin', 'teacher', 'finance', 'parent'].includes(role)) ? studentNavigation : navigation);

export const settingsNavigation = { to: '/settings', label: 'Seaded', icon: Settings, roles: ACCESS.ALL_AUTHENTICATED };
