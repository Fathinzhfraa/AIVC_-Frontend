import { useState, useEffect } from "react";
import { getFotoboxes, deleteFotobox } from "../data/fotoboxStore";

export default function FotoboxGallery({ userId, isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getFotoboxes(isAdmin ? undefined : userId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId, isAdmin]);

  async function handleDelete(id) {
    try {
      await deleteFotobox(id);
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-surface border-2 border-on-background neu-shadow p-5">
      <h2 className="font-label-bold text-label-bold uppercase text-on-background mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">photo_library</span>
        {isAdmin ? "Semua Fotobox Pengguna" : "Fotobox Saya"}
        <span className="font-body-md text-body-md text-on-surface-variant">({items.length})</span>
      </h2>

      {loading ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Memuat...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">image_not_supported</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Belum ada fotobox tersimpan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((f) => (
            <div key={f.id} className="border-2 border-on-background bg-background flex flex-col">
              <button
                onClick={() => setPreview(f)}
                className="block bg-surface-container border-b-2 border-on-background overflow-hidden"
              >
                <img src={f.image} alt="fotobox" className="w-full h-40 object-contain" />
              </button>
              <div className="p-2 flex-1">
                {isAdmin && (
                  <p className="font-label-bold text-label-bold uppercase text-sm truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">person</span>
                    {f.userName || f.userId || "Anonim"}
                  </p>
                )}
                <p className="font-body-md text-body-md text-on-surface-variant text-xs">
                  {f.template} • {f.layout}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs">
                  {new Date(f.createdAt).toLocaleString("id-ID")}
                </p>
                {isAdmin && f.whatsapp && (
                  <p className="font-body-md text-body-md text-on-surface-variant text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">call</span>+{f.whatsapp}
                  </p>
                )}
              </div>
              <div className="flex border-t-2 border-on-background">
                <a
                  href={f.image}
                  download={`fotobox-${f.id}.png`}
                  className="flex-1 py-1.5 font-label-bold text-label-bold uppercase text-sm text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                </a>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="flex-1 py-1.5 border-l-2 border-on-background font-label-bold text-label-bold uppercase text-sm text-on-surface-variant hover:bg-error-container hover:text-error transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-surface border-2 border-on-background neu-shadow max-w-lg w-full max-h-[90vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-label-bold text-label-bold uppercase">{preview.userName || preview.userId || "Anonim"}</p>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs">
                  {preview.template} • {preview.layout} • {new Date(preview.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="border-2 border-on-background p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <img src={preview.image} alt="fotobox" className="w-full border-2 border-on-background" />
          </div>
        </div>
      )}
    </div>
  );
}
