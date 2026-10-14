import styles from './RestaurantCard.module.css';
import { MapIcon, PeopleIcon, StarIcon, TrashIcon } from '../icons/Icons.jsx';
import { photoStyle } from '../../utils/photo.js';
import { go } from '../../router.js';

export default function RestaurantCard({ restaurant, onDelete }) {
  const { id, name, address, rating, employees, hue } = restaurant;
  const open = () => go(`#/restaurant-settings/${id}`);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') open();
  };

  return (
    <article
      className={styles.card}
      onClick={open}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Open ${name}`}
    >
      <div className={styles.image} style={photoStyle(hue)} role="img" aria-label={`${name} photo`}>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          aria-label={`Delete ${name}`}
        >
          <TrashIcon />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <h3 className={styles.name} title={name}>
            {name}
          </h3>
          {rating != null && (
            <span className={styles.rating} aria-label={`Rating ${rating.toFixed(1)}`}>
              <StarIcon />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className={styles.meta}>
          <MapIcon className={styles.metaIcon} />
          <span>{address}</span>
        </p>
        <p className={styles.meta}>
          <PeopleIcon className={styles.metaIcon} />
          <span>{employees != null ? `${employees} Employees` : 'Employees not added'}</span>
        </p>
      </div>
    </article>
  );
}
