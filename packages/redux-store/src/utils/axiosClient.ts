import axios from 'axios';

let locale = '';

export const injectStore = (_locale: string) => {
  locale = _locale;
};

const axiosClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const axiosLocalClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LOTUS_TEMPLE_URL // check if there is app url, replace it if using for another app
    ? process.env.NEXT_PUBLIC_LOTUS_TEMPLE_URL
    : '/',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor
axiosClient.interceptors.request.use(function (config) {
  config.headers.lang = locale;
  return config;
});

export default axiosClient;
