import styles from './RestaurantDetail.module.css';
import { StarIcon } from '../../components/icons/Icons.jsx';
import { photoStyle } from '../../utils/photo.js';

function Card({ title, action, children }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className={styles.kv}>
      <span className={styles.kvLabel}>{label}</span>
      <span className={styles.kvValue}>{value || '—'}</span>
    </div>
  );
}

function Empty({ children }) {
  return <p className={styles.cardText}>{children}</p>;
}

// Shows uploaded photo URLs, or a placeholder tile for each entry if there's no URL.
function PhotoGrid({ urls, hue, label }) {
  return (
    <div className={styles.photoGrid}>
      {urls.map((url, i) =>
        url ? (
          <img key={i} className={styles.photo} src={url} alt={label} />
        ) : (
          <div key={i} className={styles.photo} style={photoStyle(hue, i)} role="img" aria-label={label} />
        )
      )}
    </div>
  );
}

function Interior({ d, restaurant }) {
  return (
    <Card
      title="1. Interior & Exterior Photos"
      action={<a className={styles.link} href={`#/restaurant-settings/${restaurant.id}/images`}>View All</a>}
    >
      {d.interiorPhotos.length === 0 ? (
        <Empty>No photos added yet.</Empty>
      ) : (
        <PhotoGrid urls={d.interiorPhotos} hue={restaurant.hue} label="Restaurant photo" />
      )}
    </Card>
  );
}

function Location({ restaurant }) {
  const query = encodeURIComponent(restaurant.address);
  return (
    <Card title="2. Location">
      <div className={styles.map}>
        {restaurant.details.coords ? (
          <>
            <span className={styles.pin} aria-hidden />
            <span className={styles.coords}>
              {restaurant.details.coords.lat.toFixed(4)}, {restaurant.details.coords.lng.toFixed(4)}
            </span>
          </>
        ) : (
          <span className={styles.mapEmpty}>Not pinned yet</span>
        )}
      </div>
      <p className={styles.cardText}>{restaurant.address}</p>
      <a
        className={styles.link}
        href={`https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noreferrer"
      >
        View on Google Maps
      </a>
    </Card>
  );
}

function Contact({ d }) {
  return (
    <Card title="3. Contact">
      <KeyValue label="Phone" value={d.contact.phone} />
      <KeyValue label="WhatsApp" value={d.contact.whatsapp} />
      <KeyValue label="Instagram" value={d.contact.instagram} />
    </Card>
  );
}

function Timing({ d }) {
  return (
    <Card title="4. Timing">
      <KeyValue label="Opening" value={d.timing.opening} />
      <KeyValue label="Closing" value={d.timing.closing} />
      <KeyValue label="Weekly Off" value={d.timing.weeklyOff} />
    </Card>
  );
}

function Menu({ d }) {
  return (
    <Card title="5. Menu (Total Count)">
      <KeyValue label="Veg Dishes" value={d.menu.veg} />
      <KeyValue label="Non-Veg Dishes" value={d.menu.nonVeg} />
      <KeyValue label="Shakes" value={d.menu.shakes} />
    </Card>
  );
}

function Facilities({ d }) {
  return (
    <Card title="6. Facilities">
      {d.facilities.length === 0 ? (
        <Empty>No facilities added yet.</Empty>
      ) : (
        <ul className={styles.facilityList}>
          {d.facilities.map((f) => (
            <li key={f.label} className={styles.facility}>
              <span className={styles.kvLabel}>{f.label}</span>
              <span className={f.available ? styles.yes : styles.no}>{f.available ? '✓' : '—'}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Food({ d, restaurant }) {
  return (
    <Card
      title="7. Food & Seating Photos"
      action={<a className={styles.link} href={`#/restaurant-settings/${restaurant.id}/food-seating`}>View All</a>}
    >
      {d.foodPhotos.length === 0 ? (
        <Empty>No photos added yet.</Empty>
      ) : (
        <PhotoGrid urls={d.foodPhotos} hue={restaurant.hue + 20} label="Food or seating photo" />
      )}
    </Card>
  );
}

function Reviews({ d, restaurant }) {
  const hasRating = d.reviews.rating != null;
  return (
    <Card title="8. Reviews & Ratings">
      {hasRating ? (
        <div className={styles.ratingRow}>
          <span className={styles.bigRating}>
            <StarIcon width={20} height={20} />
            {d.reviews.rating.toFixed(1)} / 5
          </span>
          <span className={styles.cardText}>({d.reviews.count} reviews)</span>
        </div>
      ) : (
        <Empty>No reviews yet.</Empty>
      )}
      <a className={styles.outlineButton} href={`#/restaurant-settings/${restaurant.id}/reviews`}>
        View Reviews
      </a>
    </Card>
  );
}

function Luxar({ d }) {
  return (
    <Card title="9. LUXAR Partner">
      <span className={d.luxarPartner ? styles.pillYes : styles.pillNo}>{d.luxarPartner ? 'Yes' : 'No'}</span>
    </Card>
  );
}

// Sections that take the whole restaurant (for address and links) get it as a prop.
export const SECTIONS = {
  interior: Interior,
  location: Location,
  contact: Contact,
  timing: Timing,
  menu: Menu,
  facilities: Facilities,
  food: Food,
  reviews: Reviews,
  luxar: Luxar,
};
