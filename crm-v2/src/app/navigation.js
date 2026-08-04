import { BookOpen, CalendarDays, CircleDollarSign, Layers3, LibraryBig, LayoutDashboard, MessageSquareText, Settings, UserRoundCog, Users } from 'lucide-react';
import { ROLES } from '../utils/roles.js';

export const navigation = [
  { to: '/', label: 'Ülevaade', icon: LayoutDashboard, end: true, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.FINANCE] },
  { to: '/students', label: 'Õpilased', icon: Users, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { to: '/calendar', label: 'Kalender', icon: CalendarDays, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { to: '/groups', label: 'Grupid', icon: Layers3, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { to: '/library', label: 'Õppevara', icon: LibraryBig, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { to: '/teachers', label: 'Õpetajad', icon: UserRoundCog, roles: [ROLES.ADMIN] },
  { to: '/homework', label: 'Kodutööd', icon: BookOpen, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT] },
  { to: '/finance', label: 'Finantsid', icon: CircleDollarSign, roles: [ROLES.ADMIN, ROLES.FINANCE] },
  { to: '/messages', label: 'Sõnumid', icon: MessageSquareText, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT] },
];

export const settingsNavigation = { to: '/settings', label: 'Seaded', icon: Settings, roles: [ROLES.ADMIN] };
