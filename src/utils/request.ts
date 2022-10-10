/**
 * http请求工具
 */
import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_HOST = 'http://10.0.10.78:32109';

interface Response {
  code: string;
  failed: boolean;
  message: string;
  type: string;
  data: any;
}

const service = axios.create({
  baseURL: API_HOST,
  timeout: 1000 * 10,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (err: Error) => {
    return Promise.reject(err);
  },
);

service.interceptors.response.use((res: AxiosResponse<Response>) => {
  if (!res) {
    return Promise.reject(new Error('timeout'));
  }
  const { failed } = res.data;
  if (failed) {
    return Promise.reject(res.data);
  }
  if (res.data.data) {
    return res.data.data;
  }
  return res.data;
});

export default service;
