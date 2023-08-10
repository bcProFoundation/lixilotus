import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { PageMessageSession } from '../pageMessageSession.model';

@ObjectType()
export class PageMessageSessionConnection extends Paginated(PageMessageSession) {}
