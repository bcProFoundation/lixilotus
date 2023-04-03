import { envelopes } from './envelopes';
import { notificationTypes } from './notificationTypes';
import { notificationTypeTranslations } from './notificationTypeTranslations';

import { PrismaClient } from '@prisma/client';
import { emailTemplates } from './emailTemplates';
import { emailTemplateTranslations } from './emailTemplateTranslations';
import { categories } from './categories';
import { worshipedPersonInVietNam } from './worship/vietnam';

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
        update: { ...notificationTypeTranslation },
        create: { ...notificationTypeTranslation }
      })
    )
  );

  const resultEmailTemplate = await prisma.$transaction(
    emailTemplates.map(item =>
      prisma.emailTemplate.upsert({
        where: { id: item.id },
        update: {},
        create: { ...item }
      })
    )
  );

  const resultEmailTemplateTranslation = await prisma.$transaction(
    emailTemplateTranslations.map(translation => {
      return prisma.emailTemplateTranslation.upsert({
        where: { id: translation.id },
        update: {},
        create: { ...translation }
      });
    })
  );

  const resultCategory = await prisma.$transaction(
    categories.map(translation => {
      return prisma.category.upsert({
        where: { id: translation.id },
        update: {},
        create: { ...translation }
      });
    })
  );

  const worshipedPeople = await prisma.worshipedPerson.createMany({
    data: worshipedPersonInVietNam.map((person)=> {
      return {
        name: person.PersonName,
        wikiDataId: person.Person.split("/").pop(),
        countryOfCitizenship: person.CountryOfCitizenshipLabel,
        religion: person.ReligionLabel,
        dateOfBirth: person.DateOfBirth,
        placeOfBirth: person.PlaceOfBirthLabel,
        dateOfDeath: person.DateOfDeath,
        placeOfDeath: person.PlaceOfDeathLabel,
        placeOfBurial: person.PlaceOfBurialLabel,
        achievement: person.PersonDescription,
        alias: person.PersonAlias,
        wikiAvatar: person.Image
      }
    }),
    skipDuplicates: true,
  }) 
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
