"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Store = {
  id: string;
  name: string;
};

export default function CreateProductPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 🔥 Ambil session untuk tahu role
  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (data?.user?.role) {
        setRole(data.user.role);
      }
    }

    fetchSession();
  }, []);

  // 🔥 Kalau owner → ambil semua store
  useEffect(() => {
    if (role === "OWNER") {
      fetch("/api/stores")
        .then((res) => res.json())
        .then((data: Store[]) => setStores(data));
    }
  }, [role]);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const body =
      role === "OWNER"
        ? { name, price, stock, storeId: selectedStore }
        : { name, price, stock };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block mb-1 text-sm font-medium">Nama Produk</label>
          <input
            type="text"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Harga</label>

          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>

            <input
              type="text"
              inputMode="numeric"
              className="w-full border rounded-lg pl-10 pr-3 py-2"
              value={priceInput}
              onChange={(e) => {
                const rawValue = e.target.value
                  .replace(/\./g, "")
                  .replace(/\D/g, "");

                const numberValue = rawValue ? parseInt(rawValue) : 0;

                setPrice(numberValue);

                if (!rawValue) {
                  setPriceInput("");
                } else {
                  setPriceInput(
                    new Intl.NumberFormat("id-ID").format(numberValue),
                  );
                }
              }}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Stok</label>
          <input
            type="number"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>

        {role === "OWNER" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Pilih Toko</label>
            <select
              required
              className="w-full border rounded-lg px-3 py-2"
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
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </form>
    </div>
  );
}
