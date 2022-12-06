import { Type } from '@nestjs/common';
import { ObjectType, Field } from '@nestjs/graphql';
import * as Relay from './connection';

const typeMap: any = {};

export default function relayTypes<T>(type: Type<T>): any {
  const { name } = type;
  const postMeili = `${name}Meili`;
  if (typeMap[`${postMeili}`]) return typeMap[`${postMeili}`];

  @ObjectType(`${postMeili}Edge`, { isAbstract: true })
  class Edge implements Relay.Edge<T> {
    public postMeili = `${postMeili}Edge`;

    @Field({ nullable: true })
    public cursor!: Relay.ConnectionCursor;

    @Field(() => type, { nullable: true })
    public node!: T;
  }

  @ObjectType(`${postMeili}PageInfo`, { isAbstract: true })
  class PageInfo implements Relay.PageInfo {
    @Field({ nullable: true })
    public startCursor!: Relay.ConnectionCursor;

    @Field({ nullable: true })
    public endCursor!: Relay.ConnectionCursor;

    @Field(() => Boolean)
    public hasPreviousPage!: boolean;

    @Field(() => Boolean)
    public hasNextPage!: boolean;
  }

  @ObjectType(`${postMeili}Connection`, { isAbstract: true })
  class Connection implements Relay.Connection<T> {
    public postMeili = `${postMeili}Connection`;

    @Field(() => [Edge], { nullable: true })
    public edges!: Relay.Edge<T>[];

    @Field(() => PageInfo, { nullable: true })
    public pageInfo!: Relay.PageInfo;
  }

  typeMap[`${postMeili}`] = Connection;
  return typeMap[`${postMeili}`];
}
