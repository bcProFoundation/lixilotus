<p align="center">
  <a href="https://github.com/bcProFoundation/lixilotus/tree/master/packages/app-lixi-api/" target="blank"><img src="https://lixilotus.com/images/lixi_logo.svg" width="160" alt="LixiLotus Logo" /></a>
</p>

## Description

The backend application provides the api for the LixiLotusLove and SendLotus applications.

## Installation

```bash
$ yarn install
```

## Prepare

Setup Redis since the job queue need Redis to run

Setup environment variables

```bash
- Copy file .env.example to .env and change the variable accordingly
- Prepare the certificate in order to run the application (the encrypt/hash features need https)
$ npx prisma migrate
$ yarn seed
```

Setup nginx reverse proxy so the frontend and backend use same domain (example for windows below:)

```conf
server {
  listen		127.0.0.1:443 ssl http2;
  ssl_certificate_key "f:/winnmp/conf/opensslCA/selfsigned/lixilotus.test.key";
  ssl_certificate "f:/winnmp/conf/opensslCA/selfsigned/lixilotus.test.crt";

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
}

```

## Running the app

```bash
# development
# windows
$ set NODE_ENV=development&& yarn start
# linux
$ NODE_ENV=development yarn start

# watch mode
# windows
$ set NODE_ENV=development&& yarn start:dev
# linux
$ NODE_ENV=development yarn start:dev

# production mode
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
