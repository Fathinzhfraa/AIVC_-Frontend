import database from "./database";

const STORAGE_KEY = "app_reviews";

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getReviews() {
  return readLocal();
}

export function getUserReviews(userId) {
  return readLocal().filter((r) => r.userId === userId);
}

export async function syncReviews() {
  try {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length) writeLocal(items);
  } catch {
    /* pakai localStorage */
  }
  return readLocal();
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
  const local = readLocal();
  local.unshift(review);
  writeLocal(local);

  try {
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
  } catch {
    /* offline: cukup di localStorage */
  }
  return review;
}
