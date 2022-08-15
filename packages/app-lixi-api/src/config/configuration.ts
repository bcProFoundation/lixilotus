import { merge } from 'lodash';
import DefaultConfig from './config.default';

export default () => {
  let envConfig = {};
  try {
    envConfig = require(`./config.${process.env.NODE_ENV}`).default;
  } catch (e) {}

  return merge(DefaultConfig(), envConfig);
};
