import { useEffect, useState } from 'react';

// Hash-based routing: no extra dependency needed, and it works when opened from a file.
//   #/restaurants                  -> list
//   #/restaurants/:id              -> detail (overview tab)
//   #/restaurants/:id/:tab         -> detail, specific tab
//   #/restaurant-settings, #/employees, #/menu, #/combo, #/help

const STANDALONE_PAGES = ['restaurant-settings', 'employees', 'menu', 'combo', 'help'];

export function parseHash(hash) {
  const [first, second, third] = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  if (!first || first === 'restaurants') {
    if (second) {
      // IDs come from the backend as strings, e.g. "1"
      return { page: 'restaurant', id: decodeURIComponent(second), tab: third || 'overview' };
    }
    return { page: 'restaurants' };
  }

  if (STANDALONE_PAGES.includes(first)) return { page: first };
  return { page: 'restaurants' };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function go(hash) {
  window.location.hash = hash;
}
