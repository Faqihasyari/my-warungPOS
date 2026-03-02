import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { role, storeId } = session.user as {
    role: string;
    storeId: string | null;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalProducts = await prisma.product.count({
    where: role === "OWNER" ? {} : { storeId: storeId ?? undefined },
  });

  const totalTransactions = await prisma.transaction.count({
    where: role === "OWNER" ? {} : { storeId: storeId ?? undefined },
  });

  const todaySales = await prisma.transaction.aggregate({
    _sum: { total: true },
    where: {
      ...(role === "OWNER" ? {} : { storeId: storeId ?? undefined }),
      createdAt: { gte: today },
    },
  });

  const lowStock = await prisma.product.count({
    where: {
      stock: { lt: 10 },
      ...(role === "OWNER" ? {} : { storeId: storeId ?? undefined }),
    },
  });

  const recentTransactions = await prisma.transaction.findMany({
    where: role === "OWNER" ? {} : { storeId: storeId ?? undefined },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const topProducts = await prisma.transactionItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const productIds = topProducts.map((p) => p.productId);

  const productsData = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const topProductsWithName = topProducts.map((item) => {
    const product = productsData.find((p) => p.id === item.productId);
    return {
      name: product?.name ?? "Unknown",
      totalSold: item._sum.quantity ?? 0,
    };
  });

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
          --radius-sm: 10px;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
        }

        /* ── PAGE ── */
        .dash-page {
          padding: 28px 32px;
          max-width: 1200px;
        }

        .dash-heading {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .dash-subheading {
          font-size: 13px;
          color: var(--text3);
          font-weight: 500;
          margin-bottom: 28px;
        }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: var(--surface);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius);
          padding: 20px 20px 18px;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.15s, transform 0.15s;
        }

        .stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          margin-bottom: 14px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .stat-card.accent .stat-icon { background: var(--accent-light); }
        .stat-card.green .stat-icon  { background: var(--green-bg); }
        .stat-card.blue .stat-icon   { background: var(--blue-bg); }
        .stat-card.orange .stat-icon { background: var(--orange-bg); }

        /* ── BOTTOM GRID ── */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 16px;
        }

        /* ── PANEL ── */
        .panel {
          background: var(--surface);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius);
          padding: 22px 22px 18px;
          box-shadow: var(--shadow-sm);
        }

        .panel-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.2px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-empty {
          font-size: 13px;
          color: var(--text3);
          text-align: center;
          padding: 24px 0;
        }

        /* ── TOP PRODUCTS ── */
        .top-product-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .top-product-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--surface2);
          border: 1.5px solid var(--border2);
          border-radius: var(--radius-sm);
          transition: border-color 0.15s;
        }

        .top-product-item:hover { border-color: var(--accent-border); }

        .rank-badge {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .rank-1 { background: #fff3cd; color: #8a6000; }
        .rank-2 { background: #f0f0f0; color: #555; }
        .rank-3 { background: #fde8e0; color: #9a4020; }
        .rank-other { background: var(--bg); color: var(--text3); }

        .top-product-name {
          flex: 1;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .top-product-sold {
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-light);
          padding: 3px 9px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── HISTORY TABLE ── */
        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .history-table thead tr {
          border-bottom: 1.5px solid var(--border);
        }

        .history-table th {
          text-align: left;
          padding: 0 10px 10px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .history-table th:last-child { text-align: right; }

        .history-table tbody tr {
          border-bottom: 1px solid var(--border2);
          transition: background 0.1s;
        }

        .history-table tbody tr:last-child { border-bottom: none; }
        .history-table tbody tr:hover { background: var(--surface2); }

        .history-table td {
          padding: 10px 10px;
          color: var(--text);
          font-weight: 500;
        }

        .history-table td:last-child { text-align: right; }

        .trx-id {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          font-weight: 700;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text2);
          padding: 2px 7px;
          border-radius: 5px;
          display: inline-block;
        }

        .trx-total {
          font-weight: 700;
          color: var(--green);
        }

        .trx-date {
          font-size: 12px;
          color: var(--text3);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .bottom-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .dash-page { padding: 18px 16px; }
          .dash-heading { font-size: 20px; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .stat-card { padding: 16px 14px; }
          .stat-icon { width: 30px; height: 30px; font-size: 14px; margin-bottom: 10px; }
          .stat-value { font-size: 18px; }
          .panel { padding: 16px 14px; }

          .history-table .trx-date { display: none; }
          .history-table th:nth-child(3),
          .history-table td:nth-child(3) { display: none; }
        }

        @media (max-width: 380px) {
          .stat-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .stat-value { font-size: 16px; }
        }
      `}</style>

      <div className="dash-page">
        <h1 className="dash-heading">Dashboard</h1>
        <p className="dash-subheading">Ringkasan aktivitas toko hari ini</p>

        {/* ── STAT CARDS ── */}
        <div className="stat-grid">
          <StatCard
            title="Total Produk"
            value={totalProducts}
            icon="📦"
            variant="blue"
          />
          <StatCard
            title="Total Transaksi"
            value={totalTransactions}
            icon="🧾"
            variant="accent"
          />
          <StatCard
            title="Penjualan Hari Ini"
            value={`Rp ${(todaySales._sum.total ?? 0).toLocaleString("id-ID")}`}
            icon="💰"
            variant="green"
          />
          <StatCard
            title="Stok Hampir Habis"
            value={lowStock}
            icon="⚠️"
            variant="orange"
          />
        </div>

        {/* ── BOTTOM PANELS ── */}
        <div className="bottom-grid">
          {/* Top Products */}
          <div className="panel">
            <h2 className="panel-title">
              🏆 Top 5 Produk Terlaris
            </h2>
            {topProductsWithName.length === 0 ? (
              <p className="panel-empty">Belum ada transaksi</p>
            ) : (
              <div className="top-product-list">
                {topProductsWithName.map((product, index) => (
                  <div key={index} className="top-product-item">
                    <span className={`rank-badge ${
                      index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "rank-other"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="top-product-name">{product.name}</span>
                    <span className="top-product-sold">{product.totalSold} terjual</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="panel">
            <h2 className="panel-title">
              📜 Histori Penjualan
            </h2>
            {recentTransactions.length === 0 ? (
              <p className="panel-empty">Belum ada transaksi</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Total</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((trx) => (
                    <tr key={trx.id}>
                      <td><span className="trx-id">#{trx.id.slice(-6)}</span></td>
                      <td><span className="trx-total">Rp {trx.total.toLocaleString("id-ID")}</span></td>
                      <td><span className="trx-date">{new Date(trx.createdAt).toLocaleString("id-ID")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant,
}: {
  title: string;
  value: string | number;
  icon: string;
  variant: "accent" | "green" | "blue" | "orange";
}) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">{icon}</div>
      <p className="stat-label">{title}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}