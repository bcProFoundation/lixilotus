import { Page, PaginationArgs, PageOrder, PageConnection } from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => Page)
export class PageResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Page)
  async page(@Args('id', { type: () => String }) id: string) {
    return this.prisma.page.findUnique({ where: { id: id } });
  }

  @Query(() => PageConnection)
  async allPages(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => PageOrder,
      nullable: true
    })
    orderBy: PageOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.page.findMany({
          include: { pageAccount: true },
          where: {
            OR: {
              title: { contains: query || '' },
              name: { contains: query || '' }
            }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.page.count({
          where: {
            OR: {
              title: { contains: query || '' },
              name: { contains: query || '' }
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  // @ResolveField('author', () => User)
  // async author(@Parent() post: Post) {
  //   return this.prisma.post.findUnique({ where: { id: post.id } }).author();
  // }
}
