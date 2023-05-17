import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Temple } from '../temple.model';

@ObjectType()
export class TempleConnection extends Paginated(Temple) {}
