"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  pcsPerDus: number | null;
};

export default function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [priceInput, setPriceInput] = useState<string>("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [pcsPerDus, setPcsPerDus] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await props.params;
      setId(id);
      const res = await fetch(`/api/products?page=1&limit=100`);
      const data = await res.json();
      const product = data.data.find((p: Product) => p.id === id);
      if (product) {
        setName(product.name);
        setPrice(product.price);
        setPriceInput(new Intl.NumberFormat("id-ID").format(product.price));
        setStock(product.stock);
        setPcsPerDus(product.pcsPerDus ?? 1);
      }
      setLoading(false);
    }
    load();
  }, [props.params]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, stock, pcsPerDus }),
    });
    router.push("/dashboard/products");
  }

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f5f3ef; }
          .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 64px 32px;
            color: #aaa49d;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
          .loading-spinner {
            width: 18px; height: 18px;
            border: 2px solid #e8e4dd;
            border-top-color: #e8500a;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="loading-state">
          <span className="loading-spinner" />
          Memuat data produk...
        </div>
      </>
    );
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
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --radius: 14px;
          --radius-sm: 9px;
        }

        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }

        .edit-page {
          padding: 28px 32px;
          max-width: 560px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text3);
          text-decoration: none;
          margin-bottom: 20px;
          transition: color 0.15s;
        }

        .back-link:hover { color: var(--accent); }

        .page-heading {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .page-subheading {
          font-size: 13px;
          color: var(--text3);
          font-weight: 500;
          margin-bottom: 24px;
        }

        .edit-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          background: var(--accent-light);
          color: var(--accent);
          border: 1.5px solid var(--accent-border);
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 18px;
          width: fit-content;
        }

        .form-card {
          background: var(--surface);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          padding: 28px 26px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field { display: flex; flex-direction: column; gap: 6px; }

        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text2);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .field-hint {
          font-size: 11px;
          font-weight: 500;
          color: var(--text3);
          margin-top: 2px;
        }

        .field-input {
          width: 100%;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 13px;
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.15s;
          -webkit-appearance: none;
          appearance: none;
        }

        .field-input::placeholder { color: var(--text3); font-weight: 400; }

        .field-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232, 80, 10, 0.1);
          background: var(--surface);
        }

        .price-wrap { position: relative; }

        .price-prefix {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          font-weight: 700;
          color: var(--text3);
          pointer-events: none;
        }

        .price-input { padding-left: 40px !important; }

        .field-input[type="number"]::-webkit-inner-spin-button,
        .field-input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .field-input[type="number"] { -moz-appearance: textfield; }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-divider {
          border: none;
          border-top: 1.5px solid var(--border2);
        }

        .btn-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .btn-cancel {
          flex: 1;
          padding: 13px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          background: var(--surface);
          color: var(--text2);
          transition: all 0.15s;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-cancel:hover {
          background: var(--surface2);
          border-color: var(--text3);
          color: var(--text);
        }

        .btn-submit {
          flex: 2;
          padding: 13px;
          border-radius: var(--radius-sm);
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--accent);
          color: white;
          box-shadow: 0 4px 14px rgba(232, 80, 10, 0.28);
          letter-spacing: -0.1px;
        }

        .btn-submit:hover:not(:disabled) {
          background: #c94008;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(232, 80, 10, 0.32);
        }

        .btn-submit:active:not(:disabled) { transform: translateY(0); }

        .btn-submit:disabled {
          background: var(--border);
          color: var(--text3);
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-loading {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .edit-page { padding: 18px 16px; }
          .form-card { padding: 20px 16px; gap: 16px; }
          .page-heading { font-size: 20px; }
          .two-col { grid-template-columns: 1fr; gap: 16px; }
          .btn-row { flex-direction: column; }
          .btn-cancel, .btn-submit { flex: unset; }
        }
      `}</style>

      <div className="edit-page">
        <Link href="/dashboard/products" className="back-link">
          ← Kembali ke Produk
        </Link>

        <h1 className="page-heading">Edit Produk</h1>
        <p className="page-subheading">Ubah detail produk yang sudah ada</p>

        <span className="edit-badge">✏️ Mode Edit</span>

        <form className="form-card" onSubmit={handleSubmit}>

          {/* Nama */}
          <div className="field">
            <label className="field-label">Nama Produk</label>
            <input
              type="text"
              className="field-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <hr className="form-divider" />

          {/* Harga */}
          <div className="field">
            <label className="field-label">Harga Jual</label>
            <div className="price-wrap">
              <span className="price-prefix">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                className="field-input price-input"
                required
                value={priceInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  if (!raw) { setPrice(0); setPriceInput(""); return; }
                  const num = parseInt(raw);
                  setPrice(num);
                  setPriceInput(new Intl.NumberFormat("id-ID").format(num));
                }}
              />
            </div>
          </div>

          {/* Stok & Pcs per Dus */}
          <div className="two-col">
            <div className="field">
              <label className="field-label">Stok</label>
              <input
                type="number"
                className="field-input"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label className="field-label">Pcs per Dus</label>
              <input
                type="number"
                className="field-input"
                required
                min={1}
                value={pcsPerDus}
                onChange={(e) => setPcsPerDus(Number(e.target.value))}
              />
              <span className="field-hint">1 dus = ? pcs</span>
            </div>
          </div>

          {/* Buttons */}
          <hr className="form-divider" />
          <div className="btn-row">
            <Link href="/dashboard/products" className="btn-cancel">
              Batal
            </Link>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? (
                <span className="btn-loading">
                  <span className="spinner" /> Menyimpan...
                </span>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}