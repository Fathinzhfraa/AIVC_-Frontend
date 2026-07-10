import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, setOrderPayment } from "../data/orderStore";
import Receipt, { printReceipt } from "../components/Receipt";
import database from "../data/database";

export default function Payment() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const [order, setOrder] = useState(() => {
    const orders = getOrders();
    return orders.find((o) => o.id === orderId) || null;
  });
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (order && selectedMethod && qrRef.current) {
      drawQR(qrRef.current, order, selectedMethod);
    }
  }, [order, selectedMethod]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <Link to="/login" className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase">
          Login dulu
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-body-lg text-body-lg mb-4">Pesanan tidak ditemukan</p>
          <Link to="/orders" className="text-primary underline">Kembali ke pesanan</Link>
        </div>
      </div>
    );
  }

  if (order.userId !== user.id && user.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <p className="font-body-lg text-body-lg text-error">Bukan pesanan kamu</p>
      </div>
    );
  }

  if (order.status !== "confirmed") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-[56px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          {order.status === "pending" ? (
            <>
              <p className="font-body-lg text-body-lg mt-2 mb-1">Pesanan belum dikonfirmasi admin</p>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Tunggu konfirmasi dari admin terlebih dahulu</p>
            </>
          ) : (
            <>
              <p className="font-body-lg text-body-lg mt-2 mb-1">Pesanan sudah {order.status}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Status: {order.status}</p>
            </>
          )}
          <Link to="/orders" className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase inline-block">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
        <div className="max-w-md mx-auto px-gutter flex flex-col items-center">
          <span className="material-symbols-outlined text-[56px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2 className="font-headline-md text-headline-md uppercase text-center mb-1">Pembayaran Berhasil!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-center mb-5">
            Pesanan #{order.id} sudah dibayar. Ini struk pembelian kamu.
          </p>

          <Receipt order={order} />

          <button
            onClick={() => printReceipt(order)}
            className="mt-5 w-full bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-surface-container flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">print</span>
            Cetak Struk
          </button>

          <button
            onClick={() => navigate("/reviews")}
            className="mt-3 w-full bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">rate_review</span>
            Beri Ulasan
          </button>

          <div className="flex gap-3 w-full mt-3">
            <Link to="/orders" className="flex-1 text-center bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
              Lihat Pesanan
            </Link>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-surface text-on-background border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handlePay() {
    if (!selectedMethod) return;
    setOrderPayment(order.id, selectedMethod.id);
    setPaid(true);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-surface-container py-6 md:py-10">
      <div className="max-w-md mx-auto px-gutter">
        <div className="bg-surface border-2 border-on-background neu-shadow p-5 mb-4">
          <h2 className="font-label-bold text-label-bold uppercase text-on-background mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">payments</span>
            Pembayaran
          </h2>
          <div className="space-y-1 mb-4">
            <p className="font-body-md text-body-md">
              Pesanan: <span className="font-label-bold">{order.id}</span>
            </p>
            {order.items.map((item, i) => (
              <p key={i} className="font-body-md text-body-md text-on-surface-variant">
                {item.qty}x {item.name}
              </p>
            ))}
          </div>
          <div className="border-t-2 border-on-background pt-3 flex justify-between items-center">
            <span className="font-headline-sm text-headline-sm">Total</span>
            <span className="font-headline-sm text-headline-sm text-primary">${order.total}</span>
          </div>
        </div>

        {/* Payment method selection */}
        {!selectedMethod ? (
          <div className="bg-surface border-2 border-on-background neu-shadow p-5">
            <h3 className="font-label-bold text-label-bold uppercase text-on-background mb-4">
              Pilih Metode Pembayaran
            </h3>
            <div className="space-y-3">
              {database.paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m)}
                  className="w-full border-2 border-on-background p-4 flex items-center gap-3 bg-background hover:bg-surface-container transition-all neu-card text-left"
                >
                  <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {m.icon}
                  </span>
                  <span className="font-label-bold text-label-bold uppercase">{m.name}</span>
                  <span className="ml-auto material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface border-2 border-on-background neu-shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setSelectedMethod(null)} className="text-on-surface-variant hover:text-on-background">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h3 className="font-label-bold text-label-bold uppercase">
                {selectedMethod.name}
              </h3>
            </div>

            <div className="flex justify-center mb-4">
              <canvas
                ref={qrRef}
                width={280}
                height={280}
                className="border-2 border-on-background"
              />
            </div>

            <div className="text-center mb-4">
              <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                Scan QR Code untuk membayar
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Total: <strong className="text-primary">${order.total}</strong>
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Pesanan: {order.id}
              </p>
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-primary text-on-primary border-2 border-on-background neu-shadow px-6 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-primary-container hover:text-on-background flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">done</span>
              Saya Sudah Bayar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function drawQR(canvas, order, method) {
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cell = size / 25;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // QR-like pattern
  const data = `${method.id}:${order.id}:${order.total}:AUTENTICS`;
  let seed = 0;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 31 + data.charCodeAt(i)) & 0xffffffff;
  }

  function pseudoRandom() {
    seed = (seed * 1103515245 + 12345) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  }

  ctx.fillStyle = "#1a1c1c";

  // position markers (top-left, top-right, bottom-left)
  const markers = [
    [1, 1], [18, 1], [1, 18]
  ];
  markers.forEach(([mx, my]) => {
    ctx.fillRect(mx * cell, my * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((mx + 1) * cell, (my + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "#1a1c1c";
    ctx.fillRect((mx + 2) * cell, (my + 2) * cell, 3 * cell, 3 * cell);
    ctx.fillStyle = "#1a1c1c";
  });

  // timing patterns
  for (let i = 0; i < 25; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * cell, 6 * cell, cell, cell);
      ctx.fillRect(6 * cell, i * cell, cell, cell);
    }
  }

  // data cells
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      const inMarker = markers.some(
        ([mx, my]) =>
          col >= mx && col < mx + 7 && row >= my && row < my + 7
      );
      const inTiming =
        (row === 6 && col > 0 && col < 24) ||
        (col === 6 && row > 0 && row < 24);
      if (inMarker || inTiming) continue;
      if (col > 17 && row > 17) continue;

      const r = pseudoRandom();
      if (r > 0.5) {
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
  }

  // center logo area
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(10 * cell, 10 * cell, 5 * cell, 5 * cell);
  ctx.fillStyle = "#8d4b00";
  ctx.font = `bold ${cell * 2.5}px 'Playfair Display', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", size / 2, size / 2);

  // payment text below
  ctx.fillStyle = "#1a1c1c";
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${method.name} • $${order.total}`, size / 2, size - 4);
}
