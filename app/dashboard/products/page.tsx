"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  pcsPerDus: number | null;
  store?: { name: string };
};

function formatStock(stock: number, pcsPerDus: number | null) {
  if (!pcsPerDus || pcsPerDus <= 1) return `${stock} pcs`;
  const dus = Math.floor(stock / pcsPerDus);
  const sisa = stock % pcsPerDus;
  if (dus > 0 && sisa > 0) return `${dus} dus ${sisa} pcs`;
  if (dus > 0) return `${dus} dus`;
  return `${sisa} pcs`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 5;

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `/api/products?page=${page}&limit=${limit}&search=${search}`,
      );
      const data = await res.json();
      setProducts(data.data);
      setTotalPages(data.totalPages);
    }
    load();
  }, [page, search]);

  async function handleDelete(id: string) {
    if (!confirm("Yakin mau hapus produk ini?")) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.message || "Gagal menghapus produk");
      return;
    }

    // reload data setelah sukses
    const reload = await fetch(
      `/api/products?page=${page}&limit=${limit}&search=${search}`,
    );

    const data = await reload.json();
    setProducts(data.data);
    setTotalPages(data.totalPages);
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
          --orange-bg: #fff4e0;
          --blue: #1558d6;
          --blue-bg: #eef3fe;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --radius: 14px;
          --radius-sm: 9px;
        }

        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }

        /* ── PAGE ── */
        .products-page {
          padding: 28px 32px;
          max-width: 1200px;
        }

        /* ── HEADER ── */
        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .page-heading {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
        }

        .page-subheading {
          font-size: 13px;
          color: var(--text3);
          font-weight: 500;
          margin-top: 2px;
        }

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          background: var(--accent);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 3px 10px rgba(232, 80, 10, 0.25);
          white-space: nowrap;
        }

        .btn-add:hover {
          background: #c94008;
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(232, 80, 10, 0.3);
        }

        /* ── TOOLBAR ── */
        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          pointer-events: none;
          opacity: 0.45;
        }

        .search-input {
          width: 100%;
          background: var(--surface);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 9px 12px 9px 35px;
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input::placeholder { color: var(--text3); font-weight: 400; }

        .search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232, 80, 10, 0.1);
        }

        .result-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--text3);
          white-space: nowrap;
        }

        /* ── TABLE PANEL ── */
        .table-panel {
          background: var(--surface);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        /* ── DESKTOP TABLE ── */
        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table thead tr {
          border-bottom: 1.5px solid var(--border);
          background: var(--surface2);
        }

        .products-table th {
          padding: 11px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
        }

        .products-table tbody tr {
          border-bottom: 1px solid var(--border2);
          transition: background 0.1s;
        }

        .products-table tbody tr:last-child { border-bottom: none; }
        .products-table tbody tr:hover { background: var(--surface2); }

        .products-table td {
          padding: 13px 16px;
          font-size: 13px;
          color: var(--text);
          font-weight: 500;
          vertical-align: middle;
        }

        .product-name-cell {
          font-weight: 700;
          color: var(--text);
        }

        .product-price-cell {
          font-weight: 700;
          color: var(--green);
          white-space: nowrap;
        }

        .stock-tag {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .stock-ok   { background: var(--green-bg);  color: var(--green); }
        .stock-low  { background: var(--orange-bg); color: var(--orange); }
        .stock-out  { background: var(--red-bg);    color: var(--red); }

        .store-tag {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 20px;
          background: var(--blue-bg);
          color: var(--blue);
        }

        .desc-cell {
          color: var(--text3);
          font-size: 12px;
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .action-cell {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-edit {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          background: var(--blue-bg);
          color: var(--blue);
          border: 1.5px solid #c8d9fb;
          padding: 5px 13px;
          border-radius: 7px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .btn-edit:hover {
          background: #dce8fe;
          border-color: #a5bff8;
        }

        .btn-delete {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          background: var(--red-bg);
          color: var(--red);
          border: 1.5px solid #ffc8bf;
          padding: 5px 13px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .btn-delete:hover {
          background: #fde0dc;
          border-color: #f5a39d;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          padding: 56px 24px;
          text-align: center;
          color: var(--text3);
          font-size: 14px;
        }

        .empty-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.5; }

        /* ── MOBILE CARD LIST ── */
        .mobile-list {
          display: none;
          flex-direction: column;
          gap: 0;
        }

        .mobile-card {
          padding: 15px 16px;
          border-bottom: 1px solid var(--border2);
        }

        .mobile-card:last-child { border-bottom: none; }

        .mobile-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .mobile-product-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.3;
        }

        .mobile-product-price {
          font-size: 14px;
          font-weight: 800;
          color: var(--green);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mobile-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .mobile-card-actions {
          display: flex;
          gap: 8px;
        }

        /* ── PAGINATION ── */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 0 4px;
        }

        .btn-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          background: var(--surface);
          color: var(--text2);
          border: 1.5px solid var(--border);
          padding: 7px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-page:hover:not(:disabled) {
          border-color: var(--accent-border);
          color: var(--accent);
          background: var(--accent-light);
        }

        .btn-page:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 13px;
          font-weight: 600;
          color: var(--text3);
          padding: 0 4px;
        }

        .page-info strong {
          color: var(--text);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .products-page { padding: 18px 16px; }
          .page-heading { font-size: 20px; }
          .desktop-table { display: none; }
          .mobile-list { display: flex; }
          .toolbar { gap: 8px; }
          .search-wrap { max-width: 100%; }
        }

        @media (max-width: 480px) {
          .page-header { flex-direction: column; align-items: flex-start; }
          .btn-add { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="products-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-heading">Daftar Produk</h1>
            <p className="page-subheading">Kelola semua produk toko kamu</p>
          </div>
          <Link href="/dashboard/products/create" className="btn-add">
            ＋ Tambah Produk
          </Link>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          {products.length > 0 && (
            <span className="result-count">{products.length} produk</span>
          )}
        </div>

        {/* Table Panel */}
        <div className="table-panel">
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              {search
                ? `Produk "${search}" tidak ditemukan`
                : "Belum ada produk"}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="desktop-table">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Harga</th>
                      <th>Stok</th>
                      <th>Toko</th>
                      <th>Deskripsi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const stockNum = p.stock;
                      const stockClass =
                        stockNum === 0
                          ? "stock-out"
                          : stockNum < 10
                            ? "stock-low"
                            : "stock-ok";
                      return (
                        <tr key={p.id}>
                          <td className="product-name-cell">{p.name}</td>
                          <td className="product-price-cell">
                            Rp {p.price.toLocaleString("id-ID")}
                          </td>
                          <td>
                            <span className={`stock-tag ${stockClass}`}>
                              {formatStock(p.stock, p.pcsPerDus)}
                            </span>
                          </td>
                          <td>
                            {p.store ? (
                              <span className="store-tag">{p.store.name}</span>
                            ) : (
                              <span style={{ color: "var(--text3)" }}>—</span>
                            )}
                          </td>
                          <td className="desc-cell" title={p.description}>
                            {p.description || "—"}
                          </td>
                          <td>
                            <div className="action-cell">
                              <Link
                                href={`/dashboard/products/edit/${p.id}`}
                                className="btn-edit"
                              >
                                Edit
                              </Link>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(p.id)}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="mobile-list">
                {products.map((p) => {
                  const stockNum = p.stock;
                  const stockClass =
                    stockNum === 0
                      ? "stock-out"
                      : stockNum < 10
                        ? "stock-low"
                        : "stock-ok";
                  return (
                    <div key={p.id} className="mobile-card">
                      <div className="mobile-card-top">
                        <span className="mobile-product-name">{p.name}</span>
                        <span className="mobile-product-price">
                          Rp {p.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="mobile-card-meta">
                        <span className={`stock-tag ${stockClass}`}>
                          {formatStock(p.stock, p.pcsPerDus)}
                        </span>
                        {p.store && (
                          <span className="store-tag">{p.store.name}</span>
                        )}
                      </div>
                      <div className="mobile-card-actions">
                        <Link
                          href={`/dashboard/products/edit/${p.id}`}
                          className="btn-edit"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(p.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="btn-page"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">
            <strong>{page}</strong> / {totalPages}
          </span>
          <button
            className="btn-page"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
