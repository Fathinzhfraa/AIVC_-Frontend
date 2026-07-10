import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getAllMenu, syncFromServer } from "../data/menuStore";
import { asset } from "../lib/asset";

function MenuCard({ item, catIcon }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const isAdmin = user?.role === "admin";

  const handleAdd = () => {
    if (isAdmin) return;
    if (!user) {
      navigate("/login");
      return;
    }
    addItem({ menuId: item.id, name: item.name, price: `$${item.price}`, description: item.description, tags: item.tags, image: item.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="bg-surface border-2 border-on-background neu-shadow neu-card p-4 flex flex-col gap-2 relative overflow-hidden group h-full">
      {item.bestSeller && (
        <div className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-label-bold uppercase px-2 py-0.5 border border-on-background z-10 flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          Best Seller
        </div>
      )}
      {catIcon && (
        <div className="absolute top-0 right-0 w-14 h-14 bg-primary-fixed border-l-2 border-b-2 border-on-background flex items-center justify-center -translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{catIcon}</span>
        </div>
      )}
      {item.image && (
        <img alt={item.name} className="w-full h-44 object-cover border-2 border-on-background mb-2"         src={asset(item.image)} />
      )}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-label-bold text-label-bold uppercase text-sm leading-tight">{item.name}</h4>
        <span className="font-label-bold text-label-bold text-primary shrink-0">${item.price}</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant text-sm flex-grow">{item.description}</p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {item.tags?.length > 0 && item.tags.map((tag) => (
          <span key={tag} className="border-2 border-on-background px-2 py-0.5 text-[10px] font-label-bold bg-tertiary-fixed uppercase">{tag}</span>
        ))}
      </div>
      {!isAdmin && (
        <button
          onClick={handleAdd}
          className={`mt-3 w-full border-2 border-on-background py-2 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
            added ? "bg-primary text-on-primary neu-shadow" : "bg-surface-container text-on-background hover:bg-primary hover:text-on-primary neu-shadow"
          }`}
        >
          {added ? "✓ DITAMBAHKAN" : "PESAN"}
        </button>
      )}
    </div>
  );
}

const CATEGORIES = ["COFFEE", "NON COFFEE", "SIGNATURE", "PASTRY", "MODERN FOOD"];
const INITIAL_VISIBLE = 3;

export default function MenuSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    syncFromServer()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setItems(getAllMenu());
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((m) => {
      if (category && m.category !== category) return false;
      if (q) {
        const haystack = [m.name, m.description, m.category, (m.tags || []).join(" ")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, category]);

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: filtered
      .filter((m) => m.category === cat)
      .sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0)),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="menu" className="w-full max-w-7xl mx-auto px-gutter py-xl">
      <div className="flex justify-between items-end mb-lg border-b-2 border-on-background pb-sm">
        <div>
          <h2 className="font-headline-md text-headline-md uppercase text-on-background">Our Menu</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Pilih favorit kamu</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-lg">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
            placeholder="Cari menu (nama, deskripsi, tag)..."
            className="w-full border-2 border-on-background pl-10 pr-4 py-2 bg-surface font-body-md neu-shadow focus:outline-none focus:bg-surface-container"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setShowAll(true); }}
          className="border-2 border-on-background px-4 py-2 bg-surface font-body-md neu-shadow focus:outline-none"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || category) && (
          <button
            onClick={() => { setSearch(""); setCategory(""); setShowAll(false); }}
            className="border-2 border-on-background px-4 py-2 font-label-bold uppercase text-sm bg-surface neu-shadow hover:bg-surface-container transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Reset
          </button>
        )}
      </div>

      {loading && (
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">Memuat...</p>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-surface border-2 border-on-background neu-shadow p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">search_off</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Tidak ada menu yang cocok.</p>
        </div>
      )}

      <div className="space-y-xl">
        {grouped.map((cat) => {
          const visibleItems = showAll ? cat.items : cat.items.slice(0, INITIAL_VISIBLE);
          const hasMore = !showAll && cat.items.length > INITIAL_VISIBLE;

          return (
            <div key={cat.category}>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.items[0].categoryIcon || "restaurant_menu"}</span>
                <h3 className="font-headline-sm text-headline-sm uppercase text-on-background">{cat.category}</h3>
                <span className="font-body-md text-body-md text-on-surface-variant">({cat.items.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleItems.map((item) => (
                  <MenuCard key={item.id || item.name} item={item} catIcon={item.categoryIcon} />
                ))}
              </div>
              {hasMore && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-4 w-full text-center border-2 border-dashed border-on-background py-3 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container hover:border-solid transition-all"
                >
                  +{cat.items.length - INITIAL_VISIBLE} menu lainnya
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!loading && items.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-8 py-3 font-label-bold text-label-bold uppercase w-full sm:w-auto transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container hover:text-on-background inline-flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">
              {showAll ? "expand_less" : "expand_more"}
            </span>
            {showAll ? "Tampilkan Lebih Sedikit" : "Lihat Semua Menu"}
          </button>
        </div>
      )}
    </section>
  );
}
