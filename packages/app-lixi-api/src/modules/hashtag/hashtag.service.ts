import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Document, EnqueuedTask, MeiliSearch, SearchResponse } from 'meilisearch';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { extractHashtagFromText } from 'src/utils/extractHashtagFromText';
import { HASHTAG } from '../page/constants/meili.constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HashtagService {
  private logger: Logger = new Logger(HashtagService.name);

  constructor(
    @I18n() private i18n: I18nService,
    @InjectMeiliSearch() private readonly meiliSearch: MeiliSearch,
    private prisma: PrismaService
  ) {}

  //TODO: Need better function name
  public async extractAndSave(index: string, content: string, postId: string) {
    const hashtags = extractHashtagFromText(content);

    if (hashtags === null) return;

    const result = await this.checkDuplicate(index, hashtags, postId);

    return result;
  }

  //TODO: Need better function name
  private async checkDuplicate(index: string, hashtags: string[], postId: string) {
    let indexedHashtags = [];
    const promises = hashtags.map(async (hashtag: string) => {
      //We search using meilisearch so its ok to loop here
      const hashtagUppercase = hashtag.substring(1).toUpperCase();
      const result = await this.prisma.hashtag.findUnique({
        where: {
          content: hashtagUppercase
        }
      });

      if (result === null) {
        //If there the hashtag hasnt exist
        //Create new hashtag at database
        const createdHashtag = await this.prisma.$transaction(async prisma => {
          const result = await prisma.hashtag.create({
            data: {
              content: hashtagUppercase,
              normalizedContent: hashtag.substring(1).toLowerCase()
            }
          });

          //Connet to postHashtag
          await prisma.postHashtag.create({
            data: {
              hashtag: {
                connect: {
                  id: result.id
                }
              },
              post: {
                connect: {
                  id: postId
                }
              }
            }
          });

          return result;
        });

        //Index and save in meilisearch
        const hashtagToIndexed = {
          id: createdHashtag.id,
          content: hashtagUppercase
        };

        await this.meiliSearch
          .index(index)
          .addDocuments([{ ...hashtagToIndexed, primaryId: createdHashtag.id }], { primaryKey: 'primaryId' });

        return hashtagToIndexed;
      } else {
        //If there the hashtag has existed
        const hashtag = result;

        await this.prisma.postHashtag.create({
          data: {
            hashtag: {
              connect: {
                id: hashtag.id
              }
            },
            post: {
              connect: {
                id: postId
              }
            }
          }
        });

        const hashtagToIndexed = {
          id: hashtag.id,
          content: hashtag.content
        };

        return hashtagToIndexed;
      }
    });

    indexedHashtags = await Promise.all(promises);

    return indexedHashtags;
  }

  private filterQueryBuilder(hashtags: string[], searchContext: boolean): string {
    if (hashtags.length === 0) return '';
    const filters: string[] = [];

    for (const hashtag of hashtags) {
      filters.push(`hashtag.content = "${hashtag.substring(1).toUpperCase()}"`); //remove the "hashtag" from string
    }

    const filtersQuery = filters.join(' AND ');

    if (searchContext) {
      return filtersQuery + ' AND ';
    } else {
      return filtersQuery;
    }
  }

  public async searchByQueryEstimatedTotalHits(index: string, query: string, hashtags: string[]) {
    return (
      await this.meiliSearch.index(index).search(query, { filter: `${this.filterQueryBuilder(hashtags, false)}` })
    ).estimatedTotalHits;
  }

  public async searchByQueryHits(index: string, query: string, hashtags: string[], offset: number, limit: number) {
    const hits = await this.meiliSearch
      .index(index)
      .search(query, {
        offset: offset,
        limit: limit,
        filter: `${this.filterQueryBuilder(hashtags, false)}`
      })
      .then(res => {
        return res.hits;
      });
    return hits;
  }

  public async searchByQueryEstimatedTotalHitsAtPage(index: string, query: string, hashtags: string[], pageId: string) {
    return (
      await this.meiliSearch
        .index(index)
        .search(query, { filter: `${this.filterQueryBuilder(hashtags, true)}page.id = "${pageId}"` })
    ).estimatedTotalHits;
  }

  public async searchByQueryHitsAtPage(
    index: string,
    query: string,
    hashtags: string[],
    pageId: string,
    offset: number,
    limit: number
  ) {
    const hits = await this.meiliSearch
      .index(index)
      .search(query, {
        offset: offset,
        limit: limit,
        filter: `${this.filterQueryBuilder(hashtags, true)}page.id = "${pageId}"`
      })
      .then(res => {
        return res.hits;
      });
    return hits;
  }

  public async searchByQueryEstimatedTotalHitsAtToken(
    index: string,
    query: string,
    hashtags: string[],
    tokenId: string
  ) {
    return (
      await this.meiliSearch
        .index(index)
        .search(query, { filter: `${this.filterQueryBuilder(hashtags, true)}token.id = "${tokenId}"` })
    ).estimatedTotalHits;
  }

  public async searchByQueryHitsAtToken(
    index: string,
    query: string,
    hashtags: string[],
    tokenId: string,
    offset: number,
    limit: number
  ) {
    const hits = await this.meiliSearch
      .index(index)
      .search(query, {
        offset: offset,
        limit: limit,
        filter: `${this.filterQueryBuilder(hashtags, true)}token.id = "${tokenId}"`
      })
      .then(res => {
        return res.hits;
      });
    return hits;
  }
}
