import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Page } from '../page.model';

@ObjectType()
export class PageConnection extends Paginated(Page) {}
