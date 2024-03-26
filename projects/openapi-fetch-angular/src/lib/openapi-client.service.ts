import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ClientObservableMethod,
  ClientOptions,
  ClientPromiseMethod,
  FetchOptions,
} from './openapi-client.types';
import {
  createFinalURL,
  createQuerySerializer,
  mergeHeaders,
} from './openapi-serializer';
import { filter, lastValueFrom, map } from 'rxjs';

export const DEFAULT_HEADERS = new HttpHeaders({
  'Content-Type': 'application/json',
});

@Injectable({
  providedIn: 'root',
})
export abstract class OpenAPIClientService<Paths extends {}> {
  get;
  getPromise;

  put;
  putPromise;

  post;
  postPromise;

  delete;
  deletePromise;

  options;
  optionsPromise;

  head;
  headPromise;

  patch;
  patchPromise;

  trace;
  tracePromise;

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

    const coreObservableFetch = (url: any, fetchOptions: FetchOptions<any>) => {
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

      return http.request(request).pipe(
        filter((response) => response instanceof HttpResponse),
        map((response) => {
          if (!(response instanceof HttpResponse)) {
            throw new Error(
              'Invalid response! This should not never happen, please report this issue.',
            );
          }
          return response.ok
            ? {
                data: response.body,
                response,
              }
            : {
                error: response.body,
                response,
              };
        }),
      );
    };

    const corePromiseFetch = async (
      url: any,
      fetchOptions: FetchOptions<any>,
    ) => {
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

    this.get = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'GET' });
    }) as ClientObservableMethod<Paths, 'get'>;
    this.getPromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'GET' });
    }) as ClientPromiseMethod<Paths, 'get'>;

    this.put = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'PUT' });
    }) as ClientObservableMethod<Paths, 'get'>;
    this.putPromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'PUT' });
    }) as ClientPromiseMethod<Paths, 'put'>;

    this.post = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'POST' });
    }) as ClientObservableMethod<Paths, 'post'>;
    this.postPromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'POST' });
    }) as ClientPromiseMethod<Paths, 'post'>;

    this.delete = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'DELETE' });
    }) as ClientObservableMethod<Paths, 'delete'>;
    this.deletePromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'DELETE' });
    }) as ClientPromiseMethod<Paths, 'delete'>;

    this.options = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'OPTIONS' });
    }) as ClientObservableMethod<Paths, 'options'>;
    this.optionsPromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'OPTIONS' });
    }) as ClientPromiseMethod<Paths, 'options'>;

    this.head = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'HEAD' });
    }) as ClientObservableMethod<Paths, 'head'>;
    this.headPromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'HEAD' });
    }) as ClientPromiseMethod<Paths, 'head'>;

    this.patch = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'PATCH' });
    }) as ClientObservableMethod<Paths, 'patch'>;
    this.patchPromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'PATCH' });
    }) as ClientPromiseMethod<Paths, 'patch'>;

    this.trace = ((url, init) => {
      return coreObservableFetch(url, { ...init, method: 'TRACE' });
    }) as ClientObservableMethod<Paths, 'trace'>;
    this.tracePromise = (async (url, init) => {
      return corePromiseFetch(url, { ...init, method: 'TRACE' });
    }) as ClientPromiseMethod<Paths, 'trace'>;
  }
}
