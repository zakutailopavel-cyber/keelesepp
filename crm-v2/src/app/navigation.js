import { BookOpen, Compass, PenLine, UserRoundPlus, CalendarDays, CircleDollarSign, GraduationCap, HeartHandshake, Inbox, Layers3, LibraryBig, LayoutDashboard, ListTodo, MessageSquareText, Settings, UserRoundCog, Users, Video } from 'lucide-react';
import { ACCESS } from './accessPolicy.js';

// Grouped so the menu stays short on a laptop screen: own pages first, then teaching, people, communication and money.
export const navigation = [
  { to: '/', label: 'Ülevaade', icon: LayoutDashboard, end: true, roles: ACCESS.DASHBOARD },
  { to: '/guide', label: 'Juhend', icon: Compass, roles: ACCESS.STAFF },
  { to: '/parent', label: 'Minu pere', icon: HeartHandshake, roles: ACCESS.PARENT },
  { to: '/student', label: 'Minu õpingud', icon: GraduationCap, roles: ACCESS.STUDENT },
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
  { to: '/finance', label: 'Finantsid', icon: CircleDollarSign, roles: ACCESS.FINANCE, group: 'Suhtlus ja raha' },
];

export const settingsNavigation = { to: '/settings', label: 'Seaded', icon: Settings, roles: ACCESS.ALL_AUTHENTICATED };
