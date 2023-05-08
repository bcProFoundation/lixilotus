import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Account } from '../account.model';

@ObjectType()
export class AccountConnection extends Paginated(Account) {}
