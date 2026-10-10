import styles from './Sidebar.module.css';
import {
  ChevronDownIcon,
  ComboIcon,
  DashboardIcon,
  HelpIcon,
  LogoutIcon,
  MenuIcon,
  PanelIcon,
  SettingsIcon,
  UsersIcon,
} from '../icons/Icons.jsx';
import { currentLocation } from '../../data/restaurants.js';

const mainNav = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, href: '#/restaurants' },
  { id: 'settings', label: 'Restaurant Settings', icon: SettingsIcon, href: '#/restaurant-settings' },
  { id: 'employees', label: 'Employees', icon: UsersIcon, href: '#/employees' },
];

const manageNav = [
  { id: 'menu', label: 'Menu', icon: MenuIcon, href: '#/menu', hasChildren: true },
  { id: 'combo', label: 'Combo', icon: ComboIcon, href: '#/combo' },
];

function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <li>
      <a
        href={item.href}
        className={`${styles.navItem} ${active ? styles.active : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className={styles.navIcon} />
        <span className={styles.navLabel}>{item.label}</span>
        {item.hasChildren && <ChevronDownIcon className={styles.chevron} />}
      </a>
    </li>
  );
}

export default function Sidebar({ activeId, collapsed, onToggle }) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoMark} aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12c0-4 3-7 6-7 2 0 3 1 4 2 1-1 2-2 4-2 2 0 2 3 2 5 0 5-4 9-8 9-2 0-3-1-4-2-1 1-2 2-4 2" />
            </svg>
          </span>
          <span className={styles.logoText}>LUXAR</span>
        </div>
        <button type="button" className={styles.iconButton} onClick={onToggle} aria-label="Toggle sidebar">
          <PanelIcon />
        </button>
      </div>

      <div className={styles.location}>
        <div className={styles.locationAvatar} aria-hidden />
        <div className={styles.locationText}>
          <p className={styles.locationName}>{currentLocation.name}</p>
          <p className={styles.locationAddress}>{currentLocation.address}</p>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Switch location">
          <LogoutIcon />
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {mainNav.map((item) => (
            <NavItem key={item.id} item={item} active={activeId === item.id} />
          ))}
        </ul>

        <p className={styles.sectionLabel}>Manage</p>
        <ul className={styles.navList}>
          {manageNav.map((item) => (
            <NavItem key={item.id} item={item} active={activeId === item.id} />
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <p className={styles.sectionLabel}>Applications</p>
        <ul className={styles.navList}>
          <NavItem item={{ id: 'help', label: 'Help Center', icon: HelpIcon, href: '#/help' }} active={activeId === 'help'} />
        </ul>
      </div>
    </aside>
  );
}
