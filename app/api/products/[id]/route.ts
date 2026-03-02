import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return NextResponse.json({ message: "Product deactivated" });
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
