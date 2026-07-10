import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../data/orderStore";
import { getReviews, addReview, syncReviews } from "../data/reviewStore";

function Stars({ value, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <button
              type="button"
              key={n}
              onClick={() => onSelect && onSelect(n)}
              className="text-[28px] leading-none"
              aria-label={`${n} bintang`}
            >
              <span
                className={`material-symbols-outlined ${active ? "text-primary" : onSelect ? "hover:text-primary text-on-surface-variant" : "text-on-surface-variant"}`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            </button>
          );
        })}
      </div>
      <span className="font-label-bold text-label-bold uppercase text-sm text-on-surface-variant">
        {value} Bintang
      </span>
    </div>
  );
}

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(getReviews);

  useEffect(() => {
    syncReviews().then(setReviews);
  }, []);
  const [menuId, setMenuId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-body-lg text-body-lg mb-4">Silakan login untuk memberi ulasan</p>
          <Link to="/login" className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const completedItems = getUserOrders(user.id)
    .filter((o) => o.status === "completed" || o.status === "paid")
    .flatMap((o) => o.items);
  const canReview = completedItems.length > 0;
  const getKey = (i) => i.menuId || i.name;
  const options = [...new Map(completedItems.map((i) => [getKey(i), i])).values()];

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
        setError("");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canReview) {
      window.alert("Kamu harus pesan dan menyelesaikan pesanan dulu sebelum bisa memberi ulasan.");
      return;
    }
    if (!menuId) {
      setError("Pilih menu yang ingin diulas.");
      return;
    }
    if (!comment.trim()) {
      setError("Tulis ulasan kamu.");
      return;
    }
    const item = options.find((i) => getKey(i) === menuId);
    addReview({
      userId: user.id,
      userName: user.name,
      menuId: item?.menuId || menuId,
      menuName: item?.name || "Menu",
      rating,
      comment,
      photo,
    });
    setReviews(getReviews());
    setMenuId("");
    setRating(5);
    setComment("");
    setPhoto("");
    setError("");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
      <div className="max-w-2xl mx-auto px-gutter">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
          <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background">
            Ulasan
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Bagikan pengalaman kamu setelah pesanan selesai
        </p>

        {!canReview && (
          <div className="bg-error-container border-2 border-error text-error p-5 flex items-start gap-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">warning</span>
            <div>
              <p className="font-label-bold text-label-bold uppercase mb-1">Belum bisa memberi ulasan</p>
              <p className="font-body-md text-body-md">
                Kamu harus pesan, membayar, dan menyelesaikan pesanan dulu sebelum bisa memberi ulasan.
              </p>
              <Link
                to="/#menu"
                className="inline-block mt-3 bg-primary text-on-primary border-2 border-on-background neu-shadow px-5 py-2 font-label-bold text-label-bold uppercase text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Mulai Pesan
              </Link>
            </div>
          </div>
        )}

        {canReview && (
          <form onSubmit={handleSubmit} className="bg-surface border-2 border-on-background neu-shadow p-5 mb-8">
            <h2 className="font-label-bold text-label-bold uppercase text-on-background mb-4">Tulis Ulasan</h2>
            <div className="space-y-4">
              <div>
                <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Menu</label>
                <select
                  value={menuId}
                  onChange={(e) => { setMenuId(e.target.value); setError(""); }}
                  className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md focus:outline-none"
                >
                  <option value="">Pilih menu dari pesanan selesai...</option>
                  {options.map((i) => (
                    <option key={getKey(i)} value={getKey(i)}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Rating</label>
                <Stars value={rating} onSelect={setRating} />
              </div>
              <div>
                <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Ulasan</label>
                <textarea
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); setError(""); }}
                  rows={3}
                  className="w-full border-2 border-on-background px-3 py-2 bg-background font-body-md resize-none focus:outline-none"
                  placeholder="Ceritakan pengalaman kamu..."
                />
              </div>
              <div>
                <label className="font-label-bold text-label-bold uppercase text-sm block mb-1">Foto (opsional)</label>
                {photo ? (
                  <div className="relative inline-block">
                    <img src={photo} alt="preview" className="w-32 h-32 object-cover border-2 border-on-background" />
                    <button
                      type="button"
                      onClick={() => { setPhoto(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute -top-2 -right-2 bg-error text-white w-6 h-6 flex items-center justify-center border-2 border-on-background hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-on-background px-4 py-3 font-label-bold text-label-bold uppercase text-sm bg-background hover:bg-surface-container transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">add_a_photo</span>
                    Tambah Foto
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              {error && (
                <p className="font-body-md text-body-md text-error">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">send</span>
                Kirim Ulasan
              </button>
            </div>
          </form>
        )}

        <h2 className="font-label-bold text-label-bold uppercase text-on-background mb-4 border-b-2 border-on-background pb-2">
          Ulasan Pelanggan ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Belum ada ulasan.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-surface border-2 border-on-background neu-shadow p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-label-bold uppercase text-sm">{r.menuName}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant text-xs">{r.userName} • {new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">{r.comment}</p>
                {r.photo && (
                  <img src={r.photo} alt="foto ulasan" className="mt-3 w-full max-w-xs h-48 object-cover border-2 border-on-background" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
