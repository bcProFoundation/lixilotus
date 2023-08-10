import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { MessageSession } from '../messageSession.model';

@ObjectType()
export class MessageSessionConnection extends Paginated(MessageSession) {}
