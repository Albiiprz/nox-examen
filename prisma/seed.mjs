import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "profesor";
  const password = "Profesor1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.teacher.upsert({
    where: { username },
    update: {
      passwordHash,
      displayName: "Profesor Nox",
    },
    create: {
      username,
      passwordHash,
      displayName: "Profesor Nox",
    },
  });

  console.log("Profesor demo listo:");
  console.log("usuario: profesor");
  console.log("password: Profesor1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
