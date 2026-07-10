const STORAGE_KEY = "app_orders";

function generateId() {
  return "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function seedInitialOrders() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const seed = [
    {
      id: "ord_seed_001",
      userId: "usr_002",
      userName: "User Cafe",
      items: [
        { menuId: "mnu_001", name: "Autentic Espresso", price: 3.50, qty: 2 },
        { menuId: "mnu_020", name: "Blueberry Muffin", price: 3.75, qty: 1 },
      ],
      subtotal: 10.75,
      tax: 1.08,
      total: 11.83,
      status: "pending",
      notes: "Extra foam on espresso",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ord_seed_002",
      userId: "usr_003",
      userName: "Dina",
      items: [
        { menuId: "mnu_013", name: "Amber Cold Brew", price: 5.50, qty: 1 },
        { menuId: "mnu_017", name: "Brutal Butter Croissant", price: 4.00, qty: 1 },
      ],
      subtotal: 9.50,
      tax: 0.95,
      total: 10.45,
      status: "confirmed",
      notes: "",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ord_seed_003",
      userId: "usr_002",
      userName: "User Cafe",
      items: [
        { menuId: "mnu_007", name: "Cold Brew", price: 5.00, qty: 3 },
      ],
      subtotal: 15.00,
      tax: 1.50,
      total: 16.50,
      status: "paid",
      paymentMethod: "qris",
      paymentStatus: "paid",
      notes: "",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

seedInitialOrders();

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder({ userId, userName, items, total, notes, tableNumber }) {
  const orders = getOrders();
  const order = {
    id: generateId(),
    userId,
    userName,
    items: items.map((i) => ({
      menuId: i.menuId || "",
      name: i.name,
      price: parseFloat(i.price?.replace?.("$", "") || i.price || 0),
      qty: i.qty,
    })),
    subtotal: total,
    tax: +(total * 0.1).toFixed(2),
    total: +(total * 1.1).toFixed(2),
    status: "pending",
    notes: notes || "",
    tableNumber: tableNumber || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[idx];
}

export function setOrderPayment(orderId, method) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx].paymentMethod = method;
  orders[idx].paymentStatus = "paid";
  orders[idx].status = "paid";
  orders[idx].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[idx];
}

export function getUserOrders(userId) {
  return getOrders().filter((o) => o.userId === userId);
}

export function getOrdersByStatus(status) {
  return getOrders().filter((o) => o.status === status);
}
