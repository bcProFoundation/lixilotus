export = {
  port: 4800,
  https: false,
  rateLimiter: {
    disabled: true,
    whitelist: ['::ffff:127.0.0.1', '::1', '127.0.0.1',]
  }
};