import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { normalizeRestaurant } from '../../data/restaurants.js';
import styles from '../QrCodes/QrCodesPage.module.css';
import customerStyles from './CustomerApp.module.css';

// Customer screen: only the backend-generated QR code of each restaurant.
export default function RestaurantQrList() {
  const [restaurants, setRestaurants] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listRestaurants()
      .then((data) => {
        if (!cancelled) setRestaurants(Object.entries(data).map(([id, raw]) => normalizeRestaurant(id, raw)));
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert" className={customerStyles.error}>Could not load restaurants: {error}</p>;
  if (!restaurants) return <p className={customerStyles.text}>Loading restaurants…</p>;

  return (
    <div className={styles.grid}>
      {restaurants.map((r) => (
        <article key={r.id} className={styles.card}>
          <h3 className={styles.title}>{r.name}</h3>
          <img className={styles.qr} src={api.restaurantQrUrl(r.id)} alt={`QR code for ${r.name}`} />
        </article>
      ))}
    </div>
  );
}
