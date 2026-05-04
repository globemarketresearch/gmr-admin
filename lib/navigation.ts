import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Users,
  UserCog,
  MessageSquare,
  Megaphone,
  Trash2,
  Tag,
  Search,
  ArrowRightLeft,
  ShoppingCart,
  ScrollText,
} from 'lucide-react';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'editor', 'viewer'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'editor'],
    children: [
      {
        title: 'All Reports',
        href: '/reports',
        icon: FileText,
        roles: ['admin', 'editor'],
      },
      {
        title: 'Create Report',
        href: '/reports/new',
        icon: FileText,
        roles: ['admin', 'editor'],
      },
      {
        title: 'Trash',
        href: '/reports/trash',
        icon: Trash2,
        roles: ['admin', 'editor'],
      },
    ],
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: PenSquare,
    roles: ['admin', 'editor'],
    children: [
      {
        title: 'All Posts',
        href: '/blog',
        icon: PenSquare,
        roles: ['admin', 'editor'],
      },
      {
        title: 'Create Post',
        href: '/blog/new',
        icon: PenSquare,
        roles: ['admin', 'editor'],
      },
      {
        title: 'Trash',
        href: '/blog/trash',
        icon: Trash2,
        roles: ['admin', 'editor'],
      },
    ],
  },
  {
    title: 'Press Releases',
    href: '/press-releases',
    icon: Megaphone,
    roles: ['admin', 'editor'],
    children: [
      {
        title: 'All Press Releases',
        href: '/press-releases',
        icon: Megaphone,
        roles: ['admin', 'editor'],
      },
      {
        title: 'Create Press Release',
        href: '/press-releases/new',
        icon: Megaphone,
        roles: ['admin', 'editor'],
      },
      {
        title: 'Trash',
        href: '/press-releases/trash',
        icon: Trash2,
        roles: ['admin', 'editor'],
      },
    ],
  },
  // {
  //   title: 'Charts',
  //   href: '/charts',
  //   icon: BarChart3,
  //   roles: ['admin', 'editor'],
  // },
  // {
  //   title: 'Media',
  //   href: '/media',
  //   icon: Image,
  //   roles: ['admin', 'editor'],
  // },
  {
    title: 'SEO',
    href: '/seo',
    icon: Search,
    roles: ['admin', 'editor'],
    children: [
      // {
      //   title: 'Overview',
      //   href: '/seo',
      //   icon: Search,
      //   roles: ['admin', 'editor'],
      // },
      {
        title: 'Redirects',
        href: '/seo/redirects',
        icon: ArrowRightLeft,
        roles: ['admin', 'editor'],
      },
    ],
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    roles: ['admin', 'editor'],
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: MessageSquare,
    roles: ['admin', 'editor'],
  },
  // {
  //   title: 'Pricing',
  //   href: '/pricing',
  //   icon: DollarSign,
  //   roles: ['admin'],
  // },
  {
    title: 'User Management',
    href: '/users',
    icon: UserCog,
    roles: ['admin'],
  },
  {
    title: 'Activity Logs',
    href: '/activity-logs',
    icon: ScrollText,
    roles: ['admin'],
  },
  {
    title: 'Research Team',
    href: '/authors',
    icon: Users,
    roles: ['admin', 'editor'],
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: Tag,
    roles: ['admin', 'editor', 'viewer'],
  },
  // {
  //   title: 'Chart Generator POC',
  //   href: '/chart-generator',
  //   icon: BarChart3,
  //   roles: ['admin', 'editor'],
  // },
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  //   roles: ['admin'],
  // },
];

export function filterNavigationByRole(
  items: NavigationItem[],
  userRole: UserRole
): NavigationItem[] {
  return items
    .filter(item => item.roles.includes(userRole))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterNavigationByRole(item.children, userRole),
        };
      }
      return item;
    });
}
