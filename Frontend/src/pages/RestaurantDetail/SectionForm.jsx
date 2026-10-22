import { useState } from 'react';
import styles from './SectionForm.module.css';

// Which form fields each section uses. Photos are added on the Images tab, not here.
const ALL_KEYS = ['location', 'contact', 'timing', 'menu', 'facilities', 'reviews', 'luxar'];

// Builds the form state from a restaurant (UI shape, camelCase).
function initialForm(restaurant) {
  const d = restaurant.details;
  return {
    name: restaurant.name,
    address: restaurant.address,
    lat: d.coords?.lat ?? '',
    lng: d.coords?.lng ?? '',
    phone: d.contact.phone,
    whatsapp: d.contact.whatsapp,
    instagram: d.contact.instagram,
    opening: d.timing.opening,
    closing: d.timing.closing,
    weeklyOff: d.timing.weeklyOff,
    veg: d.menu.veg,
    nonVeg: d.menu.nonVeg,
    shakes: d.menu.shakes,
    facilities: d.facilities.map((f) => ({ ...f })),
    rating: restaurant.rating ?? '',
    reviewCount: d.reviews.count ?? 0,
    luxarPartner: d.luxarPartner,
  };
}

const toNumberOrNull = (value) => (value === '' || value == null ? null : Number(value));
const toIntOrZero = (value) => (value === '' || value == null ? 0 : parseInt(value, 10));

// Converts form state into the snake_case body the backend expects.
// Only includes the fields for the sections being edited.
function buildPayload(form, sectionKeys) {
  const has = (key) => sectionKeys.includes(key);
  const payload = {};

  if (has('location')) {
    payload.name = form.name.trim();
    payload.location = form.address.trim();
    payload.lat = toNumberOrNull(form.lat);
    payload.lng = toNumberOrNull(form.lng);
  }
  if (has('contact')) {
    payload.phone = form.phone.trim();
    payload.whatsapp = form.whatsapp.trim();
    payload.instagram = form.instagram.trim();
  }
  if (has('timing')) {
    payload.opening = form.opening;
    payload.closing = form.closing;
    payload.weekly_off = form.weeklyOff.trim();
  }
  if (has('menu')) {
    payload.veg_dishes = toIntOrZero(form.veg);
    payload.non_veg_dishes = toIntOrZero(form.nonVeg);
    payload.shakes = toIntOrZero(form.shakes);
  }
  if (has('facilities')) {
    payload.facilities = form.facilities
      .filter((f) => f.label.trim())
      .map((f) => ({ label: f.label.trim(), available: f.available }));
  }
  if (has('reviews')) {
    payload.rating = toNumberOrNull(form.rating);
    payload.review_count = toIntOrZero(form.reviewCount);
  }
  if (has('luxar')) payload.luxar_partner = form.luxarPartner;

  return payload;
}

export default function SectionForm({ restaurant, sectionKeys = ALL_KEYS, onSave, onCancel }) {
  const [form, setForm] = useState(() => initialForm(restaurant));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const has = (key) => sectionKeys.includes(key);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateFacility = (index, changes) => {
    setForm((f) => ({
      ...f,
      facilities: f.facilities.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    }));
  };

  const addFacility = () => {
    setForm((f) => ({ ...f, facilities: [...f.facilities, { label: '', available: true }] }));
  };

  const removeFacility = (index) => {
    setForm((f) => ({ ...f, facilities: f.facilities.filter((_, i) => i !== index) }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(buildPayload(form, sectionKeys));
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {has('location') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Location</h3>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Restaurant name</span>
              <input value={form.name} onChange={set('name')} required />
            </label>
            <label className={styles.field}>
              <span>Address</span>
              <input value={form.address} onChange={set('address')} required />
            </label>
            <label className={styles.field}>
              <span>Latitude</span>
              <input type="number" step="any" min="-90" max="90" value={form.lat} onChange={set('lat')} placeholder="e.g. 28.6315" />
            </label>
            <label className={styles.field}>
              <span>Longitude</span>
              <input type="number" step="any" min="-180" max="180" value={form.lng} onChange={set('lng')} placeholder="e.g. 77.2167" />
            </label>
          </div>
        </section>
      )}

      {has('contact') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Contact</h3>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Phone</span>
              <input value={form.phone} onChange={set('phone')} />
            </label>
            <label className={styles.field}>
              <span>WhatsApp</span>
              <input value={form.whatsapp} onChange={set('whatsapp')} />
            </label>
            <label className={styles.field}>
              <span>Instagram</span>
              <input value={form.instagram} onChange={set('instagram')} placeholder="@handle" />
            </label>
          </div>
        </section>
      )}

      {has('timing') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Timing</h3>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Opening time</span>
              <input type="time" value={form.opening} onChange={set('opening')} />
            </label>
            <label className={styles.field}>
              <span>Closing time</span>
              <input type="time" value={form.closing} onChange={set('closing')} />
            </label>
            <label className={styles.field}>
              <span>Weekly off</span>
              <input value={form.weeklyOff} onChange={set('weeklyOff')} placeholder="e.g. Monday" />
            </label>
          </div>
        </section>
      )}

      {has('menu') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Menu counts</h3>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Veg dishes</span>
              <input type="number" min="0" value={form.veg} onChange={set('veg')} />
            </label>
            <label className={styles.field}>
              <span>Non-veg dishes</span>
              <input type="number" min="0" value={form.nonVeg} onChange={set('nonVeg')} />
            </label>
            <label className={styles.field}>
              <span>Shakes</span>
              <input type="number" min="0" value={form.shakes} onChange={set('shakes')} />
            </label>
          </div>
        </section>
      )}

      {has('facilities') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Facilities</h3>
          <div className={styles.facilityList}>
            {form.facilities.map((item, i) => (
              <div key={i} className={styles.facilityRow}>
                <input
                  value={item.label}
                  onChange={(e) => updateFacility(i, { label: e.target.value })}
                  placeholder="e.g. Parking"
                  aria-label="Facility name"
                />
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) => updateFacility(i, { available: e.target.checked })}
                  />
                  Available
                </label>
                <button type="button" className={styles.linkDanger} onClick={() => removeFacility(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.secondary} onClick={addFacility}>
            + Add facility
          </button>
        </section>
      )}

      {has('reviews') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Reviews & ratings</h3>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Rating (0 to 5)</span>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={set('rating')} />
            </label>
            <label className={styles.field}>
              <span>Number of reviews</span>
              <input type="number" min="0" value={form.reviewCount} onChange={set('reviewCount')} />
            </label>
          </div>
        </section>
      )}

      {has('luxar') && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>LUXAR partner</h3>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={form.luxarPartner} onChange={set('luxarPartner')} />
            This restaurant is a LUXAR partner
          </label>
        </section>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.secondary} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className={styles.primary} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}