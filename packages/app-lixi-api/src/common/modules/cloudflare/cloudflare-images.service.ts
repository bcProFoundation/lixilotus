import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { Operation, Requests, Responses } from 'cloudflare-images';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { Duplex } from 'stream';
import _ from 'lodash';
import { CloudflareConfig } from '../../../config/config.interface';
import { urlJoin } from '../../../utils/urlJoin';
import { OperationMethods, OperationUrls } from './interface/data';
import { DefaultRequests } from './interface/default-requests';

interface RequestArgs {
  operation: Operation;
  urlArgs?: any[];
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
}
const defaultRequestArgs: RequestArgs = {
  operation: 'image.get',
  urlArgs: [],
  params: {},
  headers: {},
  body: undefined
};

@Injectable()
export class CloudflareImagesService {
  private BASE_URL = 'https://api.cloudflare.com/client/v4';
  private token: string;
  private accountId: string;
  private deliveryUrl: string;
  private logger: Logger = new Logger(CloudflareImagesService.name);

  constructor(private readonly config: ConfigService) {
    const cloudflareConfig = this.config.get<CloudflareConfig>('cloudflare');
    this.token = cloudflareConfig?.cfImagesToken ?? '';
    this.accountId = cloudflareConfig?.cfAccountId ?? '';
    this.deliveryUrl = cloudflareConfig?.cfImagesDeliveryUrl ?? '';
    if (!(this.token && this.accountId && this.deliveryUrl)) {
      throw new Error('Invalid cloudflare account.');
    }
  }

  private bufferToStream(buffer: Buffer): ReadableStream {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  private axiosRequestConfig(otherHeaders: any = {}): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...otherHeaders
      }
    };
  }

  private async request<TResponse>(requestArgs: RequestArgs): Promise<TResponse> {
    try {
      requestArgs = { ...defaultRequestArgs, ...requestArgs };

      const { operation, urlArgs, params, headers, body } = { ...defaultRequestArgs, ...requestArgs };

      const config: AxiosRequestConfig = {
        url: OperationUrls[operation](...urlArgs!),
        method: OperationMethods[operation],
        headers: {
          Authorization: `Bearer ${this.token}`,
          ...headers
        }
      };
      if (!_.isNil(params)) {
        config.params = params;
      }
      if (!_.isNil(body)) {
        config.data = body;
      }

      const response = await axios.request<TResponse>(config);
      return response.data;
    } catch (error) {
      this.logger.error({ error, operation: 'image.list' });
      throw error;
    }
  }

  public async createImageFromBuffer(request: Requests.CreateImage, buffer: Buffer): Promise<Responses.CreateImage> {
    try {
      const url = urlJoin(this.BASE_URL, 'accounts', this.accountId, 'images', 'v1');

      const formData = new FormData();
      formData.append('id', request.id);
      formData.append('file', this.bufferToStream(buffer), request.fileName);
      if (!_.isEmpty(request.metadata)) {
        formData.append("metadata", JSON.stringify(request.metadata), { contentType: "application/json" })
      }
      formData.append("requireSignedURLs", request.requireSignedURLs == true ? "true" : "false");
      const config = this.axiosRequestConfig({
        "Content-Type": "multipart/form-data"
      });
      const response = await axios.post<Responses.CreateImage>(url, formData, config);

      return response.data;
    } catch (error) {
      this.logger.error({
        error,
        operation: 'image.create'
      });
      throw error;
    }
  }

  public async createImageFromFile(request: Requests.CreateImage, path: string): Promise<Responses.CreateImage> {
    try {
      const url = urlJoin(this.BASE_URL, 'accounts', this.accountId, 'images', 'v1');

      const formData = new FormData();
      formData.append('id', request.id);
      formData.append('file', createReadStream(path), request.fileName);
      if (!_.isEmpty(request.metadata)) {
        formData.append("metadata", JSON.stringify(request.metadata), { contentType: "application/json" });
      }
      formData.append("requireSignedURLs", request.requireSignedURLs == true ? "true" : "false");
      const config = this.axiosRequestConfig({
        "Content-Type": "multipart/form-data"
      });
      const response = await axios.post<Responses.CreateImage>(url, formData, config);

      return response.data;
    } catch (error) {
      this.logger.error({
        error,
        operation: 'image.create'
      });
      throw error;
    }
  }

  public async createImageFromUrl(request: Requests.CreateImage, imageUrl: string): Promise<Responses.CreateImage> {
    try {
      const url = urlJoin(this.BASE_URL, 'accounts', this.accountId, 'images', 'v1');
      const config = this.axiosRequestConfig({
        "Content-Type": "multipart/form-data"
      });
      const { id, fileName, metadata, requireSignedURLs } = {
        ...(DefaultRequests['image.create'] as Requests.CreateImage),
        ...request
      };

      const formData = new FormData();
      formData.append('id', id);
      formData.append('url', imageUrl, fileName);
      if (!_.isEmpty(metadata)) {
        formData.append("metadata", JSON.stringify(metadata), { contentType: "application/json" });
      }
      formData.append("requireSignedURLs", requireSignedURLs == true ? "true" : "false");
      const response = await axios.post<Responses.CreateImage>(url, formData, config);

      return response.data;
    } catch (error) {
      this.logger.error({
        error,
        operation: 'image.create'
      });
      throw error;
    }
  }

  public async listImages(request: Requests.ListImages = {}): Promise<Responses.ListImages> {
    return await this.request({
      operation: 'image.list',
      params: {
        ...DefaultRequests['image.list'],
        ...request
      }
    });
  }

  public async getImage(imageId: string): Promise<Responses.GetImage> {
    return await this.request({
      operation: 'image.get',
      urlArgs: [imageId]
    });
  }

  public async downloadImage(imageId: string): Promise<Blob> {
    try {
      const url = urlJoin(this.BASE_URL, 'accounts', this.accountId, 'images', 'v1', imageId, 'blob');
      const response = await axios.get<Blob>(url, this.axiosRequestConfig());

      return response.data;
    } catch (error) {
      this.logger.error({
        error,
        operation: 'image.get'
      });
      throw error;
    }
  }

  public async updateImage(imageId: string, options: Requests.UpdateImage): Promise<Responses.UpdateImage> {
    return await this.request({
      operation: 'image.update',
      urlArgs: [imageId],
      body: options
    });
  }

  public async deleteImage(imageId: string): Promise<Responses.DeleteImage> {
    return await this.request({
      operation: 'image.delete',
      urlArgs: [imageId]
    });
  }
}
