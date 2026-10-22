import { useRef, useState } from 'react';
import styles from './RestaurantPhotos.module.css';
import { api } from '../../api/client.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function PhotoGrid({ items, busy, onDelete }) {
  if (items.length === 0) {
    return <p className={styles.empty}>No photos yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {items.map((photo) => (
        <div key={photo.id} className={styles.item}>
          <img className={styles.thumb} src={photo.photo_url} alt={photo.category} />
          <span className={styles.tag}>{photo.category}</span>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onDelete(photo)}
            disabled={busy}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default function RestaurantPhotos({ restaurantId, photos, onChanged }) {
  const inputRef = useRef(null);
  const [target, setTarget] = useState(null);
  const [interiorType, setInteriorType] = useState('interior');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const inCategories = (cats) => photos.filter((p) => cats.includes(p.category));

  const openPicker = (category) => {
    setError(null);
    setTarget(category);
    inputRef.current?.click();
  };

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !target) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Photo must be 5 MB or smaller.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await api.uploadRestaurantPhoto(restaurantId, target, file);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(photo) {
    if (!window.confirm('Remove this photo?')) return;
    setError(null);
    setBusy(true);
    try {
      await api.deletePhoto(photo.id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Cover photo</h3>
            <p className={styles.hint}>Shown at the top. Uploading a new one replaces the old one.</p>
          </div>
          <button
            type="button"
            className={styles.primary}
            onClick={() => openPicker('main')}
            disabled={busy}
          >
            Upload cover
          </button>
        </header>
        <PhotoGrid items={inCategories(['main'])} busy={busy} onDelete={handleDelete} />
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Interior & exterior</h3>
            <p className={styles.hint}>Inside and outside shots of the restaurant.</p>
          </div>
          <div className={styles.actions}>
            <select
              className={styles.select}
              value={interiorType}
              onChange={(e) => setInteriorType(e.target.value)}
              disabled={busy}
            >
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
            <button
              type="button"
              className={styles.primary}
              onClick={() => openPicker(interiorType)}
              disabled={busy}
            >
              Upload
            </button>
          </div>
        </header>
        <PhotoGrid items={inCategories(['interior', 'exterior'])} busy={busy} onDelete={handleDelete} />
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Food & seating</h3>
            <p className={styles.hint}>Dishes and seating areas.</p>
          </div>
          <button
            type="button"
            className={styles.primary}
            onClick={() => openPicker('food')}
            disabled={busy}
          >
            Upload
          </button>
        </header>
        <PhotoGrid items={inCategories(['food'])} busy={busy} onDelete={handleDelete} />
      </section>
    </div>
  );
}