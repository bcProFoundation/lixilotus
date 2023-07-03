import type { Method } from 'axios';
import Cloudflare, { Operation } from 'cloudflare-images';
import { urlJoin } from '../../../../utils/urlJoin';

const BASE_URL = 'https://api.cloudflare.com/client/v4';

export const OperationUrls: Record<Operation, any> = {
  'image.create': (accountId: string) => urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1'),
  'image.list': (accountId: string) => urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1'),
  'image.get': (accountId: string, imageId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', imageId),
  'image.update': (accountId: string, imageId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', imageId),
  'image.delete': (accountId: string, imageId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', imageId),
  'image.download': (accountId: string, imageId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', imageId, 'blob'),
  'variant.create': (accountId: string) => urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', 'variants'),
  'variant.list': (accountId: string) => urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', 'variants'),
  'variant.get': (accountId: string, variantId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', 'variants', variantId),
  'variant.update': (accountId: string, variantId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', 'variants', variantId),
  'variant.delete': (accountId: string, variantId: string) =>
    urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', 'variants', variantId),
  'usageStatistics.get': (accountId: string) => urlJoin(BASE_URL, 'accounts', accountId, 'images', 'v1', 'variants')
};

export const OperationMethods: Record<Operation, Method> = {
  'image.create': 'POST',
  'image.list': 'GET',
  'image.get': 'GET',
  'image.update': 'PATCH',
  'image.delete': 'DELETE',
  'image.download': 'GET',
  'variant.create': 'POST',
  'variant.list': 'GET',
  'variant.get': 'GET',
  'variant.update': 'PATCH',
  'variant.delete': 'DELETE',
  'usageStatistics.get': 'GET'
};
