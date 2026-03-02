import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

type ItemInput = {
  productId: string;
  quantity: number;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
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
      { status: 403 }
    );
  }

  if (!storeId) {
    return NextResponse.json(
      { message: "Store not assigned" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const items: ItemInput[] = body.items;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { message: "No items provided" },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      let total = 0;

      // 🔹 Ambil semua produk sesuai store
      const products = await tx.product.findMany({
        where: {
          id: { in: items.map((i) => i.productId) },
          storeId,
        },
      });

      if (products.length !== items.length) {
        throw new Error("Some products not found");
      }

      // 🔹 Cek stok & hitung total
      for (const item of items) {
        const product = products.find(
          (p) => p.id === item.productId
        );

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock not enough for ${product.name}`
          );
        }

        total += product.price * item.quantity;
      }

      // 🔹 Buat transaksi utama
      const createdTransaction = await tx.transaction.create({
        data: {
          total,
          storeId,
          userId,
        },
      });

      // 🔹 Buat TransactionItem + Kurangi stok
      for (const item of items) {
        const product = products.find(
          (p) => p.id === item.productId
        );

        if (!product) continue;

        // Simpan item transaksi
        await tx.transactionItem.create({
          data: {
            transactionId: createdTransaction.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        });

        // 🔥 Kurangi stok
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdTransaction;
    });

    return NextResponse.json(transaction, { status: 201 });

  } catch (error) {
    console.error("TRANSACTION ERROR:", error);

    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 }
    );
  }
}