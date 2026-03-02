"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Store = {
  id: string;
  name: string;
};

export default function CreateProductPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [priceInput, setPriceInput] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [stock, setStock] = useState<number | null>(null);
  const [pcsPerDus, setPcsPerDus] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.user?.role) setRole(data.user.role);
    }
    fetchSession();
  }, []);

  useEffect(() => {
    if (role === "OWNER") {
      fetch("/api/stores")
        .then((res) => res.json())
        .then((data: Store[]) => setStores(data));
    }
  }, [role]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (!name || !price || !stock || !pcsPerDus) {
      alert("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    const body =
      role === "OWNER"
        ? { name, description, price, stock, pcsPerDus, storeId: selectedStore }
        : { name, description, price, stock, pcsPerDus };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/dashboard/products");
    } else {
      alert("Gagal menambahkan produk");
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
          --red: #d93025;
          --red-bg: #fef0ee;
          --blue: #1558d6;
          --blue-bg: #eef3fe;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --radius: 14px;
          --radius-sm: 9px;
        }

        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }

        /* ── PAGE ── */
        .create-page {
          padding: 28px 32px;
          max-width: 560px;
        }

        /* ── BACK LINK ── */
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

        /* ── HEADER ── */
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

        /* ── FORM CARD ── */
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

        /* ── FIELD ── */
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

        /* ── INPUTS ── */
        .field-input,
        .field-select,
        .field-textarea {
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

        .field-input::placeholder,
        .field-textarea::placeholder { color: var(--text3); font-weight: 400; }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232, 80, 10, 0.1);
          background: var(--surface);
        }

        .field-textarea {
          resize: vertical;
          min-height: 90px;
          line-height: 1.5;
        }

        /* Price input with prefix */
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
          user-select: none;
        }

        .price-input {
          padding-left: 40px !important;
        }

        /* Select arrow */
        .select-wrap { position: relative; }

        .select-arrow {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          font-size: 10px;
          color: var(--text3);
        }

        /* Number input: hide spinners */
        .field-input[type="number"]::-webkit-inner-spin-button,
        .field-input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .field-input[type="number"] { -moz-appearance: textfield; }

        /* ── DIVIDER ── */
        .form-divider {
          border: none;
          border-top: 1.5px solid var(--border2);
          margin: 2px 0;
        }

        /* ── TWO COL ── */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* ── STORE BADGE (OWNER only) ── */
        .owner-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          background: var(--blue-bg);
          color: var(--blue);
          border: 1.5px solid #c8d9fb;
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 2px;
          width: fit-content;
        }

        /* ── SUBMIT ── */
        .btn-submit {
          width: 100%;
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
          margin-top: 4px;
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
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .create-page { padding: 18px 16px; }
          .form-card { padding: 20px 16px; gap: 16px; }
          .page-heading { font-size: 20px; }
          .two-col { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>

      <div className="create-page">
        <Link href="/dashboard/products" className="back-link">
          ← Kembali ke Produk
        </Link>

        <h1 className="page-heading">Tambah Produk</h1>
        <p className="page-subheading">Isi detail produk baru di bawah ini</p>

        <form className="form-card" onSubmit={handleSubmit}>

          {/* Nama Produk */}
          <div className="field">
            <label className="field-label">Nama Produk</label>
            <input
              type="text"
              className="field-input"
              placeholder="Contoh: Indomie Goreng"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Harga */}
          <div className="field">
            <label className="field-label">Harga Jual</label>
            <div className="price-wrap">
              <span className="price-prefix">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                className="field-input price-input"
                placeholder="0"
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
                placeholder="0"
                required
                min={0}
                value={stock ?? ""}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label className="field-label">Pcs per Dus</label>
              <input
                type="number"
                className="field-input"
                placeholder="0"
                required
                min={1}
                value={pcsPerDus ?? ""}
                onChange={(e) => setPcsPerDus(Number(e.target.value))}
              />
              <span className="field-hint">Contoh: 1 dus = 40 pcs</span>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="field">
            <label className="field-label">Deskripsi <span style={{ color: "var(--text3)", fontWeight: 500, textTransform: "none", fontSize: "11px" }}>(opsional)</span></label>
            <textarea
              className="field-textarea"
              rows={3}
              placeholder="Contoh: Indomie goreng rasa ayam bawang, kemasan 85g"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Store Picker (OWNER only) */}
          {role === "OWNER" && (
            <>
              <hr className="form-divider" />
              <div className="field">
                <span className="owner-badge">👑 Owner</span>
                <label className="field-label">Pilih Toko</label>
                <div className="select-wrap">
                  <select
                    required
                    className="field-select"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                  >
                    <option value="">-- Pilih Toko --</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Menyimpan...
              </span>
            ) : (
              "Simpan Produk"
            )}
          </button>
        </form>
      </div>
    </>
  );
}