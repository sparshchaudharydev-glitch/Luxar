import { useCallback, useEffect, useState } from 'react';
import styles from './App.module.css';
import IntroSplash from './components/IntroSplash/IntroSplash.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import { useRoute } from './router.js';
import { api } from './api/client.js';
import { normalizeRestaurant } from './data/restaurants.js';
import RestaurantsPage from './pages/RestaurantsPage/RestaurantsPage.jsx';
import RestaurantDetail from './pages/RestaurantDetail/RestaurantDetail.jsx';
import RestaurantSettings from './pages/RestaurantSettings/RestaurantSettings.jsx';
import Employees from './pages/Employees/Employees.jsx';
import Menu from './pages/Menu/Menu.jsx';
import Combo from './pages/Combo/Combo.jsx';
import HelpCenter from './pages/HelpCenter/HelpCenter.jsx';

// Maps each page to its header title and the sidebar item it highlights.
const PAGE_META = {
  restaurants: { title: 'My Restaurants', nav: 'dashboard' },
  restaurant: { nav: 'dashboard' },
  'restaurant-settings': { title: 'Restaurant Settings', nav: 'settings' },
  employees: { title: 'Employees', nav: 'employees' },
  menu: { title: 'Menu', nav: 'menu' },
  combo: { title: 'Combo', nav: 'combo' },
  help: { title: 'Help Center', nav: 'help' },
};

export default function App() {
  const route = useRoute();
  const [showIntro, setShowIntro] = useState(true);
  const finishIntro = useCallback(() => setShowIntro(false), []);

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

  const restaurant = route.page === 'restaurant' ? restaurants.find((r) => r.id === route.id) : null;
  const meta = PAGE_META[route.page] ?? PAGE_META.restaurants;
  const title = route.page === 'restaurant' ? restaurant?.name ?? 'Restaurant' : meta.title;
  const isRestaurantPage = route.page === 'restaurants' || route.page === 'restaurant';

  let content;
  if (isRestaurantPage && loading) {
    content = <p className={styles.status}>Loading restaurants…</p>;
  } else {
    switch (route.page) {
      case 'restaurant':
        content = restaurant ? (
          <RestaurantDetail restaurant={restaurant} tab={route.tab} onDelete={handleDelete} />
        ) : (
          <div className={styles.status}>
            <p>This restaurant doesn’t exist or was deleted.</p>
            <a href="#/restaurants">Back to Restaurants</a>
          </div>
        );
        break;
      case 'restaurant-settings':
        content = <RestaurantSettings />;
        break;
      case 'employees':
        content = <Employees />;
        break;
      case 'menu':
        content = <Menu />;
        break;
      case 'combo':
        content = <Combo />;
        break;
      case 'help':
        content = <HelpCenter />;
        break;
      default:
        content = <RestaurantsPage restaurants={restaurants} onDelete={handleDelete} onAdd={handleAdd} />;
    }
  }

  return (
    <>
      {showIntro && <IntroSplash onDone={finishIntro} />}
      <div className={styles.layout}>
        <Sidebar activeId={meta.nav} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />

        <div className={styles.main}>
          <Header title={title} restaurantCount={restaurants.length} />
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
    </>
  );
}
