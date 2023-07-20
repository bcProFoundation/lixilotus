import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dbSchema = process.env.DB_SCHEMA;

async function main() {
  let sqls = fs
    .readFileSync('./prisma/data/countries.sql')
    .toString()
    .split('\n')
    .filter(line => line.indexOf('--') !== 0)
    .join('\n')
    .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
    .replace(/\s+/g, ' ') // excess white space
    .split(';');

  const regex = /lixidb\./;
  sqls = sqls.map(sql => sql.replace(regex, (dbSchema as string) + '.'));
  for (const sql of sqls) {
    await prisma.$executeRawUnsafe(sql);
  }

  const countryUS = await prisma.country.updateMany({
    where: {
      name : "United state"
    },
    data: {
      name : "United State"
    }
  })
  
  const countryUSIsland = await prisma.country.updateMany({
    where: {
      name : "United state Minor Outlying Islands"
    }, 
    data: {
      name : "United State Minor Outlying Islands"
    }
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
