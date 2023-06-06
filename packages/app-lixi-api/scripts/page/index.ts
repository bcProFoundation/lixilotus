import { PrismaClient } from '@prisma/client';
import _ from 'lodash';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log(`Indexing database to meilisearch bucket: ${process.env.MEILISEARCH_BUCKET}`)
  const allPages = await prisma.page.findMany({
    include: {
      posts: true
    }
  })

  const updatedPages = allPages
    .map(({ posts, ...page }) => {
      const totalPostsBurnUp = posts.reduce((a, b) => a + b.lotusBurnUp, 0);
      const totalPostsBurnDown = posts.reduce((a, b) => a + b.lotusBurnDown, 0);
      const totalPostsBurnScore = posts.reduce((a, b) => a + b.lotusBurnScore, 0);
      const totalBurnForPage = page.totalPostsBurnScore + totalPostsBurnScore;

      return {
        ...page,
        totalPostsBurnUp,
        totalPostsBurnDown,
        totalPostsBurnScore,
        totalBurnForPage
      }
    })
    .sort((a, b) => b.totalBurnForPage - a.totalBurnForPage)
    .map((page, index) => ({
      ...page,
      rank: index + 1
    }));

  await prisma.$transaction(async prisma => {
    updatedPages.map(page => {
      return prisma.page.update({
        where: { id: page.id },
        data: { ...page }
      })
    })
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
