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

// Add a request interceptor
axiosClient.interceptors.request.use(function (config) {
  config.headers.lang = locale;
  return config;
});

export default axiosClient;
