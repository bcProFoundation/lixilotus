import { PrismaClient } from '@prisma/client';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const allPages = await prisma.page.findMany({
    include: {
      posts: true
    }
  })

  const updatedPages = allPages
    .map((page) => {
      const totalPostsBurnUp = page.posts.reduce((a, b) => a + b.lotusBurnUp, 0);
      const totalPostsBurnDown = page.posts.reduce((a, b) => a + b.lotusBurnDown, 0);
      const totalPostsBurnScore = page.posts.reduce((a, b) => a + b.lotusBurnScore, 0);

      return {
        ...page,
        totalPostsBurnUp: totalPostsBurnUp,
        totalPostsBurnDown: totalPostsBurnDown,
        totalPostsBurnScore: totalPostsBurnScore,
      }
    }).map(({ posts, ...page }) => { return { ...page } })

  updatedPages.map(async page => {
    return await prisma.page.upsert({
      where: { id: page.id },
      update: { ...page },
      create: { ...page }
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
