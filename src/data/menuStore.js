import menuData from "./menu.json";

const STORAGE_KEY = "app_menu";

function seedMenu() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;
  const seed = menuData.map((m) => ({
    ...m,
    id: m.id || "mnu_" + Math.random().toString(36).slice(2, 8),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

seedMenu();

export function getAllMenu() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && data.length) return data;
  } catch {}
  return [];
}

export async function syncFromServer() {
  const localItems = getAllMenu();
  try {
    const res = await fetch("/api/menu?pageSize=1000");
    const json = await res.json();
    const serverItems = Array.isArray(json.items) ? json.items : [];
    const byId = new Map();
    serverItems.forEach((m) => byId.set(m.id, m));
    localItems.forEach((m) => byId.set(m.id, m));
    const merged = Array.from(byId.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    persistToServer(merged);
    return merged;
  } catch {
    return localItems;
  }
}

export function saveAllMenu(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  persistToServer(items);
}

function persistToServer(items) {
  try {
    fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    }).catch(() => {});
  } catch {}
}

export function getMenuByCategory() {
  const items = getAllMenu();
  const cats = {};
  items.forEach((m) => {
    if (!cats[m.category]) {
      cats[m.category] = {
        category: m.category,
        categoryIcon: m.categoryIcon || "restaurant_menu",
        items: [],
      };
    }
    cats[m.category].items.push(m);
  });
  return Object.values(cats);
}

export function addMenuItem(item) {
  const items = getAllMenu();
  const newItem = {
    ...item,
    id: "mnu_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    bestSeller: false,
    available: true,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveAllMenu(items);
  return newItem;
}

export function updateMenuItem(id, updates) {
  const items = getAllMenu();
  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveAllMenu(items);
  return items[idx];
}

export function deleteMenuItem(id) {
  const items = getAllMenu();
  const filtered = items.filter((m) => m.id !== id);
  if (filtered.length === items.length) return false;
  saveAllMenu(filtered);
  return true;
}

export function toggleBestSeller(id) {
  const items = getAllMenu();
  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  items[idx].bestSeller = !items[idx].bestSeller;
  saveAllMenu(items);
  return items[idx];
}
