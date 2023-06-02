import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import moment from 'moment';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<Date, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string): Date {
    return moment(value).toDate(); // value from the client
  }

  serialize(value: any): Date {
    return moment(value).toDate(); // value sent to the client
  }

  parseLiteral(ast: any): Date {
    if (ast.kind === Kind.INT) {
      return moment(ast.value).toDate();
    }
    return null;
  }
}
