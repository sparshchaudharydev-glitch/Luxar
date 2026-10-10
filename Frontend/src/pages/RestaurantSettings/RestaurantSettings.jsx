import { useState } from 'react';
import styles from './RestaurantSettings.module.css';
import { settingsDefaults } from '../../data/restaurants.js';

const CUISINES = ['Continental', 'North Indian', 'South Indian', 'Italian', 'Chinese', 'Fast Food'];
const CURRENCIES = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)'];

export default function RestaurantSettings() {
  const [form, setForm] = useState(settingsDefaults);
  const [saved, setSaved] = useState(false);

  const setField = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const toggleField = (key) => () => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: !f[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  const handleReset = () => {
    setForm(settingsDefaults);
    setSaved(false);
  };

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <p className={styles.intro}>Update the details, hours and preferences for this restaurant.</p>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>General</h3>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Restaurant name</span>
            <input value={form.name} onChange={setField('name')} required />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" value={form.email} onChange={setField('email')} />
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input value={form.phone} onChange={setField('phone')} />
          </label>
          <label className={styles.field}>
            <span>Cuisine</span>
            <select value={form.cuisine} onChange={setField('cuisine')}>
              {CUISINES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Currency</span>
            <select value={form.currency} onChange={setField('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Operations</h3>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Opening time</span>
            <input type="time" value={form.opening} onChange={setField('opening')} />
          </label>
          <label className={styles.field}>
            <span>Closing time</span>
            <input type="time" value={form.closing} onChange={setField('closing')} />
          </label>
        </div>

        <div className={styles.toggles}>
          <Toggle
            label="Accept online orders"
            description="Customers can place orders from the app."
            checked={form.onlineOrdering}
            onChange={toggleField('onlineOrdering')}
          />
          <Toggle
            label="Order notifications"
            description="Get alerted when a new order comes in."
            checked={form.notifications}
            onChange={toggleField('notifications')}
          />
        </div>
      </section>

      <div className={styles.footer}>
        {saved && <span className={styles.saved}>Changes saved</span>}
        <button type="button" className={styles.secondary} onClick={handleReset}>
          Reset
        </button>
        <button type="submit" className={styles.primary}>
          Save changes
        </button>
      </div>
    </form>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <span className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className={styles.toggleInput} />
      <span className={styles.track} aria-hidden>
        <span className={styles.thumb} />
      </span>
    </label>
  );
}
