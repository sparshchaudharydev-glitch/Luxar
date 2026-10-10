import { useMemo, useState } from 'react';
import styles from './Menu.module.css';
import { menuItems as initialItems } from '../../data/restaurants.js';

export default function Menu() {
  const [items, setItems] = useState(initialItems);
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(initialItems.map((i) => i.category))], []);

  const visible = category === 'All' ? items : items.filter((i) => i.category === category);
  const vegCount = items.filter((i) => i.type === 'veg').length;

  const toggleAvailable = (id) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  };

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total items</span>
          <span className={styles.statValue}>{items.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Veg / Non-veg</span>
          <span className={styles.statValue}>
            {vegCount} / {items.length - vegCount}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Unavailable</span>
          <span className={styles.statValue}>{items.filter((i) => !i.available).length}</span>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === category}
            className={`${styles.tab} ${c === category ? styles.tabActive : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className={styles.list}>
        {visible.map((item) => (
          <li key={item.id} className={`${styles.item} ${!item.available ? styles.dimmed : ''}`}>
            <span className={`${styles.typeDot} ${item.type === 'veg' ? styles.veg : styles.nonVeg}`} aria-label={item.type} />
            <div className={styles.info}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.category}>{item.category}</span>
            </div>
            <span className={styles.price}>₹{item.price}</span>
            <button
              type="button"
              className={`${styles.availability} ${item.available ? styles.on : ''}`}
              onClick={() => toggleAvailable(item.id)}
              aria-pressed={item.available}
            >
              {item.available ? 'Available' : 'Sold out'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
