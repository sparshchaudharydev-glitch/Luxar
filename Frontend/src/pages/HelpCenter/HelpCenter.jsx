import { useMemo, useState } from 'react';
import styles from './HelpCenter.module.css';
import SearchInput from '../../components/SearchInput/SearchInput.jsx';
import { faqs } from '../../data/restaurants.js';

export default function HelpCenter() {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h2 className={styles.heading}>How can we help?</h2>
        <SearchInput value={query} onChange={setQuery} placeholder="Search help articles..." />
      </div>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Frequently asked questions</h3>

        {visible.length > 0 ? (
          visible.map((faq) => (
            <details key={faq.q} className={styles.item}>
              <summary className={styles.question}>{faq.q}</summary>
              <p className={styles.answer}>{faq.a}</p>
            </details>
          ))
        ) : (
          <p className={styles.empty}>No articles match “{query}”.</p>
        )}
      </section>
    </div>
  );
}
