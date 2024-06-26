<p align="center">
  <a href="https://github.com/bcProFoundation/lixilotus/tree/master/packages/app-lixi-api/" target="blank"><img src="https://lixilotus.com/images/lixi_logo.svg" width="160" alt="Lixi Logo" /></a>
</p>

## Description

The backend application provides the api for the LixiLotusLove and SendLotus applications.

## Installation

```bash
$ yarn install
```

## Prepare

Setup Postgres database

Setup Redis since the job queue need Redis to run

Setup https certificate on local machine (Recommend: mkcert)

Setup environment variables

```bash
- Copy file .env.example to .env and change the variable accordingly (postgres, redis, evm url)
- Prepare the certificate in order to run the application (with mkcert) (the encrypt/hash features need https)
$ npx prisma migrate
$ npx prisma db seed
```

Setup nginx reverse proxy so the frontend and backend use same domain (example for windows below:)

```conf
server {
  listen		127.0.0.1:443 ssl http2;
  ssl_certificate_key "f:/winnmp/conf/opensslCA/selfsigned/lixilotus.test.key" # use your cert;
  ssl_certificate "f:/winnmp/conf/opensslCA/selfsigned/lixilotus.test.crt" # use your cert;

  server_name 	lixilotus.test;

  location ^~ /socket.io/ {
    proxy_pass http://localhost:4800/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /_next/webpack-hmr {
    proxy_pass http://localhost:3000/_next/webpack-hmr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location ^~ /api/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP  $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://localhost:4800$request_uri;
  }

  location /graphql {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP  $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://localhost:4800/graphql;
	}

}

```

## Running the app

```bash
# development
# windows command line
$ set NODE_ENV=development&& yarn start
# windows powershell
($env:NODE_ENV="development") -and (yarn start)
# linux
$ NODE_ENV=development yarn start

# watch mode
# windows command line
$ set NODE_ENV=development&& yarn start:dev
# windows powershell
($env:NODE_ENV="development") -and (yarn start)
# linux
$ NODE_ENV=development yarn start:dev

# production mode
$ yarn build
$ yarn start:prod
```

Open [https://lixilotus.test/api](https://lixilotus.test/api) with your browser to see the api list.

## Stay in touch

- Author - [bcPro Foundation](https://github.com/bcProFoundation)
- Website - [GiveLotus](https://givelotus.org/)
- Telegram - [GiveLotus](https://t.me/givelotus)

## License

Code released under [the MIT license](https://github.com/bcProFoundation/lixilotus/blob/master/LICENSE).

Copyright 2020-2022 bcProFoundation.

## Logging

- To log message:

```
  private logger: Logger = new Logger(ClaimController.name);
  ...
  ...
  this.logger.log(`log message`);
  this.logger.log(`log message`);
```

- To log **object** don't forget to **stringify**

```
  this.logger.log(`${JSON.stringify(object)}`);

```

- Throw instance of VError for every Error of HTTP methods to log error message
- Example:

```
  @Post()
  async createItem(){
    try {
      // logic of method
    } catch {
      catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const message = `${errorMessage}`;
          const error = new VError.WError(err as Error, message);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  }
```
