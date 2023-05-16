import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { FollowAccount } from '../followAccount.model';

@ObjectType()
export class FollowAccountConnection extends Paginated(FollowAccount) {}
