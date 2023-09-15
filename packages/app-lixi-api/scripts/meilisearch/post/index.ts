import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { stripHtml } from "string-strip-html";
require('dotenv').config();

const prisma = new PrismaClient();
const meiliClient = new MeiliSearch({ host: process.env.MEILISEARCH_HOST!, apiKey: process.env.MEILISEARCH_MASTER_KEY });

async function main() {
   console.log(`Indexing database to meilisearch bucket: ${process.env.MEILISEARCH_BUCKET}`)
   let indexedPosts: any = [];
   const posts = await prisma.post.findMany({
      include: {
         page: {
            select: {
               id: true,
               name: true
            }
         },
         token: {
            select: {
               id: true,
               name: true
            }
         },
         postAccount: {
            select: {
               name: true,
            }
         }
      }
   });

   posts.map(async (post) => {
      const indexedPost = {
         primaryId: post.id,
         id: post.id,
         content: stripHtml(post.content).result,
         postAccountName: post.postAccount.name,
         createdAt: post.createdAt,
         updatedAt: post.updatedAt,
         page: {
            id: post.page?.id,
            name: post.page?.name
         },
         token: {
            id: post.token?.id,
            name: post.token?.name
         }
      };

      indexedPosts.push(indexedPost);
   })

   await meiliClient.index(`${process.env.MEILISEARCH_BUCKET}_posts`).addDocuments(indexedPosts, { primaryKey: 'primaryId' });
}

main()
   .catch(e => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
