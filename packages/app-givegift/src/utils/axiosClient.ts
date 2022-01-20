import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_LIXI_API ? process.env.REACT_APP_LIXI_API : 'https://api.lixilotus.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;