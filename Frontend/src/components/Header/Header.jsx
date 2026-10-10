import styles from './Header.module.css';
import { BellIcon } from '../icons/Icons.jsx';
import { currentUser } from '../../data/restaurants.js';

export default function Header({ title, restaurantCount }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <button type="button" className={styles.bell} aria-label="Notifications">
          <BellIcon />
          <span className={styles.dot} aria-hidden />
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {currentUser.initials}
          </div>
          <div className={styles.profileText}>
            <p className={styles.name}>{currentUser.name}</p>
            <p className={styles.meta}>{restaurantCount} Restaurants</p>
          </div>
        </div>
      </div>
    </header>
  );
}
