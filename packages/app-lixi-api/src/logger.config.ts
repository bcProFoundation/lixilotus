import { WinstonModule } from 'nest-winston';
import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
const { combine, timestamp, printf } = format;

export const transport = new winston.transports.DailyRotateFile({
  filename: 'lixi-api-%DATE%.log',
  handleExceptions: true,
  maxSize: '40m',
  maxFiles: '14d',
  dirname: './logs',
  level: 'debug' // TODO
});

export const formatTimestamp = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date
    .getMilliseconds()
    .toString()
    // .padEnd(3, '0')} ${timezone}`;
    .padEnd(3, '0')}`;

// export const timestamp = () => formatTimestamp(new Date());

export const loggerConfig = WinstonModule.createLogger({
  transports: [transport],
  exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log', dirname: './logs' })],
  exitOnError: false,
  format: combine(
    format.errors({ stack: true }), // log the full stack
    timestamp(), // get the time stamp part of the full log message
    printf(({ level, message, context, stack, timestamp }) => {
      const logLevel = level ?? '';
      const logStack = stack ? ` - stack: ${stack} ` : '';
      // formating the log outcome to show/store
      const logMessage: string = `${timestamp} [${context}] ${level ?? ''}: ${message} ${logStack}`;
      if (level == 'error') {
        console.log(logMessage);
      }
      return logMessage;
    })
  )
});

export default loggerConfig;
