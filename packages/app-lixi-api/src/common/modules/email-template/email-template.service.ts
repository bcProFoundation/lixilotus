import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Not, ObjectLiteral } from 'typeorm';

// import { CreateEmailTemplateDto } from 'src/email-template/dto/create-email-template.dto';
// import { UpdateEmailTemplateDto } from 'src/email-template/dto/update-email-template.dto';
// import { EmailTemplateRepository } from 'src/email-template/email-template.repository';
// import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
// import { EmailTemplate } from 'src/email-template/serializer/email-template.serializer';
// import { EmailTemplatesSearchFilterDto } from 'src/email-template/dto/email-templates-search-filter.dto';
// import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
// import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
// import { ForbiddenException } from 'src/exception/forbidden.exception';
// import { Pagination } from 'src/paginate';

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
  // async findBySlug(slug: string) {
  //   return await this.prisma.find({
  //     select: ['body'],
  //     where: {
  //       slug
  //     }
  //   });
  // }
}
