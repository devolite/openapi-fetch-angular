import { HttpRequest, HttpResponse } from '@angular/common/http';
import {
  ErrorResponse,
  FilterKeys,
  HasRequiredKeys,
  HttpMethod,
  MediaType,
  OperationRequestBodyContent,
  PathsWithMethod,
  ResponseObjectMap,
  SuccessResponse,
} from 'openapi-typescript-helpers';
import { Observable } from 'rxjs';

export type QuerySerializer<T> = (
  query: T extends { parameters: any }
    ? NonNullable<T['parameters']['query']>
    : Record<string, unknown>,
) => string;

export type PathMethods = Partial<Record<HttpMethod, {}>>;

export interface DefaultParamsOption {
  params?: {
    query?: Record<string, unknown>;
  };
}

export interface ClientOptions
  extends Partial<
    Omit<HttpRequest<unknown>, 'headers' | 'url' | 'urlWithParams'>
  > {
  baseUrl?: string;
  querySerializer?: QuerySerializer<unknown> | QuerySerializerOptions;
  headers?: HeadersOptions;
}

export type HeadersOptions = Record<
  string,
  string | number | boolean | (string | number | boolean)[] | null | undefined
>;

export type ParamsOption<T> = T extends {
  parameters: any;
}
  ? HasRequiredKeys<T['parameters']> extends never
    ? { params?: T['parameters'] }
    : { params: T['parameters'] }
  : DefaultParamsOption;

export type QuerySerializerOptions = {
  array?: {
    style: 'form' | 'spaceDelimited' | 'pipeDelimited';
    explode: boolean;
  };
  object?: {
    style: 'form' | 'deepObject';
    explode: boolean;
  };
  allowReserved?: boolean;
};

export type RequestBodyOption<T> =
  OperationRequestBodyContent<T> extends never
    ? { body?: never }
    : undefined extends OperationRequestBodyContent<T>
      ? { body?: OperationRequestBodyContent<T> }
      : { body: OperationRequestBodyContent<T> };

export type RequestOptions<T> = ParamsOption<T> &
  RequestBodyOption<T> & {
    querySerializer?: QuerySerializer<T> | QuerySerializerOptions;
    headers?: HeadersOptions;
  };

export type FetchOptions<T> = RequestOptions<T> &
  Partial<Omit<HttpRequest<T>, 'body' | 'headers' | 'params'>>;

export type MaybeOptionalInit<P extends PathMethods, M extends keyof P> =
  HasRequiredKeys<FetchOptions<FilterKeys<P, M>>> extends never
    ? [(FetchOptions<FilterKeys<P, M>> | undefined)?]
    : [FetchOptions<FilterKeys<P, M>>];

export type FetchResponse<T> =
  | {
      data: FilterKeys<SuccessResponse<ResponseObjectMap<T>>, MediaType>;
      error: never;
      response: HttpResponse<
        FilterKeys<SuccessResponse<ResponseObjectMap<T>>, MediaType>
      >;
    }
  | {
      data: never;
      error: FilterKeys<ErrorResponse<ResponseObjectMap<T>>, MediaType>;
      response: HttpResponse<
        FilterKeys<ErrorResponse<ResponseObjectMap<T>>, MediaType>
      >;
    };

export type ClientPromiseMethod<
  Paths extends Record<string, PathMethods>,
  M extends HttpMethod,
> = <
  P extends PathsWithMethod<Paths, M>,
  I extends MaybeOptionalInit<Paths[P], M>,
>(
  url: P,
  ...init: I
) => Promise<FetchResponse<Paths[P][M]>>;

export type ClientObservableMethod<
  Paths extends Record<string, PathMethods>,
  M extends HttpMethod,
> = <
  P extends PathsWithMethod<Paths, M>,
  I extends MaybeOptionalInit<Paths[P], M>,
>(
  url: P,
  ...init: I
) => Observable<FetchResponse<Paths[P][M]>>;
