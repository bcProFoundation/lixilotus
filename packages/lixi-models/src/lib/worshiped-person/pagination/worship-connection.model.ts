import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Worship } from '../worship.model';

@ObjectType()
export class WorshipConnection extends Paginated(Worship) {}
