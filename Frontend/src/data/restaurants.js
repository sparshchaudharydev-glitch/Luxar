// Restaurant records come from the API (see src/api/client.js).
// The helpers below adapt those records for the UI. Restaurant Settings still
// uses these sample defaults until it is backed by the API.

export const settingsDefaults = {
  name: 'Louvre Opéra',
  email: 'hello@louvreopera.com',
  phone: '+91 98765 43210',
  cuisine: 'Continental',
  currency: 'INR (₹)',
  opening: '10:00',
  closing: '23:00',
  onlineOrdering: true,
  notifications: true,
};

export const menuItems = [
  { id: 1, name: 'Paneer Tikka', category: 'Starters', price: 320, type: 'veg', available: true },
  { id: 2, name: 'Chicken Seekh Kebab', category: 'Starters', price: 380, type: 'non-veg', available: true },
  { id: 3, name: 'Dal Makhani', category: 'Mains', price: 260, type: 'veg', available: true },
  { id: 4, name: 'Butter Chicken', category: 'Mains', price: 420, type: 'non-veg', available: true },
  { id: 5, name: 'Veg Biryani', category: 'Mains', price: 300, type: 'veg', available: false },
  { id: 6, name: 'Gulab Jamun', category: 'Desserts', price: 150, type: 'veg', available: true },
  { id: 7, name: 'Mango Lassi', category: 'Drinks', price: 140, type: 'veg', available: true },
  { id: 8, name: 'Oreo Shake', category: 'Drinks', price: 220, type: 'veg', available: true },
];

export const combos = [
  { id: 1, name: 'Family Feast', items: ['2 × Butter Chicken', '4 × Butter Naan', '1 × Dal Makhani', '2 × Mango Lassi'], price: 1199, active: true },
  { id: 2, name: 'Lunch Express', items: ['1 × Veg Biryani', '1 × Raita', '1 × Gulab Jamun'], price: 349, active: true },
  { id: 3, name: 'Date Night', items: ['Paneer Tikka', 'Butter Chicken', '2 × Mocktails'], price: 899, active: false },
];

export const faqs = [
  { q: 'How do I add a new restaurant?', a: 'Go to My Restaurants and click “Add Restaurants”. Enter the name and location, then save.' },
  { q: 'How do I change my restaurant’s opening hours?', a: 'Open Restaurant Settings and update the opening and closing times under Operations, then click Save changes.' },
  { q: 'Can I turn off online ordering temporarily?', a: 'Yes. In Restaurant Settings, switch off “Accept online orders”. Customers will see the restaurant as closed for orders.' },
  { q: 'How do I mark a menu item as sold out?', a: 'Go to Menu, find the item and switch its availability toggle off. It will be hidden from customers until you turn it back on.' },
];

// ---------- Adapters for API records ----------

// Stable number from a string, used to give each restaurant its own placeholder colors.
function hashString(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Used for any detail field the backend hasn't filled in yet.
export function emptyDetails() {
  return {
    status: 'Active',
    coords: null,
    interiorPhotos: [],
    foodPhotos: [],
    contact: { phone: '', whatsapp: '', instagram: '' },
    timing: { opening: '', closing: '', weeklyOff: '' },
    menu: { veg: 0, nonVeg: 0, shakes: 0 },
    facilities: [],
    reviews: { rating: null, count: 0 },
    luxarPartner: false,
  };
}

// The backend returns { name, location, rating, employees, coords, contact, ... }
// keyed by ID. Convert that to the UI's shape, filling gaps with empty values.
export function normalizeRestaurant(id, raw) {
  const empty = emptyDetails();
  return {
    id: String(id),
    name: raw.name,
    address: raw.location,
    rating: raw.rating ?? null,
    employees: raw.employees ?? null,
    hue: hashString(String(id)) % 360,
    details: {
      status: raw.status ?? empty.status,
      coords: raw.coords ?? null,
      interiorPhotos: raw.interiorPhotos ?? [],
      foodPhotos: raw.foodPhotos ?? [],
      contact: { ...empty.contact, ...raw.contact },
      timing: { ...empty.timing, ...raw.timing },
      menu: { ...empty.menu, ...raw.menu },
      facilities: raw.facilities ?? [],
      reviews: { ...empty.reviews, ...raw.reviews },
      luxarPartner: raw.luxarPartner ?? false,
    },
  };
}
