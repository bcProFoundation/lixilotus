import { envelopes } from "./envelopes";
import { notificationTypes } from "./notificationTypes";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  const resultEnvelopes = await prisma.$transaction(
    envelopes.map(envelope =>
      prisma.envelope.upsert({
        where: { id: envelope.id },
        update: {},
        create: { ...envelope },
      })
    )
  );

  const resultNotifTypes = await prisma.$transaction(
    notificationTypes.map(notificationType =>
      prisma.notificationType.upsert({
        where: { id: notificationType.id },
        update: {},
        create: { ...notificationType },
      })
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });