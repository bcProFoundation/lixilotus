import _ from 'lodash';
import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import DataLoader from 'dataloader';
import { Page, Post, Repost, UploadDetail } from '@bcpros/lixi-models';
import { DanaViewScoreService } from './dana-view-score.service';
import { FollowCacheService } from '../account/follow-cache.service';

@Injectable({ scope: Scope.REQUEST })
export default class PostLoader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly danaViewScoreService: DanaViewScoreService,
    private readonly followCacheService: FollowCacheService
  ) {}

  public async getPostsUploadsByBatch(postIds: readonly string[]): Promise<(UploadDetail | any)[]> {
    const ids = postIds as unknown as string[];
    const uploadsDb = await this.prisma.uploadDetail.findMany({
      where: {
        postId: { in: ids }
      },
      include: {
        upload: {
          select: {
            id: true,
            sha: true,
            bucket: true,
            width: true,
            height: true,
            cfImageId: true,
            cfImageFilename: true,
            originalFilename: true,
            extension: true,
            type: true,
            thumbnailHeight: true,
            thumbnailWidth: true
          }
        }
      }
    });
    const uploads = uploadsDb.map(item => {
      const upload: UploadDetail = {
        id: item.id,
        postId: item.postId,
        upload: {
          ...item.upload,
          sha: item.upload.sha || ''
        }
      };
      return upload;
    });

    return postIds.map(postId => {
      return uploads.filter(item => item.postId == postId) || null;
    });
  }

  public readonly batchUploads = new DataLoader<string, UploadDetail[]>(async (postIds: readonly string[]) => {
    return await this.getPostsUploadsByBatch(postIds);
  });

  public readonly batchPages = new DataLoader(async (pageIds: readonly string[]) => {
    const ids = (pageIds as unknown as string[]) ?? [];
    const pagesDb = await this.prisma.page.findMany({
      include: {
        pageAccount: true,
        category: true,
        avatar: true,
        cover: true
      },
      where: {
        id: {
          in: ids
        }
      }
    });
    const avatarIds = _.compact(pagesDb.map(item => item.avatar?.id));
    const coverIds = _.compact(pagesDb.map(item => item.cover?.id));
    const avatarsDb = await this.prisma.uploadDetail.findMany({
      where: {
        id: { in: avatarIds }
      },
      include: {
        upload: true
      }
    });
    const avatarsMap = new Map(
      avatarsDb.map(item => {
        const { upload } = item;
        const avatarUrl = `${process.env.CF_IMAGES_DELIVERY_URL}/${process.env.CF_ACCOUNT_HASH}/${upload?.cfImageId}/public`;
        return [item.id, avatarUrl];
      })
    );

    const coversDb = await this.prisma.uploadDetail.findMany({
      where: {
        id: { in: coverIds }
      },
      include: {
        upload: true
      }
    });

    const coversMap = new Map(
      coversDb.map(item => {
        const { upload } = item;
        const url = `${process.env.CF_IMAGES_DELIVERY_URL}/${process.env.CF_ACCOUNT_HASH}/${upload?.cfImageId}/public`;
        return [item.id, url];
      })
    );

    const pagesMap = new Map(
      pagesDb.map(item => {
        const { avatar, cover } = item;
        const page = new Page({
          ...item,
          avatar: avatar?.id ? avatarsMap.get(avatar?.id) : '',
          cover: cover?.id ? coversMap.get(cover?.id) : ''
        });
        return [item.id, page];
      })
    );

    const data = pageIds.map(pageId => {
      return pagesMap.get(pageId) ?? new Error(pageId);
    });
    return Promise.resolve(data);
  });

  public readonly batchReposts = new DataLoader(async (postIds: readonly string[]) => {
    const ids = (postIds as unknown as string[]) ?? [];

    const repostsDb = await this.prisma.repost.findMany({
      where: {
        postId: {
          in: ids
        }
      }
    });
    const reposts = repostsDb.map(item => {
      return new Repost({
        ...item
      });
    });
    return postIds.map(postId => {
      return reposts.filter(item => item.postId == postId) || null;
    });
  });

  public readonly batchDanaViewScores = new DataLoader(async (postIds: readonly string[]) => {
    const ids = (postIds as unknown as string[]) ?? [];
    const scores = await this.danaViewScoreService.getByIds(ids);
    return postIds.map((postId: string, index: number) => {
      return scores[index] || 0;
    });
  });

  public readonly batchCheckAccountFollowAllAccount = new DataLoader(
    async (items: readonly { followingAccountId: number; accountId: number }[]) => {
      const listFollowingAccountId = items.map(item => item.followingAccountId);
      const listCheckAccountFollowAccount = await this.followCacheService.checkAccountFollowAllAccount(
        items[0].accountId,
        listFollowingAccountId
      );

      return listCheckAccountFollowAccount.map((item, index) => {
        return !!listCheckAccountFollowAccount[index];
      });
    }
  );

  public readonly batchCheckAccountFollowAllPage = new DataLoader(
    async (items: readonly { pageId: string; accountId: number }[]) => {
      const listPageId = items.map(item => item.pageId);
      const listCheckAccountFollowPage = await this.followCacheService.checkAccountFollowAllPage(
        items[0].accountId,
        listPageId
      );

      return listCheckAccountFollowPage.map((item, index) => {
        return !!listCheckAccountFollowPage[index];
      });
    }
  );

  public readonly batchCheckAccountFollowAllToken = new DataLoader(
    async (items: readonly { tokenId: string; accountId: number }[]) => {
      const listTokenId = items.map(item => item.tokenId);
      const listCheckAccountFollowToken = await this.followCacheService.checkAccountFollowAllToken(
        items[0].accountId,
        listTokenId
      );

      return listCheckAccountFollowToken.map((item, index) => {
        return !!listCheckAccountFollowToken[index];
      });
    }
  );
}
