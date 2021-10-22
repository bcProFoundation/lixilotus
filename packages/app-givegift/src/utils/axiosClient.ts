import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_GIVEGIFT_API ? process.env.REACT_APP_GIVEGIFT_API : 'https://api.lotusgift.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;