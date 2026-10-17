import { useCallback, useEffect, useState } from 'react';
import styles from './App.module.css';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import { useRoute } from './router.js';
import { api } from './api/client.js';
import { normalizeRestaurant } from './data/restaurants.js';
import RestaurantsPage from './pages/RestaurantsPage/RestaurantsPage.jsx';
import RestaurantSettings from './pages/RestaurantSettings/RestaurantSettings.jsx';
import QrCodesPage from './pages/QrCodes/QrCodesPage.jsx';

// Maps each page to its header title and the sidebar item it highlights.
const PAGE_META = {
  restaurants: { title: 'My Restaurants', nav: 'dashboard' },
  'restaurant-settings': { title: 'Restaurant Settings', nav: 'settings' },
  'qr-codes': { title: 'QR Codes', nav: 'qr' },
};

// Owner/admin view: restaurant list, restaurant settings, and the sidebar.
export default function AdminApp({ user, onLogout }) {
  const route = useRoute();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Start collapsed on small screens so the overlay sidebar doesn't cover content.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 860);

  const loadRestaurants = useCallback(async () => {
    try {
      const data = await api.listRestaurants();
      setRestaurants(Object.entries(data).map(([id, raw]) => normalizeRestaurant(id, raw)));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.deleteRestaurant(id);
      setRestaurants((list) => list.filter((r) => r.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Throws on failure so the form can show the message. Refreshes the list on success.
  const handleUpdate = useCallback(
    async (id, changes) => {
      await api.updateRestaurant(id, changes);
      await loadRestaurants();
    },
    [loadRestaurants]
  );

  const handleAdd = useCallback(
    async ({ name, address }) => {
      try {
        await api.createRestaurant({ name, location: address });
        await loadRestaurants();
      } catch (err) {
        setError(err.message);
      }
    },
    [loadRestaurants]
  );

  const meta = PAGE_META[route.page] ?? PAGE_META.restaurants;

  let content;
  if (loading) {
    content = <p className={styles.status}>Loading restaurants…</p>;
  } else {
    switch (route.page) {
      case 'restaurant-settings':
        content = (
          <RestaurantSettings
            restaurants={restaurants}
            restaurantId={route.id}
            tab={route.tab}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        );
        break;
      case 'qr-codes':
        content = <QrCodesPage restaurants={restaurants} />;
        break;
      default:
        content = <RestaurantsPage restaurants={restaurants} onDelete={handleDelete} onAdd={handleAdd} />;
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        activeId={meta.nav}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        onLogout={onLogout}
      />

      <div className={styles.main}>
        <Header title={meta.title} restaurantCount={restaurants.length} userName={user?.name} />
        <main className={styles.content}>
          {error && (
            <div className={styles.banner} role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}>
                Dismiss
              </button>
            </div>
          )}
          {content}
        </main>
      </div>
    </div>
  );
}
