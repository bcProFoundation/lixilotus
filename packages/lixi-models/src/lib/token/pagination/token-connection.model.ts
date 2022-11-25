import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Token } from '../token.model';

@ObjectType()
export class TokenConnection extends Paginated(Token) {}
