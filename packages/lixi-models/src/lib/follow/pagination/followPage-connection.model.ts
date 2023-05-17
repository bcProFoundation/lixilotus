import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { FollowPage } from '../followPage.model';

@ObjectType()
export class FollowPageConnection extends Paginated(FollowPage) {}
