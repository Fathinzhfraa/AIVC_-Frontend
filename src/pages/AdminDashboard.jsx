import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, updateOrderStatus } from "../data/orderStore";
import {
  getAllMenu,
  saveAllMenu,
  syncFromServer,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleBestSeller,
} from "../data/menuStore";
import FotoboxGallery from "../components/FotoboxGallery";

const STATUS_LABELS = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800 border-yellow-400" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800 border-blue-400" },
  paid: { label: "Dibayar", color: "bg-green-100 text-green-800 border-green-400" },
  completed: { label: "Selesai", color: "bg-surface-container text-on-surface-variant border-on-surface-variant" },
};

const emptyForm = {
  name: "",
  category: "COFFEE",
  price: "",
  description: "",
  tags: "",
  image: "",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("pending");
  const [orders, setOrders] = useState(getOrders);
  const [menuList, setMenuList] = useState(getAllMenu);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    syncFromServer().then(setMenuList);
  }, []);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  function refreshOrders() {
    setOrders(getOrders());
  }

  function refreshMenu() {
    setMenuList(getAllMenu());
  }

  function handleConfirm(orderId) {
    updateOrderStatus(orderId, "confirmed");
    refreshOrders();
  }

  function handleComplete(orderId) {
    updateOrderStatus(orderId, "completed");
    refreshOrders();
  }

  function handleCancel(orderId) {
    updateOrderStatus(orderId, "cancelled");
    refreshOrders();
  }

  function openAddForm() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description,
      tags: (item.tags || []).join(", "),
      image: item.image || "",
    });
    setShowForm(true);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      description: form.description,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: form.image || "/images/placeholder.jpg",
      categoryIcon: getCategoryIcon(form.category),
    };
    if (editing) {
      updateMenuItem(editing.id, payload);
    } else {
      addMenuItem(payload);
    }
    setShowForm(false);
    setEditing(null);
    refreshMenu();
  }

  function handleDelete(id, name) {
    setDeleteTarget({ id, name });
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteMenuItem(deleteTarget.id);
      refreshMenu();
      setDeleteTarget(null);
    }
  }

  function handleToggleBest(id) {
    toggleBestSeller(id);
    refreshMenu();
  }

  const filtered = orders.filter((o) => tab === "all" || o.status === tab);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const categories = [...new Set(menuList.map((m) => m.category))];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-gutter">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background">
            Admin Dashboard
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Kelola pesanan dan menu</p>

        {/* ====== ORDER MANAGEMENT ====== */}
        <div className="flex items-center justify-end mb-2">
          <button onClick={refreshOrders} className="flex items-center gap-1 text-sm font-label-bold uppercase text-on-surface-variant hover:text-primary border-2 border-on-background px-3 py-1 bg-surface neu-shadow transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
        </div>
        <div className="flex gap-2 mb-4 flex-wrap border-b-2 border-on-background pb-2">
          {[
            { id: "pending", label: `Menunggu (${pendingCount})` },
            { id: "confirmed", label: "Dikonfirmasi" },
            { id: "paid", label: "Dibayar" },
            { id: "completed", label: "Selesai" },
            { id: "all", label: "Semua" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`font-label-bold text-label-bold uppercase px-4 py-2 border-2 transition-all ${
                tab === t.id ? "bg-primary text-on-primary border-primary" : "bg-surface text-on-surface-variant border-on-background hover:bg-surface-container"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="space-y-4 mb-10">
          {filtered.length === 0 && (
            <div className="bg-surface border-2 border-on-background neu-shadow p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">inbox</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Tidak ada pesanan</p>
            </div>
          )}
          {filtered.map((order) => {
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            return (
              <div key={order.id} className="bg-surface border-2 border-on-background neu-shadow p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <span className="font-label-bold text-label-bold uppercase text-on-surface-variant text-xs">{order.id}</span>
                    <h3 className="font-headline-sm text-headline-sm uppercase text-on-background">{order.userName}</h3>
                    <span className="font-body-md text-body-md text-on-surface-variant text-sm">{new Date(order.createdAt).toLocaleString("id-ID")}</span>
                  </div>
                  <span className={`font-label-bold text-label-bold uppercase px-3 py-1 border-2 ${st.color}`}>{st.label}</span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between font-body-md text-body-md">
                      <span>{item.qty}x {item.name}</span>
                      <span className="font-label-bold">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {order.notes && <p className="font-body-md text-body-md text-on-surface-variant italic mb-2 border-l-2 border-on-surface-variant pl-2">"{order.notes}"</p>}
                <div className="flex justify-between items-center border-t-2 border-on-background pt-3 mt-3">
                  <span className="font-headline-sm text-headline-sm">Total</span>
                  <span className="font-headline-sm text-headline-sm text-primary">${order.total}</span>
                </div>
                {order.status === "pending" && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleConfirm(order.id)} className="flex-1 bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-2 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary-container hover:text-on-background">Konfirmasi Pesanan</button>
                    <button onClick={() => handleCancel(order.id)} className="bg-surface text-on-background border-2 border-on-background neu-shadow px-4 py-2 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-error-container hover:text-error">Tolak</button>
                  </div>
                )}
                {order.status === "paid" && (
                  <button onClick={() => handleComplete(order.id)} className="w-full mt-4 bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-2 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">Selesaikan Pesanan</button>
                )}
              </div>
            );
          })}
        </div>

        {/* ====== MENU CRUD ====== */}
        <div className="bg-surface border-2 border-on-background neu-shadow p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-label-bold text-label-bold uppercase text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined">menu_book</span> Kelola Menu
            </h2>
            <button onClick={openAddForm} className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-2 font-label-bold text-label-bold uppercase text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">add</span> Tambah
            </button>
          </div>

          {/* Categories */}
          {categories.map((cat) => (
            <div key={cat} className="mb-6 last:mb-0">
              <h3 className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-2 border-b-2 border-on-background pb-1">{cat}</h3>
              <div className="space-y-2">
                {menuList
                  .filter((m) => m.category === cat)
                  .sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0))
                  .map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 border-2 border-on-background bg-background">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-label-bold text-label-bold uppercase text-sm truncate">{m.name}</span>
                          {m.bestSeller && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                        </div>
                        <span className="font-body-md text-body-md text-on-surface-variant text-xs">${m.price} • {m.tags?.join(", ") || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleToggleBest(m.id)} className={`border-2 border-on-background p-1 text-sm transition-all ${m.bestSeller ? "bg-primary text-on-primary" : "bg-surface text-on-surface-variant hover:text-primary"}`} title="Toggle best seller">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </button>
                        <button onClick={() => openEditForm(m)} className="border-2 border-on-background p-1 bg-surface text-on-surface-variant hover:text-primary transition-all" title="Edit">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(m.id, m.name)} className="border-2 border-on-background p-1 bg-surface text-on-surface-variant hover:text-error transition-all" title="Hapus">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>


        {/* ====== FOTOBOX GALLERY (ALL USERS) ====== */}
        <div className="mt-12">
          <FotoboxGallery isAdmin />
        </div>

        {/* ====== ADD/EDIT MODAL ====== */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface border-2 border-on-background neu-shadow w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-label-bold text-label-bold uppercase">{editing ? "Edit Menu" : "Tambah Menu"}</h2>
                <button onClick={() => setShowForm(false)} className="border-2 border-on-background p-1"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Nama Menu</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Kategori</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md">
                      {["COFFEE", "NON COFFEE", "SIGNATURE", "PASTRY", "MODERN FOOD"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Harga ($)</label>
                    <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md" />
                  </div>
                </div>
                <div>
                  <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Deskripsi</label>
                  <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md resize-none" rows={3} />
                </div>
                <div>
                  <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Tags (pisahkan dengan koma)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md" placeholder="Hot, Iced, Vegan" />
                </div>
                <div>
                  <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Path Gambar</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md" placeholder="/images/nama-file.jpg" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-primary text-on-primary border-2 border-on-background neu-shadow py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                    {editing ? "Simpan" : "Tambah"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====== DELETE CONFIRMATION MODAL ====== */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface border-2 border-on-background neu-shadow w-full max-w-sm p-6 text-center">
              <span className="material-symbols-outlined text-[48px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h2 className="font-headline-sm text-headline-sm uppercase text-on-background mt-2 mb-1">Hapus Menu?</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-5">
                Yakin ingin menghapus <strong>"{deleteTarget.name}"</strong> dari katalog? Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-error text-white border-2 border-on-background neu-shadow py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Hapus
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-surface text-on-background border-2 border-on-background neu-shadow py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(cat) {
  const map = {
    COFFEE: "local_cafe",
    "NON COFFEE": "emoji_food_beverage",
    SIGNATURE: "water_drop",
    PASTRY: "bakery_dining",
    "MODERN FOOD": "restaurant_menu",
  };
  return map[cat] || "restaurant_menu";
}
