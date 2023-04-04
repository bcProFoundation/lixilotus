import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { stripHtml } from "string-strip-html";
require('dotenv').config();

const prisma = new PrismaClient();
const meiliClient = new MeiliSearch({ host: process.env.MEILISEARCH_HOST!, apiKey: process.env.MEILISEARCH_MASTER_KEY });

async function main() {
   console.log(`Indexing worshiped person database to meilisearch bucket: ${process.env.MEILISEARCH_BUCKET}`)
   let indexedPeople: any = [];
   const allPeople = await prisma.worshipedPerson.findMany({
      select: {
         id: true,
         name: true,
         countryOfCitizenship: true,
         achievement: true,
         alias: true,
         religion: true,
         placeOfBirth: true,
         placeOfDeath: true,
         placeOfBurial: true,
         bio:true,
         quote: true,
      }
   });

   allPeople.map(async (person) => {
      const indexedPerson = {
         primaryId: person.id,
         id: person.id,
         name: person.name,
         countryOfCitizenship: person.countryOfCitizenship,
         achievement: person.achievement,
         alias: person.alias,
         religion: person.religion,
         placeOfBirth: person.placeOfBirth,
         placeOfDeath: person.placeOfDeath,
         placeOfBurial: person.placeOfBurial,
         bio:person.bio,
         quote: person.quote,
      };

      indexedPeople.push(indexedPerson);
   })

   await meiliClient.index(`${process.env.MEILISEARCH_BUCKET}_worshipedPerson`).addDocuments(indexedPeople, { primaryKey: 'primaryId' });
}

main()
   .catch(e => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
