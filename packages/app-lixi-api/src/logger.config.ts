import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import winston, { format } from 'winston';
import LogzioWinstonTransport from 'winston-logzio';
import 'winston-daily-rotate-file';
import { verrorFormat } from 'winston-verror-format';
import LokiTransport from 'winston-loki';
const { combine, timestamp, printf } = format;

const environment = process.env.DEPLOY_ENVIRONMENT;
const nodeEnv = process.env.NODE_ENV;
const allowGrafanaLogging = process.env.GRAFANA_ALLOW === 'true';

const allTransports: winston.transport[] = [
  new winston.transports.DailyRotateFile({
    filename: 'lixi-api-%DATE%.log',
    handleExceptions: true,
    maxSize: '40m',
    maxFiles: '14d',
    dirname: './logs',
    level: 'debug' // TODO
  })
];
if (allowGrafanaLogging) {
  allTransports.push(
    new LokiTransport({
      host: process.env.GRAFANA_HOST ?? '',
      labels: { app: 'app-lixi-api', env: process.env.DEPLOY_ENVIRONMENT ?? 'local' },
      basicAuth: `${process.env.GRAFANA_USER_ID}:${process.env.GRAFANA_API_KEY}`,
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err)
    })
  );
}

if (nodeEnv !== 'development') {
  const logzioWinstonTransport = new LogzioWinstonTransport({
    level: 'info',
    name: 'winston_logzio',
    token: process.env.LOGZIO_TOKEN ?? '',
    host: process.env.LOGZIO_HOST ?? '',
    extraFields: {
      environment: `${environment}`
    }
  });
  allTransports.push(logzioWinstonTransport);
}

if (nodeEnv === 'local') {
  const logConsoleWinstonTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
      format.splat(),
      format.simple()
    )
  });
  allTransports.push(logConsoleWinstonTransport);
}

// export const timestamp = () => formatTimestamp(new Date());

export const loggerConfig = WinstonModule.createLogger({
  transports: allTransports,
  exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log', dirname: './logs' })],
  exitOnError: false,
  format: combine(
    format.splat(),
    verrorFormat({ stack: true }), // log the full stack
    timestamp(), // get the time stamp part of the full log message
    format.prettyPrint(),
    printf(({ level, message, context, stack, timestamp }) => {
      const logStack = stack ? ` - stack: ${stack} ` : '';
      // formating the log outcome to show/store
      const logMessage: string = `[${environment}] ${timestamp} [${context}] ${level ?? ''}: ${message} ${logStack}`;
      if (level == 'error') {
        console.log(logMessage);
      }
      return logMessage;
    })
  )
});

export default loggerConfig;
