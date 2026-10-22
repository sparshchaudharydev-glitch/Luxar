import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './RestaurantDetail.module.css';
import { MapIcon, TrashIcon } from '../../components/icons/Icons.jsx';
import { photoStyle } from '../../utils/photo.js';
import { go } from '../../router.js';
import { api } from '../../api/client.js';
import { SECTIONS } from './sections.jsx';
import SectionForm from './SectionForm.jsx';
import RestaurantPhotos from './RestaurantPhotos.jsx';

// Section tabs shown in the restaurant settings panel.
export const RESTAURANT_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    sections: [
      'interior', 'location', 'contact', 'timing', 'menu',
      'facilities', 'food', 'reviews', 'luxar',
    ],
  },
  { id: 'images', label: 'Images', sections: ['interior', 'food'] },
  { id: 'location', label: 'Location', sections: ['location'] },
  { id: 'contact', label: 'Contact', sections: ['contact'] },
  { id: 'timing', label: 'Timing', sections: ['timing'] },
  { id: 'menu', label: 'Menu', sections: ['menu'] },
  { id: 'facilities', label: 'Facilities', sections: ['facilities'] },
  { id: 'food-seating', label: 'Food & Seating', sections: ['food'] },
  { id: 'reviews', label: 'Reviews', sections: ['reviews'] },
  { id: 'luxar-partner', label: 'LUXAR Partner', sections: ['luxar'] },
];

// Sections that take more room on the overview grid.
const OVERVIEW_SPAN = {
  interior: styles.span2,
  luxar: styles.fullWidth,
};

export default function RestaurantDetail({
  restaurant,
  tab,
  onUpdate,
  onDelete,
}) {
  const { id, name, address, hue, details } = restaurant;
  const [editing, setEditing] = useState(false);
  const [photos, setPhotos] = useState([]);

  const current =
    RESTAURANT_TABS.find((t) => t.id === tab) ?? RESTAURANT_TABS[0];

  const isOverview = current.id === 'overview';
  const isImages = current.id === 'images';

  // Photos come from the gallery uploads, so the sections read them from here.
  const d = useMemo(
    () => ({
      ...details,
      interiorPhotos: photos
        .filter((p) => p.category === 'interior' || p.category === 'exterior')
        .map((p) => p.photo_url),
      foodPhotos: photos
        .filter((p) => p.category === 'food')
        .map((p) => p.photo_url),
    }),
    [details, photos]
  );

  const mainPhoto = photos.find((p) => p.category === 'main');

  const loadPhotos = useCallback(() => {
    api.listRestaurantPhotos(id)
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, [id]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleDelete = () => {
    if (window.confirm(`Delete ${name}? This can't be undone.`)) {
      onDelete(id);
      go('#/restaurants');
    }
  };

  // Saves the changed fields, then leaves edit mode.
  // Errors propagate to the form.
  const handleSave = async (changes) => {
    await onUpdate(id, changes);
    setEditing(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        {!editing && !isImages && (
          <button
            type="button"
            className={styles.editButton}
            onClick={() => setEditing(true)}
          >
            Edit details
          </button>
        )}

        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
        >
          <TrashIcon width={16} height={16} />
          Delete Restaurant
        </button>
      </div>

      <section className={styles.hero}>
        {mainPhoto ? (
          <img
            className={styles.heroPhoto}
            src={mainPhoto.photo_url}
            alt={`${name} cover photo`}
          />
        ) : (
          <div
            className={styles.heroImage}
            style={photoStyle(hue)}
            role="img"
            aria-label={`${name} cover photo`}
          />
        )}

        <div className={styles.heroInfo}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{name}</h2>
            {d.status === 'Active' && (
              <span className={styles.badge}>Active</span>
            )}
          </div>

          <p className={styles.address}>
            <MapIcon />
            {address}
          </p>
        </div>
      </section>

      {editing ? (
        <SectionForm
          restaurant={restaurant}
          sectionKeys={current.sections}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : isImages ? (
        <RestaurantPhotos
          restaurantId={id}
          photos={photos}
          onChanged={loadPhotos}
        />
      ) : (
        <div
          className={
            isOverview ? styles.overviewGrid : styles.sectionGrid
          }
        >
          {current.sections.map((key) => {
            const Section = SECTIONS[key];

            return (
              <div
                key={key}
                className={isOverview ? OVERVIEW_SPAN[key] : undefined}
              >
                <Section d={d} restaurant={restaurant} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}