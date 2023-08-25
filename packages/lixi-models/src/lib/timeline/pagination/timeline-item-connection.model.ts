import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { TimelineItem } from '../timeline-item.model';

@ObjectType()
export class TimelineItemConnection extends Paginated(TimelineItem) {}
