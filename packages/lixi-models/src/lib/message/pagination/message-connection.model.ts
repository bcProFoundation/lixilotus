import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Message } from '../message.model';

@ObjectType()
export class MessageConnection extends Paginated(Message) {}
