import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserOrders, getOrders } from "../data/orderStore";
import { printReceipt } from "../components/Receipt";

const STATUS_STYLES = {
  pending: { label: "Menunggu Konfirmasi", color: "bg-yellow-100 text-yellow-800 border-yellow-400", icon: "hourglass_top" },
  confirmed: { label: "Siap Dibayar", color: "bg-blue-100 text-blue-800 border-blue-400", icon: "credit_card" },
  paid: { label: "Lunas", color: "bg-green-100 text-green-800 border-green-400", icon: "check_circle" },
  completed: { label: "Selesai", color: "bg-surface-container text-on-surface-variant border-on-surface-variant", icon: "done_all" },
  cancelled: { label: "Dibatalkan", color: "bg-error-container text-error border-error", icon: "cancel" },
};

export default function UserOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [orders] = useState(
    user ? (isAdmin ? getOrders() : getUserOrders(user.id)) : []
  );

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-body-lg text-body-lg mb-4">Silakan login untuk melihat pesanan</p>
          <Link to="/login" className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase">
            Login
          </Link>
        </div>
      </div>
    );
  }

  function payOrder(orderId) {
    navigate(`/payment/${orderId}`);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
      <div className="max-w-2xl mx-auto px-gutter">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background">
            {isAdmin ? "Semua Pesanan" : "Pesanan Saya"}
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          {isAdmin ? "Riwayat pesanan dari semua pelanggan" : "Pantau status pesanan kamu"}
        </p>

        {orders.length === 0 ? (
          <div className="bg-surface border-2 border-on-background neu-shadow p-8 text-center">
            <span className="material-symbols-outlined text-[56px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 mb-4">Belum ada pesanan</p>
            <Link to="/menu" className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase inline-block">
              Mulai Pesan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              const isConfirmed = order.status === "confirmed";

              return (
                <div key={order.id} className="bg-surface border-2 border-on-background neu-shadow p-5">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <span className="font-label-bold text-label-bold uppercase text-on-surface-variant text-xs">
                        {order.id}
                      </span>
                      {isAdmin && (
                        <p className="font-label-bold text-label-bold uppercase text-on-background flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">person</span>
                          {order.userName || order.userId}
                        </p>
                      )}
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                        {new Date(order.createdAt).toLocaleString("id-ID")}
                      </p>
                      {order.tableNumber && (
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">table_restaurant</span>
                          Meja {order.tableNumber}
                        </p>
                      )}
                    </div>
                    <span className={`font-label-bold text-label-bold uppercase px-3 py-1 border-2 flex items-center gap-1 ${st.color}`}>
                      <span className="material-symbols-outlined text-sm">{st.icon}</span>
                      {st.label}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between font-body-md text-body-md">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-label-bold">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t-2 border-on-background pt-3">
                    <span className="font-headline-sm text-headline-sm">Total</span>
                    <span className="font-headline-sm text-headline-sm text-primary">${order.total}</span>
                  </div>

                  {isConfirmed && !isAdmin && (
                    <button
                      onClick={() => payOrder(order.id)}
                      className="w-full mt-4 bg-primary text-on-primary border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">payments</span>
                      Bayar Sekarang
                    </button>
                  )}

                  {order.status === "pending" && !isAdmin && (
                    <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 p-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-600">info</span>
                      <span className="font-body-md text-body-md text-yellow-800">
                        Menunggu konfirmasi dari admin...
                      </span>
                    </div>
                  )}

                  {order.status === "completed" && !isAdmin && (
                    <Link
                      to="/reviews"
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-surface text-on-background border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary hover:text-on-primary"
                    >
                      <span className="material-symbols-outlined">rate_review</span>
                      Beri Ulasan
                    </Link>
                  )}

                  {["paid", "completed"].includes(order.status) && !isAdmin && (
                    <button
                      onClick={() => printReceipt(order)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-surface text-on-background border-2 border-on-background neu-shadow px-4 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary hover:text-on-primary"
                    >
                      <span className="material-symbols-outlined">print</span>
                      Cetak Struk
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
