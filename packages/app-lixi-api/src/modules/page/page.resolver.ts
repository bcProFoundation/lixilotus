import { Page } from "@bcpros/lixi-models";
import { Args, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";

@Resolver(() => Page)
export class PageResolver {
  constructor(private prisma: PrismaService) { }

  @Query(() => Page)
  async page(@Args('id', { type: () => String }) id: string) {
    return this.prisma.page.findUnique({ where: { id: id } });
  }

  // @ResolveField('author', () => User)
  // async author(@Parent() post: Post) {
  //   return this.prisma.post.findUnique({ where: { id: post.id } }).author();
  // }
}