import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import config from "./config";

export type QueryStringParams = string | Record<string, any> | [string, any][];

export interface RequestError {
  message: string;
}

export const REFRESH_TOKEN = "REFRESH";

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiURL
    });
  }

  async get<T>(
    url: string,
    parameters: QueryStringParams = "",
    config: Omit<AxiosRequestConfig, "method" | "url"> = {}
  ): Promise<T> {
    const searchParams = new URLSearchParams(parameters);
    const searchParamsString = searchParams.toString();
    return this.client
      .get<T | RequestError>(
        url + (searchParamsString.length > 0 ? `?${searchParamsString}` : ""),
        {
          ...config,
        }
      )
      .then(this.handleResponse<T>);
  }

  async post<B, R>(
    url: string,
    body: B,
    config?: Omit<AxiosRequestConfig, "method" | "url">
  ) {
    return this.client
      .post<B, AxiosResponse<R | RequestError>>(url, body, {
        ...config,
        headers: {
          "Content-Type": "application/json",
          ...(config?.headers ?? {}),
        },
      })
      .then(this.handleResponse<R>);
  }

  async put<B, R>(url: string, body: B) {
    return this.client
      .put<B, AxiosResponse<R | RequestError>>(url, body)
      .then(this.handleResponse);
  }

  async patch<B, R>(url: string, body: B) {
    return this.client
      .patch<B, AxiosResponse<R | RequestError>>(url, body)
      .then(this.handleResponse<R>);
  }

  async delete<T>(url: string) {
    return this.client
      .delete<T | RequestError>(url)
      .then(this.handleResponse<T>);
  }

  handleResponse<B>(res: AxiosResponse<B | RequestError>) {
    if (res.status >= 200 && res.status < 400) {
      return res.data as B;
    }
    throw Error((res.data as RequestError)?.message);
  }

  cleanClient() {
    this.client = axios.create({});
  }

  onError(error: unknown) {
    console.error('[HTTP-CLIENT]:\n')
    console.error(error)
  }
}

export const http = new HttpClient();
