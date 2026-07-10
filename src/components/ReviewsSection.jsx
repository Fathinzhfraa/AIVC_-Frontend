import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getReviews, syncReviews } from "../data/reviewStore";

function Stars({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`material-symbols-outlined text-lg ${n <= value ? "text-primary" : "text-on-surface-variant"}`}
            style={{ fontVariationSettings: n <= value ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        ))}
      </div>
      <span className="font-label-bold uppercase text-xs text-on-surface-variant">{value} Bintang</span>
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    syncReviews().then((items) => setReviews(items.slice(0, 6)));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="w-full max-w-7xl mx-auto px-gutter py-xl">
      <div className="flex justify-between items-end mb-lg border-b-2 border-on-background pb-sm">
        <div>
          <h2 className="font-headline-md text-headline-md uppercase text-on-background">Ulasan Pelanggan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Apa kata mereka tentang Autentic's</p>
        </div>
        <Link
          to="/reviews"
          className="hidden sm:inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-sm border-2 border-on-background px-4 py-2 bg-surface neu-shadow hover:bg-surface-container transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Semua Ulasan
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-surface border-2 border-on-background neu-shadow p-5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-label-bold uppercase text-sm">{r.menuName}</p>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs">
                  {r.userName} • {new Date(r.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <Stars value={r.rating} />
            </div>
            {r.photo && (
              <img src={r.photo} alt="foto ulasan" className="w-full h-44 object-cover border-2 border-on-background" />
            )}
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">"{r.comment}"</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          to="/reviews"
          className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase bg-surface text-on-background border-2 border-on-background neu-shadow px-8 py-3 w-full justify-center active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Lihat Semua Ulasan
        </Link>
      </div>
    </section>
  );
}
