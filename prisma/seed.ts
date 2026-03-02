import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // 🔐 Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 🏪 Create Store 1
  const store1 = await prisma.store.create({
    data: {
      name: "Toko Bode",
      address: "Jl. Mawar No. 1",
    },
  });

  // 🏪 Create Store 2
  const store2 = await prisma.store.create({
    data: {
      name: "Toko Dua",
      address: "Jl. Melati No. 2",
    },
  });

  // 👑 Owner (tidak punya storeId)
  await prisma.user.create({
    data: {
      name: "Owner",
      email: "owner@gmail.com",
      password: hashedPassword,
      role: Role.OWNER,
      storeId: null,
    },
  });

  // 🧑‍💼 Cashier 1 → Store 1
  await prisma.user.create({
    data: {
      name: "Kasir Toko Bode",
      email: "tokobode@gmail.com",
      password: hashedPassword,
      role: Role.CASHIER,
      storeId: store1.id,
    },
  });

  // 🧑‍💼 Cashier 2 → Store 2
  await prisma.user.create({
    data: {
      name: "Kasir Toko Dua",
      email: "toko2@gmail.com",
      password: hashedPassword,
      role: Role.CASHIER,
      storeId: store2.id,
    },
  });

  console.log("✅ Seed selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });