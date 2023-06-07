import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { stripHtml } from 'string-strip-html';
require('dotenv').config();

const prisma = new PrismaClient();
const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_MASTER_KEY
});

const extractHashtagFromText = (text: string) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = text.match(hashtagRegex);

  if (!hashtags || hashtags.length === 0) return null;

  return hashtags;
};

async function main() {
  console.log(`Indexing hashtag to meilisearch bucket: ${process.env.MEILISEARCH_BUCKET} and database`);
  const allPosts = await prisma.post.findMany({});

  for (const post of allPosts) {
    const hashtags = extractHashtagFromText(post.content);

    if (hashtags === null) continue;

    let indexedHashtags: any = [];
    for (const hashtag of hashtags) {
      console.log(hashtag);
      // We search using meilisearch so it's ok to loop here
      const hashtagUppercase = hashtag.substring(1).toUpperCase();
      const result = await prisma.hashtag.findUnique({
        where: {
          content: hashtagUppercase
        }
      });

      if (result === null) {
        // If the hashtag hasn't existed
        // Create a new hashtag in the database
        const createdHashtag = await prisma.hashtag.create({
          data: {
            content: hashtagUppercase,
            normalizedContent: hashtag.substring(1).toLowerCase()
          }
        });

        // Connect to postHashtag
        await prisma.postHashtag.create({
          data: {
            hashtag: {
              connect: {
                id: createdHashtag.id
              }
            },
            post: {
              connect: {
                id: post.id
              }
            }
          }
        });

        // Index and save in meilisearch
        const hashtagToIndexed = {
          id: createdHashtag.id,
          content: hashtagUppercase
        };

        await meiliClient
          .index(`${process.env.MEILISEARCH_BUCKET}_hashtag`)
          .addDocuments([{ ...hashtagToIndexed, primaryId: createdHashtag.id }], { primaryKey: 'primaryId' });

        indexedHashtags.push(hashtagToIndexed);
      } else {
        // If the hashtag already exists
        const existingHashtag = result;

        await prisma.postHashtag.create({
          data: {
            hashtag: {
              connect: {
                id: existingHashtag.id
              }
            },
            post: {
              connect: {
                id: post.id
              }
            }
          }
        });

        const hashtagToIndexed = {
          id: existingHashtag.id,
          content: existingHashtag.content
        };

        await meiliClient
          .index(`${process.env.MEILISEARCH_BUCKET}_hashtag`)
          .addDocuments([{ ...hashtagToIndexed, primaryId: existingHashtag.id }], { primaryKey: 'primaryId' });

        indexedHashtags.push(hashtagToIndexed);
      }
    }

    await meiliClient.index(`${process.env.MEILISEARCH_BUCKET}_posts`).updateDocuments([
      {
        id: post.id,
        hashtag: indexedHashtags
      }
    ]);
  }

  await updateLotusScoreForHashtag();

  console.log('Done');
}

async function updateLotusScoreForHashtag() {
  console.log(`Updating lotus score for hashtags`);
  const allHashtags = await prisma.hashtag.findMany({});

  allHashtags.map(async hashtag => {
    let hashtagBurnScore = 0;
    let hashtagBurnUp = 0;
    let hashtagBurnDown = 0;

    const postHashtags = await prisma.postHashtag.findMany({
      where: {
        hashtagId: hashtag.id
      },
      include: {
        post: {
          select: {
            lotusBurnDown: true,
            lotusBurnScore: true,
            lotusBurnUp: true
          }
        }
      }
    });

    postHashtags.map(postHashtag => {
      hashtagBurnScore += postHashtag.post?.lotusBurnScore ?? 0;
      hashtagBurnUp += postHashtag.post?.lotusBurnUp ?? 0;
      hashtagBurnDown += postHashtag.post?.lotusBurnDown ?? 0;
    });

    await prisma.hashtag.update({
      where: {
        id: hashtag.id
      },
      data: {
        lotusBurnDown: hashtagBurnDown,
        lotusBurnScore: hashtagBurnScore,
        lotusBurnUp: hashtagBurnUp
      }
    });
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
