import { Injectable, Logger } from '@nestjs/common';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class EmailTemplateService {
  private logger: Logger = new Logger(EmailTemplateService.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  /**
   * convert string to slug
   * @param text
   */
  slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Find Email Template By Slug
   * @param slug
   */
  async findBySlug(slug: string) {
    return this.prisma.emailTemplate.findFirst({
      where: {
        slug
      }
    });
  }
}
