"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [paidInput, setPaidInput] = useState<string>("");

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `/api/products?page=1&limit=100&search=${search}`,
      );
      const data = await res.json();
      setProducts(data.data);
    }
    load();
  }, [search]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((p) => p.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Stok tidak mencukupi");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      if (product.stock <= 0) {
        alert("Stok habis");
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId: string, amount: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const product = products.find((p) => p.id === productId);
          if (!product) return item;
          const newQty = item.quantity + amount;
          if (newQty > product.stock) {
            alert("Melebihi stok!");
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = paidAmount !== null ? paidAmount - total : 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });
    if (res.ok) {
      alert("Transaksi berhasil!");
      setCart([]);
      setPaidAmount(null);
      setShowCart(false);
      const reload = await fetch("/api/products?page=1&limit=100");
      const data = await reload.json();
      setProducts(data.data);
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f5f3ef;
          --surface: #ffffff;
          --surface2: #faf9f7;
          --border: #e8e4dd;
          --border2: #f0ece6;
          --text: #1a1814;
          --text2: #6b6560;
          --text3: #aaa49d;
          --accent: #e8500a;
          --accent-light: #fff0eb;
          --accent-border: #fbd5c2;
          --green: #1a7a4a;
          --green-bg: #edf7f2;
          --green-border: #b6e4cc;
          --red: #d93025;
          --red-bg: #fef0ee;
          --orange: #c45c00;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --shadow-lg: 0 8px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
          --radius: 14px;
          --radius-sm: 9px;
        }

        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); }

        .pos-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
        }

        /* ── LEFT PANEL ── */
        .pos-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .pos-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          gap: 12px;
          flex-shrink: 0;
        }

        .pos-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.4px;
          white-space: nowrap;
        }

        .pos-title span { color: var(--accent); }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-logout {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: transparent;
          color: var(--text2);
          border: 1px solid var(--border);
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-logout:hover {
          border-color: var(--red);
          color: var(--red);
          background: var(--red-bg);
        }

        .btn-cart-toggle {
          display: none;
          align-items: center;
          gap: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          background: var(--accent);
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .btn-cart-toggle:hover { background: #c94008; }

        .cart-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: white;
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
          border-radius: 50%;
          width: 18px;
          height: 18px;
        }

        .search-area {
          padding: 14px 24px;
          background: var(--surface);
          border-bottom: 1px solid var(--border2);
          flex-shrink: 0;
        }

        .search-wrap { position: relative; }

        .search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          pointer-events: none;
          line-height: 1;
          opacity: 0.5;
        }

        .search-input {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 12px 10px 36px;
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input::placeholder { color: var(--text3); font-weight: 400; }

        .search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232, 80, 10, 0.1);
          background: white;
        }

        .product-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 14px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-scroll::-webkit-scrollbar { width: 5px; }
        .product-scroll::-webkit-scrollbar-track { background: transparent; }
        .product-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .product-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius-sm);
          padding: 13px 16px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease;
          box-shadow: var(--shadow-sm);
          gap: 12px;
        }

        .product-item:hover:not(:disabled) {
          border-color: var(--accent-border);
          background: var(--accent-light);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .product-item:active:not(:disabled) { transform: translateY(0); }
        .product-item:disabled { opacity: 0.45; cursor: not-allowed; }

        .product-info { flex: 1; min-width: 0; }

        .product-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-stock-tag {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .stock-ok { background: var(--green-bg); color: var(--green); }
        .stock-low { background: #fff4e0; color: var(--orange); }
        .stock-out { background: var(--red-bg); color: var(--red); }

        .product-price {
          font-size: 14px;
          font-weight: 800;
          color: var(--accent);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
          color: var(--text3);
          font-size: 14px;
        }

        /* ── RIGHT PANEL (CART) ── */
        .pos-right {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--surface);
          border-left: 1px solid var(--border);
          overflow: hidden;
        }

        .cart-header {
          padding: 20px 20px 14px;
          border-bottom: 1px solid var(--border2);
          flex-shrink: 0;
        }

        .cart-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .cart-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.3px;
        }

        .cart-subtitle {
          font-size: 12px;
          color: var(--text3);
          font-weight: 500;
          margin-top: 2px;
        }

        .btn-close-cart {
          display: none;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 14px;
          align-items: center;
          justify-content: center;
          color: var(--text2);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .btn-close-cart:hover {
          background: var(--red-bg);
          border-color: var(--red);
          color: var(--red);
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .cart-items::-webkit-scrollbar { width: 4px; }
        .cart-items::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 120px;
          color: var(--text3);
          font-size: 13px;
          gap: 8px;
        }

        .cart-empty-icon { font-size: 28px; opacity: 0.5; }

        .cart-item {
          background: var(--surface2);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius-sm);
          padding: 11px 13px;
        }

        .cart-item-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .qty-controls {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .qty-btn {
          background: transparent;
          border: none;
          color: var(--text2);
          width: 28px;
          height: 26px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
          font-weight: 700;
        }

        .qty-btn:hover {
          background: var(--accent-light);
          color: var(--accent);
        }

        .qty-value {
          font-size: 13px;
          font-weight: 800;
          color: var(--text);
          width: 26px;
          text-align: center;
          border-left: 1px solid var(--border2);
          border-right: 1px solid var(--border2);
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-subtotal {
          font-size: 13px;
          font-weight: 800;
          color: var(--accent);
        }

        .checkout-area {
          border-top: 1px solid var(--border);
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--surface);
          flex-shrink: 0;
        }

        .total-block {
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 11px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text2);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .total-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text2);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 6px;
          display: block;
        }

        .money-input {
          width: 100%;
          background: white;
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 700;
          padding: 10px 13px;
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .money-input::placeholder { color: var(--text3); font-size: 13px; font-weight: 400; }

        .money-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232, 80, 10, 0.1);
        }

        .change-block {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 13px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--green-border);
          background: var(--green-bg);
        }

        .change-block.neg {
          border-color: #ffc8bf;
          background: var(--red-bg);
        }

        .change-block.neutral {
          border-color: var(--border);
          background: var(--bg);
        }

        .change-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text2);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .change-value { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
        .change-value.pos { color: var(--green); }
        .change-value.neu { color: var(--text3); }
        .change-value.neg { color: var(--red); }

        .warning-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--red);
          text-align: center;
        }

        .btn-pay {
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-sm);
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--accent);
          color: white;
          box-shadow: 0 4px 14px rgba(232, 80, 10, 0.3);
        }

        .btn-pay:hover:not(:disabled) {
          background: #c94008;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(232, 80, 10, 0.35);
        }

        .btn-pay:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-pay:disabled {
          background: var(--border);
          color: var(--text3);
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Mobile overlay */
        .cart-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 40;
          backdrop-filter: blur(2px);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .btn-cart-toggle { display: flex; }

          .pos-right {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: min(360px, 92vw);
            z-index: 50;
            transform: translateX(110%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-lg);
          }

          .pos-right.open { transform: translateX(0); }

          .cart-overlay.open { display: block; }

          .btn-close-cart { display: flex; }

          .search-area { padding: 12px 16px; }
          .product-scroll { padding: 12px 16px; }
          .pos-topbar { padding: 14px 16px; }
          .pos-title { font-size: 18px; }
        }

        @media (max-width: 400px) {
          .product-item { padding: 11px 13px; }
          .product-name { font-size: 13px; }
          .product-price { font-size: 13px; }
          .pos-topbar { gap: 8px; }
        }
      `}</style>

      <div className="pos-root">
        <div
          className={`cart-overlay ${showCart ? "open" : ""}`}
          onClick={() => setShowCart(false)}
        />

        {/* ── LEFT: Product List ── */}
        <div className="pos-left">
          <div className="pos-topbar">
            <h1 className="pos-title">
              Kasir <span>POS</span>
            </h1>
            <div className="topbar-right">
              <button
                className="btn-cart-toggle"
                onClick={() => setShowCart(true)}
              >
                🛒 Keranjang
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>
              <button
                className="btn-logout"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Keluar
              </button>
            </div>
          </div>

          <div className="search-area">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="product-scroll">
            {products.length === 0 && search && (
              <div className="empty-state">
                Produk tidak ditemukan untuk {search}
              </div>
            )}
            {products.map((product) => {
              const stockClass =
                product.stock === 0
                  ? "stock-out"
                  : product.stock <= 5
                    ? "stock-low"
                    : "stock-ok";
              const stockLabel =
                product.stock === 0
                  ? "Habis"
                  : product.stock <= 5
                    ? `Sisa ${product.stock}`
                    : `Stok ${product.stock}`;
              return (
                <button
                  key={product.id}
                  className="product-item"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart(product);
                    setSearch("");
                  }}
                >
                  <div className="product-info">
                    <p className="product-name">{product.name}</p>
                    <span className={`product-stock-tag ${stockClass}`}>
                      {stockLabel}
                    </span>
                  </div>
                  <p className="product-price">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className={`pos-right ${showCart ? "open" : ""}`}>
          <div className="cart-header">
            <div className="cart-header-row">
              <div>
                <h2 className="cart-title">Keranjang</h2>
                <p className="cart-subtitle">
                  {cartCount === 0
                    ? "Belum ada item"
                    : `${cartCount} item dipilih`}
                </p>
              </div>
              <button
                className="btn-close-cart"
                onClick={() => setShowCart(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty-icon">🛒</span>
                Pilih produk untuk ditambahkan
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  <p className="cart-item-name">{item.name}</p>
                  <div className="cart-item-row">
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-subtotal">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="checkout-area">
            <div className="total-block">
              <span className="total-label">Total</span>
              <span className="total-value">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>

            <div>
              <span className="field-label">Uang Dibayar</span>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontWeight: 700,
                    color: "#6b6560",
                  }}
                >
                  Rp
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  className="money-input"
                  style={{ paddingLeft: "40px" }}
                  value={paidInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");

                    if (!raw) {
                      setPaidAmount(null);
                      setPaidInput("");
                      return;
                    }

                    const numberValue = parseInt(raw);

                    setPaidAmount(numberValue);
                    setPaidInput(
                      new Intl.NumberFormat("id-ID").format(numberValue),
                    );
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div
              className={`change-block ${paidAmount === null ? "neutral" : change < 0 ? "neg" : ""}`}
            >
              <span className="change-label">Kembalian</span>
              <span
                className={`change-value ${paidAmount === null ? "neu" : change < 0 ? "neg" : "pos"}`}
              >
                Rp{" "}
                {paidAmount !== null && change > 0
                  ? change.toLocaleString("id-ID")
                  : "0"}
              </span>
            </div>

            {paidAmount !== null && change < 0 && (
              <p className="warning-text">
                ⚠ Uang kurang Rp {Math.abs(change).toLocaleString("id-ID")}
              </p>
            )}

            <button
              className="btn-pay"
              disabled={
                loading ||
                cart.length === 0 ||
                paidAmount === null ||
                paidAmount < total
              }
              onClick={handleCheckout}
            >
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
