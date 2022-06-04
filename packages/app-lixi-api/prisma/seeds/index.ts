import { envelopes } from './envelopes';
import { notificationTypes } from './notificationTypes';
import { notificationTypeTranslations } from './notificationTypeTranslations';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const resultEnvelopes = await prisma.$transaction(
    envelopes.map(envelope =>
      prisma.envelope.upsert({
        where: { id: envelope.id },
        update: {},
        create: { ...envelope }
      })
    )
  );

  const resultNotifTypes = await prisma.$transaction(
    notificationTypes.map(notificationType =>
      prisma.notificationType.upsert({
        where: { id: notificationType.id },
        update: {},
        create: { ...notificationType }
      })
    )
  );

  const resultNotifTypesTranslation = await prisma.$transaction(
    notificationTypeTranslations.map(notificationTypeTranslation =>
      prisma.notificationTypeTranslation.upsert({
        where: { id: notificationTypeTranslation.id },
        update: {},
        create: { ...notificationTypeTranslation }
      })
    )
  );
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
