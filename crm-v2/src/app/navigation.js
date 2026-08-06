import { BookOpen, CalendarDays, CircleDollarSign, GraduationCap, HeartHandshake, Layers3, LibraryBig, LayoutDashboard, MessageSquareText, Settings, UserRoundCog, Users, Video } from 'lucide-react';
import { ACCESS } from './accessPolicy.js';

export const navigation = [
  { to: '/', label: 'Ülevaade', icon: LayoutDashboard, end: true, roles: ACCESS.DASHBOARD },
  { to: '/parent', label: 'Minu pere', icon: HeartHandshake, roles: ACCESS.PARENT },
  { to: '/student', label: 'Minu õpingud', icon: GraduationCap, roles: ACCESS.STUDENT },
  { to: '/students', label: 'Õpilased', icon: Users, roles: ACCESS.STAFF },
  { to: '/calendar', label: 'Kalender', icon: CalendarDays, roles: ACCESS.STAFF },
  { to: '/groups', label: 'Grupid', icon: Layers3, roles: ACCESS.STAFF },
  { to: '/parents', label: 'Lapsevanemad', icon: HeartHandshake, roles: ACCESS.STAFF },
  { to: '/library', label: 'Õppevara', icon: LibraryBig, roles: ACCESS.STAFF },
  { to: '/live-classroom', label: 'Live Classroom', icon: Video, roles: ACCESS.STAFF },
  { to: '/teachers', label: 'Õpetajad', icon: UserRoundCog, roles: ACCESS.ADMIN },
  { to: '/homework', label: 'Kodutööd', icon: BookOpen, roles: ACCESS.HOMEWORK },
  { to: '/finance', label: 'Finantsid', icon: CircleDollarSign, roles: ACCESS.FINANCE },
  { to: '/messages', label: 'Sõnumid', icon: MessageSquareText, roles: ACCESS.MESSAGES },
];

export const settingsNavigation = { to: '/settings', label: 'Seaded', icon: Settings, roles: ACCESS.ALL_AUTHENTICATED };
