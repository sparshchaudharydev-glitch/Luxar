import { useMemo, useState } from 'react';
import styles from './RestaurantsPage.module.css';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard.jsx';
import SearchInput from '../../components/SearchInput/SearchInput.jsx';
import AddRestaurantModal from '../../components/AddRestaurantModal/AddRestaurantModal.jsx';
import { PlusIcon } from '../../components/icons/Icons.jsx';

export default function RestaurantsPage({ restaurants, onDelete, onAdd }) {
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)
    );
  }, [restaurants, query]);

  return (
    <div>
      <div className={styles.toolbar}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name..." />
        <button type="button" className={styles.addButton} onClick={() => setIsAdding(true)}>
          <PlusIcon width={16} height={16} />
          Add Restaurants
        </button>
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>
            {restaurants.length === 0
              ? 'No restaurants yet. Click “Add Restaurants” to create your first one.'
              : `No restaurants match “${query}”.`}
          </p>
        </div>
      )}

      <AddRestaurantModal
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onSubmit={(data) => {
          onAdd(data);
          setIsAdding(false);
        }}
      />
    </div>
  );
}
