import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

export const AccountEntity = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  if (ctx.getType() === 'http') {
    const req = ctx.switchToHttp().getRequest();
    return req.account;
  } else if (ctx.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(ctx).getContext().req.account;
  }
});
