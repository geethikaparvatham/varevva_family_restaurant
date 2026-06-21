import type { MenuItem } from './menuData';
import { menuData as defaultMenu } from './menuData';
export type { MenuItem };

export interface SpecialItem {
  id: string;
  name: string;
  price: string;
  image: string;
  type: 'veg' | 'non-veg';
  description: string;
  tag: string;
  tagIcon: string;
}

const BASE_URL = 'https://varevva-family-restaurant.vercel.app';

export const defaultSpecials: SpecialItem[] = [
  {
    id: "special-1",
    name: "Special Chicken Dum Biryani",
    price: "₹200 / ₹350",
    image: `${BASE_URL}/assets/chicken_dum_biryani.png`,
    type: "non-veg",
    description: "Our top seller. Long-grain premium Basmati rice slow-cooked under pressure (dum) with tender, spicy marinated chicken. Infused with saffron and local herbs.",
    tag: "Best Seller",
    tagIcon: "fa-fire"
  },
  {
    id: "special-2",
    name: "Spicy Natukodi Fry (Country Chicken)",
    price: "₹350",
    image: `${BASE_URL}/assets/spicy_chicken_fry.png`,
    type: "non-veg",
    description: "Authentic country-style chicken stir-fried with heavy black pepper, green chillies, garlic, and fresh curry leaves. High on spice and flavor.",
    tag: "Telangana Special",
    tagIcon: "fa-pepper-hot"
  },
  {
    id: "special-3",
    name: "Paneer Butter Masala",
    price: "₹230",
    image: `${BASE_URL}/assets/paneer_butter_masala.png`,
    type: "veg",
    description: "Succulent cubes of fresh cottage cheese simmered in a smooth, creamy tomato-cashew gravy with loads of pure butter and mild spices. Perfect with Butter Naan.",
    tag: "Vegetarian Choice",
    tagIcon: "fa-leaf"
  }
];
function mergeMenuWithDefaults(loadedMenu: MenuItem[]): MenuItem[] {
  const loadedMap = new Map<string, MenuItem>();
  loadedMenu.forEach(item => {
    if (item && item.id) {
      loadedMap.set(item.id, item);
    }
  });

  const merged: MenuItem[] = defaultMenu.map(defaultItem => {
    const loadedItem = loadedMap.get(defaultItem.id);
    if (loadedItem) {
      return {
        ...defaultItem,
        outOfStock: loadedItem.outOfStock ?? defaultItem.outOfStock
      };
    }
    return { ...defaultItem };
  });

  loadedMenu.forEach(loadedItem => {
    if (loadedItem && loadedItem.id && !defaultMenu.some(d => d.id === loadedItem.id)) {
      merged.push(loadedItem);
    }
  });

  return merged;
}

function mergeSpecialsWithDefaults(loadedSpecials: SpecialItem[]): SpecialItem[] {
  const loadedMap = new Map<string, SpecialItem>();
  loadedSpecials.forEach(item => {
    if (item && item.id) {
      loadedMap.set(item.id, item);
    }
  });

  const merged: SpecialItem[] = defaultSpecials.map(defaultItem => {
    const loadedItem = loadedMap.get(defaultItem.id);
    if (loadedItem) {
      return { ...defaultItem };
    }
    return { ...defaultItem };
  });

  loadedSpecials.forEach(loadedItem => {
    if (loadedItem && loadedItem.id && !defaultSpecials.some(d => d.id === loadedItem.id)) {
      merged.push(loadedItem);
    }
  });

  return merged;
}

let database: any = null;
let isInitialized = false;

// Dynamically load script helpers
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export async function initFirebase(): Promise<boolean> {
  if (isInitialized) return true;
  try {
    const response = await fetch('/firebase-config.json');
    if (!response.ok) {
      console.log("Firebase config not found. Using local storage fallback.");
      return false;
    }
    const config = await response.json();
    if (!config.apiKey || !config.databaseURL) {
      console.warn("Firebase config missing required fields.");
      return false;
    }

    // Load scripts dynamically to preserve original setup without adding NPM overhead
    await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js");

    const firebase = (window as any).firebase;
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    database = firebase.database();
    isInitialized = true;
    console.log("Firebase Realtime Database initialized successfully.");
    return true;
  } catch (error: any) {
    console.log("Error initializing Firebase, falling back to local storage:", error.message);
    return false;
  }
}

export async function fetchMenu(): Promise<MenuItem[]> {
  const firebaseReady = await initFirebase();
  if (firebaseReady && database) {
    try {
      const snapshot = await database.ref('menu').once('value');
      const val = snapshot.val();
      if (val && Array.isArray(val) && val.length > 0) {
        return mergeMenuWithDefaults(val);
      }
      console.log("Firebase menu is empty. Seeding with defaults.");
      await saveMenu(defaultMenu);
      return [...defaultMenu];
    } catch (err) {
      console.error("Error fetching menu from Firebase:", err);
    }
  }

  // LocalStorage fallback
  let localData: MenuItem[] = [];
  try {
    const stored = localStorage.getItem('varevva_menu_data');
    if (stored) localData = JSON.parse(stored);
  } catch (err) {
    console.error("Error reading menu from localStorage:", err);
  }

  if (!localData || localData.length === 0) {
    localData = [...defaultMenu];
    localStorage.setItem('varevva_menu_data', JSON.stringify(localData));
    return localData;
  }
  return mergeMenuWithDefaults(localData);
}

export async function saveMenu(menu: MenuItem[]): Promise<void> {
  localStorage.setItem('varevva_menu_data', JSON.stringify(menu));

  if (isInitialized && database) {
    try {
      await database.ref('menu').set(menu);
      console.log("Synced menu to Firebase.");
    } catch (err) {
      console.error("Error syncing menu to Firebase:", err);
    }
  }

  // Dev Server local save API integration
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      await fetch('/api/save-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu })
      });
    } catch (err) {
      console.log("Dev save-menu API not active or unreachable.");
    }
  }
}

export async function fetchSpecials(): Promise<SpecialItem[]> {
  const firebaseReady = await initFirebase();
  if (firebaseReady && database) {
    try {
      const snapshot = await database.ref('specials').once('value');
      const val = snapshot.val();
      if (val && Array.isArray(val) && val.length > 0) {
        return mergeSpecialsWithDefaults(val);
      }
      console.log("Firebase specials is empty. Seeding with defaults.");
      await saveSpecials(defaultSpecials);
      return [...defaultSpecials];
    } catch (err) {
      console.error("Error fetching specials from Firebase:", err);
    }
  }

  // LocalStorage fallback
  let localData: SpecialItem[] = [];
  try {
    const stored = localStorage.getItem('varevva_specials_data');
    if (stored) localData = JSON.parse(stored);
  } catch (err) {
    console.error("Error reading specials from localStorage:", err);
  }

  if (!localData || localData.length === 0) {
    localData = [...defaultSpecials];
    localStorage.setItem('varevva_specials_data', JSON.stringify(localData));
    return localData;
  }
  return mergeSpecialsWithDefaults(localData);
}

export async function saveSpecials(specials: SpecialItem[]): Promise<void> {
  localStorage.setItem('varevva_specials_data', JSON.stringify(specials));

  if (isInitialized && database) {
    try {
      await database.ref('specials').set(specials);
      console.log("Synced specials to Firebase.");
    } catch (err) {
      console.error("Error syncing specials to Firebase:", err);
    }
  }

  // Dev Server local save API integration
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      await fetch('/api/save-specials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specials })
      });
    } catch (err) {
      console.log("Dev save-specials API not active or unreachable.");
    }
  }
}
