import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { WorshipedPerson } from '../worshipedPerson.model';

@ObjectType()
export class WorshipedPersonConnection extends Paginated(WorshipedPerson) {}
