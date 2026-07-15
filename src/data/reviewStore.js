import { asset } from "../lib/asset";

const STORAGE_KEY = "app_reviews";
const BASE_KEY = "app_reviews_base";
const SESSION_KEY = "app_reviews_session";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || [];
  } catch {
    return [];
  }
}

function combine() {
  let base = [];
  try {
    base = JSON.parse(localStorage.getItem(BASE_KEY)) || [];
  } catch {}
  if (!Array.isArray(base)) base = [];
  const session = readSession();
  const ids = new Set(base.map((x) => x.id));
  const added = session.filter((x) => !ids.has(x.id));
  const all = [...base, ...added];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export async function syncReviews() {
  try {
    const res = await fetch(asset("reviews.json"));
    if (res.ok) {
      const data = await res.json();
      const base = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      localStorage.setItem(BASE_KEY, JSON.stringify(base));
    }
  } catch {}
  return combine();
}

export function getReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function getUserReviews(userId) {
  return getReviews().filter((r) => r.userId === userId);
}

export async function addReview({ userId, userName, menuId, menuName, rating, comment, photo }) {
  const review = {
    id: "rev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userId,
    userName,
    menuId,
    menuName,
    rating: Number(rating),
    comment: comment.trim(),
    photo: photo || "",
    createdAt: new Date().toISOString(),
  };
  const session = readSession();
  session.unshift(review);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  combine();
  return review;
}
