import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

type ItemInput = {
  productId: string;
  quantity: number;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    role,
    storeId,
    id: userId,
  } = session.user as {
    role: string;
    storeId: string | null;
    id: string;
  };

  if (role !== "CASHIER") {
    return NextResponse.json(
      { message: "Only cashier can create transaction" },
      { status: 403 },
    );
  }

  if (!storeId) {
    return NextResponse.json(
      { message: "Store not assigned" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const items: ItemInput[] = body.items;

  if (!items || items.length === 0) {
    return NextResponse.json({ message: "No items provided" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;

      // 1️⃣ Ambil semua produk yang dibeli
      const products = await tx.product.findMany({
        where: {
          id: { in: items.map((i) => i.productId) },
          storeId,
        },
      });

      if (products.length !== items.length) {
        throw new Error("Some products not found");
      }

      // 2️⃣ Hitung total & cek stok
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);

        if (!product) throw new Error("Product not found");

        if (product.stock < item.quantity) {
          throw new Error(`Stock not enough for product ${product.name}`);
        }

        total += product.price * item.quantity;
      }

      // 3️⃣ Buat Transaction
      const transaction = await tx.transaction.create({
        data: {
          total,
          storeId,
          userId,
        },
      });

      // 4️⃣ Buat TransactionItem + Kurangi stok
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return NextResponse.json(
            { message: "Produk tidak ditemukan" },
            { status: 400 },
          );
        }

        if (item.quantity > product.stock) {
          return NextResponse.json(
            { message: `Stok ${product.name} tidak cukup` },
            { status: 400 },
          );
        }
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("TRANSACTION ERROR:", error);

    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 },
    );
  }
}
