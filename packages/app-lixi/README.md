<p align="center">
  <a href="https://github.com/bcProFoundation/lixilotus/tree/master/packages/app-lixi-api/" target="blank"><img src="https://lixilotus.com/images/lixi_logo.svg" width="160" alt="LixiLotus Logo" /></a>
</p>

## Description

The Next.js application provide the admin UI to allow giving lotus in form of lixi (red envelope lucky money).

## Installation

```bash
yarn install
```

## Prepare

Setup https certificate on local machine (Recommend: mkcert)

Setup environment variables

```
Copy .env.example file to .env and change the variables
```

Setup nginx reverse proxy (backend and frontend use same server)
Change the certificates path accordingly

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

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [https://lixilotus.test](https://lixilotus.test) with your browser to see the result.

## License

Code released under [the MIT license](https://github.com/bcProFoundation/lixilotus/blob/master/LICENSE).

Copyright 2020-2022 bcProFoundation.
