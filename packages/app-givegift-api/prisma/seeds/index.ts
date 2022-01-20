import { envelopes } from "./envelopes";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.envelope.deleteMany({});

  await prisma.envelope.createMany({
    data: envelopes,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });