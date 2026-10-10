import { useMemo, useState } from 'react';
import styles from './Employees.module.css';
import SearchInput from '../../components/SearchInput/SearchInput.jsx';
import { employees } from '../../data/restaurants.js';

const ROLES = ['All roles', ...new Set(employees.map((e) => e.role))];

export default function Employees() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All roles');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter(
      (e) =>
        (role === 'All roles' || e.role === role) &&
        (!q || e.name.toLowerCase().includes(q) || e.restaurant.toLowerCase().includes(q))
    );
  }, [query, role]);

  const activeCount = employees.filter((e) => e.status === 'Active').length;

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total employees</span>
          <span className={styles.statValue}>{employees.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Active</span>
          <span className={styles.statValue}>{activeCount}</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or restaurant..." />
        <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Restaurant</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className={styles.person}>
                    <span className={styles.avatar} aria-hidden>
                      {e.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')}
                    </span>
                    {e.name}
                  </div>
                </td>
                <td>{e.role}</td>
                <td>{e.restaurant}</td>
                <td>
                  <span className={`${styles.status} ${styles[e.status.replace(' ', '')]}`}>{e.status}</span>
                </td>
                <td className={styles.muted}>{e.joined}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  No employees match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
