import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("123456", 10)

  await prisma.user.create({
    data: {
      name: "Owner",
      email: "owner@mail.com",
      password,
      role: "OWNER"
    }
  })
}

main()
