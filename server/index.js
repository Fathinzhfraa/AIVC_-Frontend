import express from "express";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MENU_FILE = join(__dirname, "..", "public", "menu.json");
const FOTOBOX_FILE = join(__dirname, "data", "fotobox.json");
const REVIEWS_FILE = join(__dirname, "data", "reviews.json");
const USERS_FILE = join(__dirname, "data", "users.json");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json({ limit: "25mb" }));

function readMenu() {
  try {
    return JSON.parse(readFileSync(MENU_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeMenu(items) {
  writeFileSync(MENU_FILE, JSON.stringify(items, null, 2) + "\n");
}

function readFotobox() {
  try {
    return JSON.parse(readFileSync(FOTOBOX_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeFotobox(items) {
  writeFileSync(FOTOBOX_FILE, JSON.stringify(items, null, 2) + "\n");
}

app.get("/api/menu", (req, res) => {
  const all = readMenu();
  const search = (req.query.search || "").toString().trim().toLowerCase();
  const category = (req.query.category || "").toString().trim();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.max(1, parseInt(req.query.pageSize) || 1000);

  let filtered = all;
  if (search) {
    filtered = filtered.filter((m) => {
      const haystack = [
        m.name,
        m.description,
        m.category,
        (m.tags || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }
  if (category) {
    filtered = filtered.filter((m) => m.category === category);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  res.json({ items, total, page, pageSize, totalPages });
});

app.put("/api/menu", (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  writeMenu(items);
  res.json({ ok: true, count: items.length });
});

app.get("/api/fotobox", (req, res) => {
  const all = readFotobox();
  const userId = (req.query.userId || "").toString().trim();
  const items = userId ? all.filter((f) => f.userId === userId) : all;
  res.json({ items, total: items.length });
});

app.post("/api/fotobox", (req, res) => {
  const body = req.body || {};
  if (!body.image) {
    return res.status(400).json({ ok: false, error: "image is required" });
  }
  const all = readFotobox();
  const entry = {
    id: "fbx_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userId: body.userId || "",
    userName: body.userName || "",
    template: body.template || "",
    layout: body.layout || "",
    filter: body.filter || "",
    whatsapp: body.whatsapp || "",
    image: body.image,
    createdAt: new Date().toISOString(),
  };
  all.unshift(entry);
  writeFotobox(all);
  res.json({ ok: true, id: entry.id });
});

app.delete("/api/fotobox/:id", (req, res) => {
  const all = readFotobox();
  const next = all.filter((f) => f.id !== req.params.id);
  writeFotobox(next);
  res.json({ ok: true, removed: all.length - next.length });
});

app.get("/api/reviews", (req, res) => {
  const all = readReviews();
  res.json({ items: all, total: all.length });
});

app.post("/api/reviews", (req, res) => {
  const body = req.body || {};
  if (!body.comment || !body.menuId) {
    return res.status(400).json({ ok: false, error: "comment dan menuId wajib diisi" });
  }
  const all = readReviews();
  const review = {
    id: "rev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userId: body.userId || "",
    userName: body.userName || "",
    menuId: body.menuId,
    menuName: body.menuName || "Menu",
    rating: Number(body.rating) || 5,
    comment: String(body.comment).trim(),
    photo: body.photo || "",
    createdAt: body.createdAt || new Date().toISOString(),
  };
  all.unshift(review);
  writeReviews(all);
  res.json({ ok: true, id: review.id });
});

function readReviews() {
  try {
    return JSON.parse(readFileSync(REVIEWS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function readUsers() {
  try {
    return JSON.parse(readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(items) {
  writeFileSync(USERS_FILE, JSON.stringify(items, null, 2) + "\n");
}

function writeReviews(items) {
  writeFileSync(REVIEWS_FILE, JSON.stringify(items, null, 2) + "\n");
}

app.get("/api/users", (req, res) => {
  let all = [];
  try {
    all = JSON.parse(readFileSync(USERS_FILE, "utf-8"));
  } catch {
    all = [];
  }
  const role = (req.query.role || "").toString().trim().toLowerCase();
  const filtered = role ? all.filter((u) => u.role === role) : all;
  res.json({ items: filtered, total: filtered.length });
});

app.post("/api/users", (req, res) => {
  const body = req.body || {};
  if (!body.username || !body.password) {
    return res.status(400).json({ ok: false, error: "username dan password wajib diisi" });
  }
  const all = readUsers();
  if (all.some((u) => u.username.toLowerCase() === String(body.username).toLowerCase())) {
    return res.status(409).json({ ok: false, error: "username sudah digunakan" });
  }
  const user = {
    id: body.id || "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    username: body.username,
    password: body.password,
    name: body.name || body.username,
    email: body.email || "",
    role: body.role === "admin" ? "admin" : "user",
    createdAt: body.createdAt || new Date().toISOString(),
  };
  all.push(user);
  writeUsers(all);
  const { password, ...safe } = user;
  res.json({ ok: true, user: safe });
});

app.listen(PORT, () => {
  console.log(`Menu API running at http://localhost:${PORT}/api/menu`);
});
