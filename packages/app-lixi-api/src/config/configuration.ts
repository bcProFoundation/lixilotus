import { merge } from 'lodash';
import DefaultConfig from './config.default';
import { Config } from './config.interface';

export default () => {
  const defaultEnv = {
    cloudflare: {
      cfAccountId: process.env.CF_ACCOUNT_ID,
      cfImagesToken: process.env.CF_IMAGES_TOKEN,
      cfImagesDeliveryUrl: process.env.CF_IMAGES_DELIVERY_URL
    }
  };

  let envConfig = {};
  try {
    envConfig = require(`./config.${process.env.NODE_ENV}`).default;
  } catch (e) {}

  return merge(DefaultConfig(), defaultEnv, envConfig);
};
