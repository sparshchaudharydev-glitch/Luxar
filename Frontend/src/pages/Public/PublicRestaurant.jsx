import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import RestaurantDetails from '../Customer/RestaurantDetails.jsx';
import styles from '../Customer/RestaurantDetails.module.css';

// Opened when a phone scans a restaurant's QR code. No sign-in needed.
export default function PublicRestaurant({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .getRestaurant(id)
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className={styles.page}>
      <div className={styles.brand}>LUXAR</div>
      {error && (
        <p role="alert" className={styles.muted}>
          {error}
        </p>
      )}
      {!error && !data && <p className={styles.muted}>Loading…</p>}
      {data && <RestaurantDetails data={data} />}
    </div>
  );
}
