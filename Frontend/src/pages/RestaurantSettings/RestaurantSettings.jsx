import { useState } from 'react';
import styles from './RestaurantSettings.module.css';
import RestaurantDetail, { RESTAURANT_TABS } from '../RestaurantDetail/RestaurantDetail.jsx';
import { go } from '../../router.js';
import { settingsDefaults } from '../../data/restaurants.js';

const ACCOUNT_TAB = { id: 'account', label: 'Account' };

export default function RestaurantSettings({ restaurants, restaurantId, tab, onUpdate, onDelete }) {
  const isAccount = tab === 'account';
  const selected = restaurantId ? restaurants.find((r) => r.id === restaurantId) : restaurants[0];
  const base = selected ? `#/restaurant-settings/${selected.id}` : '#/restaurant-settings';
  const tabs = [...RESTAURANT_TABS, ACCOUNT_TAB];

  let content;
  if (isAccount) {
    content = <AccountForm />;
  } else if (!selected) {
    content = (
      <p className={styles.empty}>
        {restaurants.length === 0
          ? 'No restaurants yet. Add one from My Restaurants.'
          : 'This restaurant doesn’t exist or was deleted.'}
      </p>
    );
  } else {
    // key resets edit mode when switching restaurant or section
    content = (
      <RestaurantDetail
        key={`${selected.id}-${tab}`}
        restaurant={selected}
        tab={tab}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <label className={styles.picker}>
          <span>Restaurant</span>
          <select
            value={selected?.id ?? ''}
            disabled={restaurants.length === 0}
            onChange={(e) => go(`#/restaurant-settings/${e.target.value}`)}
          >
            {restaurants.length === 0 && <option value="">No restaurants</option>}
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.layout}>
        <nav className={styles.panel} aria-label="Settings sections">
          {tabs.map((t) => {
            const active = t.id === tab;
            const href = t.id === 'account' ? '#/restaurant-settings/account' : `${base}/${t.id}`;
            return (
              <a
                key={t.id}
                href={href}
                className={`${styles.panelItem} ${active ? styles.panelActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {t.label}
              </a>
            );
          })}
        </nav>

        <div className={styles.content}>{content}</div>
      </div>
    </div>
  );
}

// General settings form (not tied to a single restaurant yet).
function AccountForm() {
  const [form, setForm] = useState(settingsDefaults);
  const [saved, setSaved] = useState(false);

  const CUISINES = ['Continental', 'North Indian', 'South Indian', 'Italian', 'Chinese', 'Fast Food'];

  const setField = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
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
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>General</h3>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Account name</span>
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