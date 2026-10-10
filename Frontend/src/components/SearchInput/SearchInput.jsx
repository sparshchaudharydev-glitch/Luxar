import styles from './SearchInput.module.css';
import { SearchIcon } from '../icons/Icons.jsx';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <label className={styles.wrapper}>
      <SearchIcon className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
