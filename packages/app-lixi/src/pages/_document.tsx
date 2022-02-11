import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

export default class MyDocument extends Document {

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en" >
        <Head>
          <meta charSet="utf-8" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/favicon.ico" />

          
          <meta name="theme-color" content="#000000" />
          <meta name="description" content="Website allow user to give lotus to others" />
          <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
          <link rel="shortcut icon" type="image/x-icon" sizes="512x512" href="/favicon.ico" />
        </Head>
        < body >
          <Main />
          <NextScript />
        </body>
      </Html >
    )
  }

}