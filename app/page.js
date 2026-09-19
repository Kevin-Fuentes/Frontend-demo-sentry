"use client";

import { useState } from "react";

const products = [
  { id: "p1", name: "Auriculares Pro", price: 89.9, emoji: "🎧" },
  { id: "p2", name: "Teclado Mecánico", price: 129.0, emoji: "⌨️" },
  { id: "p3", name: "Monitor 27\"", price: 349.5, emoji: "🖥️" },
  { id: "p4", name: "Webcam 4K", price: 74.0, emoji: "📷" },
];

// Simulated API response: "Bob" is a legacy record that never got an `address`.
const customers = [
  { id: 1, name: "Alice", email: "alice@nova.co", address: { city: "Bogotá" } },
  { id: 2, name: "Bob", email: "bob@nova.co" }, // <-- no `address`
];

const SHIPPING_BY_CITY = { Bogotá: 8, Medellín: 10, Cartagena: 14 };

// BUG #1 (cliente): lee user.address.city sin comprobar que `address` exista.
// Funciona para Alice, lanza TypeError para Bob:
//   "Cannot read properties of undefined (reading 'city')"
// Fix: return user.address?.city ?? "Ciudad desconocida";
function getUserCity(user) {
  return user.address.city;
}

const money = (n) => `$${n.toFixed(2)}`;

export default function Home() {
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(null);
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function notify(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

  function addLog(kind, text) {
    const time = new Date().toLocaleTimeString();
    setLog((l) => [{ kind, text: `[${time}] ${text}` }, ...l].slice(0, 6));
  }

  function addToCart(p) {
    setCart((c) => {
      const found = c.find((i) => i.id === p.id);
      if (found) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  }

  // Sin try/catch a propósito: la excepción llega al handler global de Sentry.
  function calculateShipping(customer) {
    const city = getUserCity(customer); // <-- revienta con Bob
    const cost = SHIPPING_BY_CITY[city] ?? 20;
    setShipping({ name: customer.name, city, cost });
    addLog("ok", `Envío a ${city} para ${customer.name}: ${money(cost)}`);
  }

  async function post(payload, label) {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      notify("success", `✅ ${label}: total ${money(data.total)}`);
      addLog("ok", `POST /api/checkout → 200 (${money(data.total)})`);
    } catch (e) {
      notify("error", `❌ ${label} falló (${e.message}). Revisa Sentry.`);
      addLog("err", `POST /api/checkout → ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Flujo normal: manda `items`, funciona.
  const checkout = () => post({ items: cart }, "Pedido");

  // BUG #2: "pago exprés" manda otro formato (sin `items`) y el servidor
  // hace body.items.reduce(...) → 500.
  const expressCheckout = () =>
    post({ express: true, productId: products[0].id }, "Pago exprés");

  return (
    <div className="wrap">
      <nav className="nav">
        <div className="logo"><i>N</i> Nova Store</div>
        <span className="pill"><b>●</b> Monitoreado por Sentry</span>
      </nav>

      <header className="hero">
        <h1>Tecnología para tu escritorio</h1>
        <p>
          Mini tienda de demostración. Usa la app normalmente: dos flujos tienen bugs
          ocultos que Sentry va a capturar.
        </p>
      </header>

      <div className="grid">
        <div>
          <section className="card">
            <h2>Productos</h2>
            <p className="sub">Agrega al carrito y paga.</p>
            <div className="products">
              {products.map((p) => (
                <div className="product" key={p.id}>
                  <div className="emoji">{p.emoji}</div>
                  <h3>{p.name}</h3>
                  <div className="price">{money(p.price)}</div>
                  <button className="btn block" onClick={() => addToCart(p)}>Agregar</button>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Clientes y envío</h2>
            <p className="sub">Calcula el costo de envío según la ciudad del cliente.</p>
            {customers.map((c) => (
              <div className="customer" key={c.id}>
                <div className="avatar">{c.name[0]}</div>
                <div className="info">
                  <b>{c.name}</b>
                  <span>{c.email}</span>
                </div>
                <button className="btn ghost" onClick={() => calculateShipping(c)}>
                  Calcular envío
                </button>
              </div>
            ))}
            {shipping && (
              <div className="result">
                📦 Envío para <b>{shipping.name}</b> a <b>{shipping.city}</b>:{" "}
                <b>{money(shipping.cost)}</b>
              </div>
            )}
          </section>
        </div>

        <aside>
          <section className="card">
            <h2>🛒 Carrito</h2>
            {cart.length === 0 ? (
              <div className="empty">Tu carrito está vacío</div>
            ) : (
              cart.map((i) => (
                <div className="cart-line" key={i.id}>
                  <span>{i.name} <small>× {i.qty}</small></span>
                  <b>{money(i.price * i.qty)}</b>
                </div>
              ))
            )}
            <div className="total"><span>Total</span><span>{money(total)}</span></div>
            <div className="actions">
              <button className="btn" disabled={!cart.length || busy} onClick={checkout}>
                Pagar pedido
              </button>
              <button className="btn warn" disabled={busy} onClick={expressCheckout}>
                ⚡ Pago exprés (1 clic)
              </button>
            </div>
            <p className="hint">Prueba primero “Pagar pedido”: funciona. Luego el exprés.</p>
          </section>

          <section className="card">
            <h2>Actividad</h2>
            <div className="log">
              {log.length === 0 && <div>Sin eventos todavía…</div>}
              {log.map((l, i) => (
                <div key={i} className={l.kind}>{l.text}</div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </div>
  );
}
