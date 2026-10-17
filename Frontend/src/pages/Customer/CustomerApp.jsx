import styles from './CustomerApp.module.css';
import RestaurantQrList from './RestaurantQrList.jsx';

// Customer view: only the QR code of each restaurant. Customers scan them with their own phone.
export default function CustomerApp({ onLogout }) {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.logo}>LUXAR</span>
        <div className={styles.right}>
          <button type="button" className={styles.logout} onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.stack}>
          <RestaurantQrList />
        </div>
      </main>
    </div>
  );
}
