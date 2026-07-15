import { asset } from "../lib/asset";

const SESSION_KEY = "app_fotobox_session";
const DELETED_KEY = "app_fotobox_deleted";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || [];
  } catch {
    return [];
  }
}

function readDeleted() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY)) || [];
  } catch {
    return [];
  }
}

export async function getFotoboxes(userId) {
  let base = [];
  try {
    const res = await fetch(asset("fotobox.json"));
    if (res.ok) {
      const data = await res.json();
      base = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    }
  } catch {}
  const session = readSession();
  const deleted = readDeleted();
  const baseItems = base.filter((x) => !deleted.includes(x.id));
  const sessionItems = session.filter((x) => !deleted.includes(x.id));
  let all = [...baseItems, ...sessionItems];
  if (userId) all = all.filter((x) => x.userId === userId);
  return all;
}

export async function saveFotobox(payload) {
  const item = {
    ...payload,
    id: "fb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };
  const session = readSession();
  session.unshift(item);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return item;
}

export async function deleteFotobox(id) {
  const deleted = readDeleted();
  if (!deleted.includes(id)) deleted.push(id);
  localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  return { ok: true };
}
