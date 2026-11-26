import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  Mail,
  Radar,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface AppNavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { to: '/dashboard', labelKey: 'nav.overview', icon: LayoutDashboard },
  { to: '/club-roi', labelKey: 'nav.clubRoi', icon: BarChart3 },
  { to: '/scouting', labelKey: 'nav.scouting', icon: Radar },
  { to: '/ucl-vs-domestic', labelKey: 'nav.ucl', icon: Trophy },
  { to: '/super-subs', labelKey: 'nav.superSubs', icon: Zap },
  { to: '/players', labelKey: 'nav.players', icon: Users },
  { to: '/transfers', labelKey: 'nav.transfers', icon: ArrowLeftRight },
  { to: '/system', labelKey: 'nav.system', icon: Activity },
  { to: '/contact', labelKey: 'nav.contact', icon: Mail },
];

export const TOP_NAV_ITEMS = APP_NAV_ITEMS.slice(0, 8);
