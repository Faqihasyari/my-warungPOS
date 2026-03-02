import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params; // ✅ WAJIB AWAIT

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Product deactivated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { message: "Gagal menghapus produk" },
      { status: 500 },
    );
  }
}
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const body = await req.json();

  const { name, description, price, stock, pcsPerDus } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      price: Number(price),
      stock: Number(stock),
      pcsPerDus: Number(pcsPerDus),
      description: description || "",
    },
  });

  return NextResponse.json(product);
}
