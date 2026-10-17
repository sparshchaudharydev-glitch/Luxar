import styles from './Sidebar.module.css';
import { DashboardIcon, LogoutIcon, PanelIcon, QrIcon, SettingsIcon } from '../icons/Icons.jsx';

const mainNav = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, href: '#/restaurants' },
  { id: 'settings', label: 'Restaurant Settings', icon: SettingsIcon, href: '#/restaurant-settings' },
  { id: 'qr', label: 'QR Codes', icon: QrIcon, href: '#/qr-codes' },
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
      </a>
    </li>
  );
}

export default function Sidebar({ activeId, collapsed, onToggle, onLogout }) {
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

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {mainNav.map((item) => (
            <NavItem key={item.id} item={item} active={activeId === item.id} />
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <ul className={styles.navList}>
          <li>
            <button type="button" className={styles.navItem} onClick={onLogout}>
              <LogoutIcon className={styles.navIcon} />
              <span className={styles.navLabel}>Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
