import { normalizeRestaurant } from '../../data/restaurants.js';
import styles from './RestaurantDetails.module.css';

// Shows one restaurant's details. Used by the customer scanner and the public QR page.
export default function RestaurantDetails({ data }) {
  const r = normalizeRestaurant(data.id ?? '', data);
  const d = r.details;

  const hours = d.timing.opening || d.timing.closing ? `${d.timing.opening || '—'} – ${d.timing.closing || '—'}` : '';
  const contacts = [
    d.contact.phone && `Phone: ${d.contact.phone}`,
    d.contact.whatsapp && `WhatsApp: ${d.contact.whatsapp}`,
    d.contact.instagram && `Instagram: ${d.contact.instagram}`,
  ].filter(Boolean);
  const menuCounts = [
    d.menu.veg > 0 && `${d.menu.veg} veg`,
    d.menu.nonVeg > 0 && `${d.menu.nonVeg} non-veg`,
    d.menu.shakes > 0 && `${d.menu.shakes} shakes`,
  ].filter(Boolean);
  const facilities = (d.facilities ?? [])
    .map((f) => (typeof f === 'string' ? { label: f } : f))
    .filter((f) => f.available !== false)
    .map((f) => f.label);

  return (
    <section className={styles.card}>
      <h2 className={styles.name}>{r.name}</h2>
      {r.address && <p className={styles.muted}>{r.address}</p>}
      {r.rating != null && (
        <p className={styles.rating}>
          ★ {r.rating}
          {d.reviews.count ? ` · ${d.reviews.count} reviews` : ''}
        </p>
      )}

      <Row label="Hours" value={hours} />
      <Row label="Weekly off" value={d.timing.weeklyOff} />
      <Row label="Menu" value={menuCounts.join(' · ')} />
      <Row label="Contact" value={contacts.join('\n')} />
      <Row label="Facilities" value={facilities.join(', ')} />
    </section>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}
