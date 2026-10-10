import { useEffect, useState } from 'react';
import styles from './AddRestaurantModal.module.css';

const emptyForm = { name: '', address: '' };

export default function AddRestaurantModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    onSubmit({ name: form.name.trim(), address: form.address.trim() });
    setForm(emptyForm);
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-restaurant-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="add-restaurant-title" className={styles.title}>
          Add Restaurant
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Name</span>
            <input value={form.name} onChange={update('name')} placeholder="e.g. The Spice House" autoFocus required />
          </label>
          <label className={styles.field}>
            <span>Location</span>
            <input value={form.address} onChange={update('address')} placeholder="e.g. Connaught Place, Delhi" required />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primary}>
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
