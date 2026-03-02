import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { role, storeId } = session.user as {
    role: string;
    storeId: string | null;
  };

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 5);
  const search = searchParams.get("search") ?? "";

  const skip = (page - 1) * limit;

  const whereCondition: Prisma.ProductWhereInput = {
    isActive: true, // 🔥 WAJIB ADA

    ...(role !== "OWNER" && {
      storeId: storeId ?? undefined,
    }),

    ...(search && {
      name: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      include: { store: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({
      where: whereCondition,
    }),
  ]);

  return NextResponse.json({
    data: products,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { role, storeId } = session.user as {
    role: string;
    storeId: string | null;
  };

  if (role !== "OWNER" && !storeId) {
    return NextResponse.json(
      { message: "Store not assigned" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();

    const { name, description, price, stock, pcsPerDus } = body;

    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }
    console.log("BODY:", body);
    console.log("ROLE:", role);
    console.log("STORE ID FINAL:", role === "OWNER" ? body.storeId : storeId);
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        pcsPerDus: Number(pcsPerDus),
        storeId: role === "OWNER" ? body.storeId : storeId!,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
