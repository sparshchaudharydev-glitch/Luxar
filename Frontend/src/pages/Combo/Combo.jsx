import { useState } from 'react';
import styles from './Combo.module.css';
import { combos as initialCombos } from '../../data/restaurants.js';

export default function Combo() {
  const [combos, setCombos] = useState(initialCombos);

  const toggleActive = (id) => {
    setCombos((list) => list.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  return (
    <div className={styles.page}>
      <p className={styles.intro}>Bundle dishes into combos that customers can order in one tap.</p>

      <div className={styles.grid}>
        {combos.map((combo) => (
          <article key={combo.id} className={`${styles.card} ${!combo.active ? styles.paused : ''}`}>
            <header className={styles.header}>
              <h3 className={styles.name}>{combo.name}</h3>
              <span className={combo.active ? styles.live : styles.off}>{combo.active ? 'Live' : 'Paused'}</span>
            </header>

            <ul className={styles.items}>
              {combo.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <footer className={styles.footer}>
              <span className={styles.price}>₹{combo.price.toLocaleString('en-IN')}</span>
              <button type="button" className={styles.toggle} onClick={() => toggleActive(combo.id)}>
                {combo.active ? 'Pause combo' : 'Activate combo'}
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
