import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ClientMethod,
  ClientOptions,
  FetchOptions,
} from './openapi-client.types';
import {
  createFinalURL,
  createQuerySerializer,
  mergeHeaders,
} from './openapi-serializer';
import { lastValueFrom } from 'rxjs';

export const DEFAULT_HEADERS = new HttpHeaders({
  'Content-Type': 'application/json',
});

@Injectable({
  providedIn: 'root',
})
export abstract class OpenAPIClientService<Paths extends {}> {
  get;
  put;
  post;
  delete;
  options;
  head;
  patch;
  trace;

  constructor(http: HttpClient, clientOptions: ClientOptions) {
    let {
      baseUrl = '',
      querySerializer: globalQuerySerializer,
      headers: baseHeaders,
      ...baseOptions
    } = {
      ...clientOptions,
    };
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }
    baseHeaders = mergeHeaders(DEFAULT_HEADERS, baseHeaders);

    const coreFetch = async (url: any, fetchOptions: FetchOptions<any>) => {
      let {
        headers,
        params = {},
        querySerializer: requestQuerySerializer,
        ...init
      } = fetchOptions || {};

      let querySerializer =
        typeof globalQuerySerializer === 'function'
          ? globalQuerySerializer
          : createQuerySerializer(globalQuerySerializer);
      if (requestQuerySerializer) {
        querySerializer =
          typeof requestQuerySerializer === 'function'
            ? requestQuerySerializer
            : createQuerySerializer({
                ...(typeof globalQuerySerializer === 'object'
                  ? globalQuerySerializer
                  : {}),
                ...requestQuerySerializer,
              });
      }

      const requestInit = {
        ...baseOptions,
        ...init,
        headers: mergeHeaders(baseHeaders, headers, params.headers),
      };

      const request = new HttpRequest(
        requestInit.method as any,
        createFinalURL(url, { baseUrl, params, querySerializer }),
        requestInit.body ?? null,
        requestInit,
      );

      const response = (await lastValueFrom(
        http.request(request),
      )) as HttpResponse<unknown>;

      return response.ok
        ? {
            data: response.body,
            response,
          }
        : {
            error: response.body,
            response,
          };
    };

    this.get = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'GET' });
    }) as ClientMethod<Paths, 'get'>;

    this.put = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'PUT' });
    }) as ClientMethod<Paths, 'put'>;

    this.post = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'POST' });
    }) as ClientMethod<Paths, 'post'>;

    this.delete = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'DELETE' });
    }) as ClientMethod<Paths, 'delete'>;

    this.options = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'OPTIONS' });
    }) as ClientMethod<Paths, 'options'>;

    this.head = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'HEAD' });
    }) as ClientMethod<Paths, 'head'>;

    this.patch = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'PATCH' });
    }) as ClientMethod<Paths, 'patch'>;

    this.trace = (async (url, init) => {
      return coreFetch(url, { ...init, method: 'TRACE' });
    }) as ClientMethod<Paths, 'trace'>;
  }
}
