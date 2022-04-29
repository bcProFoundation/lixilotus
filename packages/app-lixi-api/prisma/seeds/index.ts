import { envelopes } from "./envelopes";
import { notificationTypes } from "./notificationTypes";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.envelope.deleteMany({});
  await prisma.notificationType.deleteMany({});

  await prisma.envelope.createMany({
    data: envelopes,
  });

  await prisma.notificationType.createMany({
    data: notificationTypes
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