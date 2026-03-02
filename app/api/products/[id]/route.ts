import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
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
