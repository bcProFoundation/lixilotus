import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { POSTS } from '../../page/constants/meili.constants';
import { TranslateProvider, TranslateProviderURL } from './translate.constant';
import { ConfigService } from '@nestjs/config';
import { stripHtml } from 'string-strip-html';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MeiliService } from 'src/modules/page/meili.service';

@Injectable()
export class TranslateService {
  private logger: Logger = new Logger(TranslateService.name);

  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private meiliService: MeiliService
  ) {}

  public async translatePostAndSave(provider: TranslateProvider, content: string, postId: string): Promise<any> {
    switch (provider) {
      case TranslateProvider.AZURE:
        const translationResult = await axios({
          baseURL: TranslateProviderURL.AZURE,
          url: '/translate',
          method: 'post',
          headers: {
            'Ocp-Apim-Subscription-Key': this.config.get<string>('AZURE_PRIVATE_KEY'),
            'Ocp-Apim-Subscription-Region': this.config.get<string>('AZURE_REGION'),
            'Content-type': 'application/json'
          },
          params: {
            'api-version': '3.0',
            to: ['en', 'vi'],
            textType: 'html'
          },
          data: [
            {
              text: content
            }
          ],
          responseType: 'json'
        })
          .then(function (response) {
            return response.data[0];
          })
          .catch(e => {
            console.log(e);
          });
        if (translationResult) {
          const { detectedLanguage, translations } = translationResult;
          let translateData;

          await this.prisma.$transaction(async prisma => {
            await prisma.post.update({
              where: {
                id: postId
              },
              data: {
                originalLanguage: detectedLanguage.language
              }
            });

            if (detectedLanguage.language === 'vi') {
              // if lang = vi then translate vi => en
              const translateLanguage = translations.find((lang: any) => lang.to === 'en');

              translateData = await prisma.postTranslation.create({
                data: {
                  post: { connect: { id: postId } },
                  translateLanguage: translateLanguage.to,
                  translateContent: translateLanguage.text
                }
              });
            } else if (detectedLanguage.language === 'en') {
              // if lang = en then translate en => vi

              const translateLanguage = translations.find((lang: any) => lang.to === 'vi');

              translateData = await prisma.postTranslation.create({
                data: {
                  post: { connect: { id: postId } },
                  translateLanguage: translateLanguage.to,
                  translateContent: translateLanguage.text
                }
              });
            } else {
              // fallback if lang other than en or vi, then translate to en
              const translateLanguage = translations.find((lang: any) => lang.to === 'en');
              translateData = await prisma.postTranslation.create({
                data: {
                  post: { connect: { id: postId } },
                  translateLanguage: translateLanguage.to,
                  translateContent: translateLanguage.text
                }
              });
            }

            const languageToUpdate = {
              originalLanguage: detectedLanguage.language,
              translations: [
                {
                  id: translateData.id,
                  translateLanguage: translateData.translateLanguage,
                  translateContent: translateData.translateContent
                }
              ]
            };

            this.meiliService.update(`${process.env.MEILISEARCH_BUCKET}_${POSTS}`, languageToUpdate, postId);
          });
        }

        break;
    }
  }
}
