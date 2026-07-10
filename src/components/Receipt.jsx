function fmt(n) {
  return "$" + (Number(n) || 0).toFixed(2);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

export function receiptHtml(order) {
  if (!order) return "";
  const items = order.items || [];
  const subtotal = items.reduce(
    (s, i) => s + (Number(i.price) || 0) * (i.qty || 1),
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString("id-ID")
    : "-";
  const rows = items
    .map(
      (i) => `
      <div style="display:flex;justify-content:space-between;font-size:12px;margin:2px 0;">
        <span>${i.qty || 1}x ${escapeHtml(i.name || "-")}</span>
        <span>${fmt((Number(i.price) || 0) * (i.qty || 1))}</span>
      </div>`
    )
    .join("");

  return `
  <div style="width:300px;background:#fff;color:#1a1c1c;font-family:'Courier New',Courier,monospace;padding:20px 18px;box-sizing:border-box;border:1px solid #1a1c1c;">
    <div style="text-align:center;">
      <div style="font-size:20px;font-weight:bold;letter-spacing:1px;">AUTENTIC'S</div>
      <div style="font-size:10px;letter-spacing:2px;margin-top:2px;">&#9749; COFFEE &amp; CO</div>
      <div style="font-size:9px;margin-top:4px;color:#555;">Jl. Kopi Hangat No. 12 &bull; (021) 555-0123</div>
    </div>
    <div style="border-top:1px dashed #1a1c1c;margin:10px 0;"></div>
    <div style="font-size:11px;line-height:1.6;">
      <div style="display:flex;justify-content:space-between;"><span>No. Pesanan</span><span>${escapeHtml(order.id || "-")}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>Tanggal</span><span>${escapeHtml(date)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>Kasir</span><span>${escapeHtml(order.userName || order.userId || "-")}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>No. Meja</span><span>${escapeHtml(order.tableNumber || "-")}</span></div>
    </div>
    <div style="border-top:1px dashed #1a1c1c;margin:10px 0;"></div>
    ${rows}
    <div style="border-top:1px dashed #1a1c1c;margin:10px 0;"></div>
    <div style="font-size:12px;line-height:1.8;">
      <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>PPN 10%</span><span>${fmt(tax)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:4px;"><span>TOTAL</span><span>${fmt(total)}</span></div>
    </div>
    <div style="border-top:1px dashed #1a1c1c;margin:10px 0;"></div>
    <div style="font-size:11px;line-height:1.6;">
      <div style="display:flex;justify-content:space-between;"><span>Metode</span><span>${(order.paymentMethod || "-").toUpperCase()}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>Status</span><span>LUNAS</span></div>
    </div>
    <div style="border-top:1px dashed #1a1c1c;margin:10px 0;"></div>
    <div style="text-align:center;font-size:11px;line-height:1.5;">
      <div style="font-weight:bold;font-size:13px;">TERIMA KASIH!</div>
      <div>Simpan struk ini sebagai bukti</div>
      <div>pembayaran ya &#9749;</div>
    </div>
    <div style="text-align:center;font-size:9px;margin-top:8px;color:#555;">autentics.coffee &bull; @autentics.cafe</div>
  </div>`;
}

export function printReceipt(order) {
  const w = window.open("", "_blank", "width=340,height=720");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Struk Autentic's</title></head><body style="margin:0;background:#ddd;display:flex;justify-content:center;padding:16px;">${receiptHtml(order)}</body></html>`
  );
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 300);
}

export default function Receipt({ order }) {
  return <div dangerouslySetInnerHTML={{ __html: receiptHtml(order) }} />;
}
