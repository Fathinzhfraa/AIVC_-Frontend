import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../data/orderStore";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function CartDrawer({ open, onClose }) {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", notes: "", tableNumber: "" });
  const [submitted, setSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const isAdmin = user?.role === "admin";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (isAdmin) return;
    if (!form.tableNumber) return;
    const order = createOrder({
      userId: user.id,
      userName: form.name || user.name,
        items: items.map((i) => ({
          menuId: i.menuId,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
      total: totalPrice,
      notes: form.notes,
      tableNumber: form.tableNumber,
    });
    setCreatedOrderId(order.id);
    setSubmitted(true);
  };

  function handleViewOrder() {
    clearCart();
    setShowCheckout(false);
    setSubmitted(false);
    setForm({ name: "", phone: "", notes: "", tableNumber: "" });
    onClose();
    navigate("/orders");
  }

  if (!open) return null;

  if (submitted) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l-2 border-on-background z-50 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span
              className="material-symbols-outlined text-6xl text-primary mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <h3 className="font-headline-sm text-headline-sm uppercase mb-2">
              Pesanan Dikirim!
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-2">
              Terima kasih, {form.name || user?.name}!
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Pesanan #{createdOrderId} sedang menunggu konfirmasi admin.
            </p>
            <button
              onClick={handleViewOrder}
              className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-8 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Lihat Status Pesanan
            </button>
          </div>
        </div>
      </>
    );
  }

  if (showCheckout) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCheckout(false)} />
        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l-2 border-on-background z-50 flex flex-col">
          <div className="flex items-center justify-between px-gutter py-4 border-b-2 border-on-background">
            <h2 className="font-headline-sm text-headline-sm uppercase">Checkout</h2>
            <button onClick={() => setShowCheckout(false)} className="border-2 border-on-background p-1 neu-shadow active:translate-x-1 active:translate-y-1 active:shadow-none">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-gutter">
            {!user && (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-3 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600">info</span>
                <span className="font-body-md text-body-md text-yellow-800">Kamu harus login untuk checkout</span>
              </div>
            )}
            {isAdmin && (
              <div className="bg-error-container border-2 border-error p-3 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-error">block</span>
                <span className="font-body-md text-body-md text-error">Admin tidak dapat melakukan pemesanan</span>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.name} className="flex justify-between items-center border-b-2 border-on-background pb-2">
                  <div>
                    <p className="font-label-bold text-label-bold uppercase">{item.name}</p>
                    <p className="text-sm text-on-surface-variant">{item.qty} x {item.price}</p>
                  </div>
                  <span className="font-label-bold text-primary">${(item.qty * parseFloat(item.price.replace("$", ""))).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="font-headline-sm text-headline-sm text-right mb-6">
              Total: ${totalPrice.toFixed(2)}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label-bold text-label-bold uppercase block mb-1">Nama</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-on-background px-3 py-2 bg-surface font-body-md text-body-md focus:neu-shadow focus:outline-none transition-shadow"
                  placeholder={user?.name || "Nama kamu"}
                />
              </div>
              <div>
                <label className="font-label-bold text-label-bold uppercase block mb-1">No. Telepon</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border-2 border-on-background px-3 py-2 bg-surface font-body-md text-body-md focus:neu-shadow focus:outline-none transition-shadow"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="font-label-bold text-label-bold uppercase block mb-1">No. Meja</label>
                <div className="grid grid-cols-4 gap-2">
                  {TABLES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setForm({ ...form, tableNumber: String(t) })}
                      className={`aspect-square border-2 border-on-background neu-shadow flex items-center justify-center font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
                        form.tableNumber === String(t)
                          ? "bg-primary text-on-primary"
                          : "bg-surface text-on-background hover:bg-primary-container"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {!form.tableNumber && (
                  <p className="font-body-md text-body-md text-error mt-2">Pilih nomor meja</p>
                )}
              </div>
              <div>
                <label className="font-label-bold text-label-bold uppercase block mb-1">Catatan</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border-2 border-on-background px-3 py-2 bg-surface font-body-md text-body-md focus:neu-shadow focus:outline-none transition-shadow resize-none"
                  rows={3}
                  placeholder="Catatan untuk pesanan (opsional)"
                />
              </div>
              <button
                type="submit"
                disabled={isAdmin}
                className={`w-full border-2 border-on-background neu-shadow py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
                  isAdmin
                    ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                    : "bg-primary text-on-primary"
                }`}
              >
                {isAdmin ? "Admin tidak bisa pesan" : user ? "Kirim Pesanan" : "Login untuk Checkout"}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l-2 border-on-background z-50 flex flex-col">
        <div className="flex items-center justify-between px-gutter py-4 border-b-2 border-on-background">
          <h2 className="font-headline-sm text-headline-sm uppercase">Pesanan ({totalItems})</h2>
          <button onClick={onClose} className="border-2 border-on-background p-1 neu-shadow active:translate-x-1 active:translate-y-1 active:shadow-none">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Belum ada pesanan</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Tambahkan menu favorit kamu!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-gutter">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.name} className="border-2 border-on-background p-3 neu-card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-label-bold text-label-bold uppercase text-sm">{item.name}</h4>
                    <button onClick={() => removeItem(item.name)} className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                  <p className="font-label-bold text-primary mb-2">{item.price}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.name, item.qty - 1)} className="border-2 border-on-background w-8 h-8 flex items-center justify-center neu-shadow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-label-bold">-</button>
                    <span className="font-label-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.name, item.qty + 1)} className="border-2 border-on-background w-8 h-8 flex items-center justify-center neu-shadow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-label-bold">+</button>
                    <span className="ml-auto font-label-bold text-primary">${(item.qty * parseFloat(item.price.replace("$", ""))).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t-2 border-on-background p-gutter space-y-3">
            <div className="flex justify-between font-headline-sm text-headline-sm">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {isAdmin ? (
              <div className="bg-error-container border-2 border-error p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error">block</span>
                <span className="font-body-md text-body-md text-error">Admin tidak dapat melakukan pemesanan</span>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-primary text-on-primary border-2 border-on-background neu-shadow py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Lanjut ke Checkout
              </button>
            )}
            <button
              onClick={clearCart}
              className="w-full bg-surface text-on-background border-2 border-on-background py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Kosongkan Pesanan
            </button>
          </div>
        )}
      </div>
    </>
  );
}
