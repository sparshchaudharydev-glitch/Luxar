import styles from './Header.module.css';

// "Martin Franci" -> "MF". Falls back to "?" when no name is available.
function initialsOf(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export default function Header({ title, restaurantCount, userName }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {initialsOf(userName)}
          </div>
          <div className={styles.profileText}>
            <p className={styles.name}>{userName || 'Owner'}</p>
            <p className={styles.meta}>{restaurantCount} Restaurants</p>
          </div>
        </div>
      </div>
    </header>
  );
}
