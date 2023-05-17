import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Document, EnqueuedTask, MeiliSearch } from 'meilisearch';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { PERSON, POSTS, TEMPLE } from './constants/meili.constants';

@Injectable()
export class MeiliService implements OnModuleInit {
  private logger: Logger = new Logger(MeiliService.name);

  constructor(@I18n() private i18n: I18nService, @InjectMeiliSearch() private readonly meiliSearch: MeiliSearch) {}

  async onModuleInit() {
    await this.meiliSearch.index(`${process.env.MEILISEARCH_BUCKET}_${POSTS}`).updateSettings({
      searchableAttributes: ['content', 'postAccountName'],
      displayedAttributes: ['*']
    });
    await this.meiliSearch.index(`${process.env.MEILISEARCH_BUCKET}_${PERSON}`).updateSettings({
      searchableAttributes: ['name', 'achievement'],
      displayedAttributes: ['*']
    });
    await this.meiliSearch.index(`${process.env.MEILISEARCH_BUCKET}_${TEMPLE}`).updateSettings({
      searchableAttributes: ['name', 'president', 'alias', 'religion'],
      displayedAttributes: ['*']
    });
  }

  /**
   * Add document to the index
   * @param index The specific index
   * @param document The document you want to add
   * @param documentId The document id
   */
  public async add(index: string, document: any, documentId: string) {
    await this.meiliSearch
      .index(index)
      .addDocuments([{ ...document, primaryId: documentId }], { primaryKey: 'primaryId' });
  }

  /**P
   * Update document at the specify index
   * @param index The specific index
   * @param document The document you want to update
   */
  public async update(index: string, documents: any, documentId: string): Promise<EnqueuedTask> {
    return await this.meiliSearch
      .index(index)
      .updateDocuments([{ ...documents, primaryId: documentId }], { primaryKey: 'primaryId' });
  }

  /**
   * Delete document at the specify index
   * @param index The specific index
   * @param documentId The document id you want to delete
   */
  public async delete(index: string, documentId: string): Promise<EnqueuedTask> {
    return await this.meiliSearch.index(index).deleteDocument(documentId);
  }

  public async searchByQueryHits(index: string, query: string, offset: number, limit: number) {
    const hits = await this.meiliSearch
      .index(index)
      .search(query, {
        offset: offset,
        limit: limit
      })
      .then(res => {
        return res.hits;
      });
    return hits;
  }

  public async searchByQueryEstimatedTotalHits(index: string, query: string) {
    return (await this.meiliSearch.index(index).search(query)).estimatedTotalHits;
  }
}
