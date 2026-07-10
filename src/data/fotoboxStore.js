const API = "/api/fotobox";

export async function saveFotobox(payload) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan fotobox");
  return res.json();
}

export async function getFotoboxes(userId) {
  const url = userId ? `${API}?userId=${encodeURIComponent(userId)}` : API;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat fotobox");
  const data = await res.json();
  return data.items || [];
}

export async function deleteFotobox(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus fotobox");
  return res.json();
}
