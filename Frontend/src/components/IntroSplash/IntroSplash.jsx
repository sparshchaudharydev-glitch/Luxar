import { useEffect, useState } from 'react';
import styles from './IntroSplash.module.css';

const LETTERS = 'LUXAR'.split('');
const SHOW_MS = 2600; // how long the animation plays before fading out
const FADE_MS = 600; // must match the fade-out animation duration in the CSS

export default function IntroSplash({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  // Start the fade-out after the animation has played.
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), SHOW_MS);
    return () => clearTimeout(timer);
  }, []);

  // Remove the splash once the fade-out has finished.
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(onDone, FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving, onDone]);

  // Click or press Esc to skip.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setLeaving(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={`${styles.intro} ${leaving ? styles.leaving : ''}`}
      onClick={() => setLeaving(true)}
      aria-hidden="true"
    >
      <div className={styles.glow} />

      <div className={styles.content}>
        <h1 className={styles.wordmark}>
          {LETTERS.map((letter, i) => (
            <span key={i} className={styles.letter} style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
              {letter}
            </span>
          ))}
        </h1>
        <span className={styles.rule} />
        <p className={styles.tagline}>Restaurant management, elevated</p>
      </div>

      <button type="button" className={styles.skip} tabIndex={-1}>
        Skip
      </button>
    </div>
  );
}
