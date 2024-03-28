import { HttpHeaders } from '@angular/common/http';
import {
  HeadersOptions,
  QuerySerializer,
  QuerySerializerOptions,
} from './openapi-client.types';

const PATH_PARAM_RE = /\{[^{}]+\}/g;

export const createQuerySerializer = <T = unknown>(
  options?: QuerySerializerOptions,
): ((queryParams: T) => string) => {
  return function querySerializer(queryParams) {
    const search = [];
    if (queryParams && typeof queryParams === 'object') {
      for (const name in queryParams) {
        const value = queryParams[name];
        if (value === undefined || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          search.push(
            serializeArrayParam(name, value, {
              style: 'form',
              explode: true,
              ...options?.array,
              allowReserved: options?.allowReserved || false,
            }),
          );
          continue;
        }
        if (typeof value === 'object') {
          search.push(
            serializeObjectParam(name, value as Record<string, unknown>, {
              style: 'deepObject',
              explode: true,
              ...options?.object,
              allowReserved: options?.allowReserved || false,
            }),
          );
          continue;
        }
        search.push(serializePrimitiveParam(name, value as string, options));
      }
    }
    return search.join('&');
  };
};

export const serializeArrayParam = (
  name: string,
  value: unknown[],
  options: {
    style:
      | 'simple'
      | 'label'
      | 'matrix'
      | 'form'
      | 'spaceDelimited'
      | 'pipeDelimited';
    explode: boolean;
    allowReserved?: boolean;
  },
): string => {
  if (!Array.isArray(value)) {
    return '';
  }

  if (options.explode === false) {
    const joiner =
      {
        form: ',',
        spaceDelimited: '%20',
        pipeDelimited: '|',
        simple: ',',
        label: ',',
        matrix: ',',
      }[options.style] || ',';
    const final = (
      options.allowReserved === true
        ? value
        : value.map((v) => encodeURIComponent(v as string))
    ).join(joiner);
    switch (options.style) {
      case 'simple': {
        return final;
      }
      case 'label': {
        return `.${final}`;
      }
      case 'matrix': {
        return `;${name}=${final}`;
      }
      case 'spaceDelimited':
      case 'pipeDelimited':
      default: {
        return `${name}=${final}`;
      }
    }
  } else {
    const joiner =
      {
        form: '&',
        spaceDelimited: '&',
        pipeDelimited: '&',
        simple: ',',
        label: '.',
        matrix: ';',
      }[options.style] || '&';
    const values = [];
    for (const v of value) {
      if (options.style === 'simple' || options.style === 'label') {
        values.push(
          options.allowReserved === true ? v : encodeURIComponent(v as string),
        );
      } else {
        values.push(serializePrimitiveParam(name, v as string, options));
      }
    }
    return options.style === 'label' || options.style === 'matrix'
      ? `${joiner}${values.join(joiner)}`
      : values.join(joiner);
  }
};

export const serializePrimitiveParam = (
  name: string,
  value: string,
  options?: { allowReserved?: boolean },
): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'object') {
    throw new Error(
      `Deeply-nested arrays/objects aren’t supported. Provide your own \`querySerializer()\` to handle these.`,
    );
  }
  return `${name}=${
    options?.allowReserved === true ? value : encodeURIComponent(value)
  }`;
};

export const serializeObjectParam = (
  name: string,
  value: Record<string, unknown>,
  options: {
    style: 'simple' | 'label' | 'matrix' | 'form' | 'deepObject';
    explode: boolean;
    allowReserved?: boolean;
  },
): string => {
  if (!value || typeof value !== 'object') {
    return '';
  }
  const values = [];
  const joiner =
    {
      simple: ',',
      label: '.',
      matrix: ';',
      form: '&',
      deepObject: '&',
    }[options.style] || '&';

  if (options.style !== 'deepObject' && options.explode === false) {
    for (const k in value) {
      values.push(
        k,
        options.allowReserved === true
          ? value[k]
          : encodeURIComponent(value[k] as string),
      );
    }
    const final = values.join(',');
    switch (options.style) {
      case 'form': {
        return `${name}=${final}`;
      }
      case 'label': {
        return `.${final}`;
      }
      case 'matrix': {
        return `;${name}=${final}`;
      }
      default: {
        return final;
      }
    }
  }

  for (const k in value) {
    const finalName = options.style === 'deepObject' ? `${name}[${k}]` : k;
    values.push(
      serializePrimitiveParam(finalName, value[k] as string, options),
    );
  }
  const final = values.join(joiner);
  return options.style === 'label' || options.style === 'matrix'
    ? `${joiner}${final}`
    : final;
};

export const mergeHeaders = (
  ...allHeaders: (HeadersOptions | undefined)[]
): HeadersOptions => {
  return allHeaders.reduce<HeadersOptions>((acc, headers) => {
    if (!headers) {
      return acc;
    }
    for (const key in headers) {
      acc[key] = headers[key];
    }
    return acc;
  }, {});
};

export const convertHeaders = (headers?: HeadersOptions): HttpHeaders => {
  let httpHeaders = new HttpHeaders();
  for (const key in headers) {
    if (!headers[key]) continue;
    httpHeaders = httpHeaders.set(key, headers[key] as string);
  }
  return httpHeaders;
};

export const defaultPathSerializer = (
  pathname: string,
  pathParams: Record<string, unknown>,
): string => {
  let nextURL = pathname;
  for (const match of pathname.match(PATH_PARAM_RE) ?? []) {
    let name = match.substring(1, match.length - 1);
    let explode = false;
    let style:
      | 'simple'
      | 'label'
      | 'matrix'
      | 'form'
      | 'spaceDelimited'
      | 'pipeDelimited' = 'simple';
    if (name.endsWith('*')) {
      explode = true;
      name = name.substring(0, name.length - 1);
    }
    if (name.startsWith('.')) {
      style = 'label';
      name = name.substring(1);
    } else if (name.startsWith(';')) {
      style = 'matrix';
      name = name.substring(1);
    }
    if (
      !pathParams ||
      pathParams[name] === undefined ||
      pathParams[name] === null
    ) {
      continue;
    }
    const value = pathParams[name];
    if (Array.isArray(value)) {
      nextURL = nextURL.replace(
        match,
        serializeArrayParam(name, value, { style, explode }),
      );
      continue;
    }
    if (typeof value === 'object') {
      nextURL = nextURL.replace(
        match,
        serializeObjectParam(name, value as Record<string, unknown>, {
          style,
          explode,
        }),
      );
      continue;
    }
    if (style === 'matrix') {
      nextURL = nextURL.replace(
        match,
        `;${serializePrimitiveParam(name, value as string)}`,
      );
      continue;
    }
    nextURL = nextURL.replace(
      match,
      style === 'label' ? `.${value as string}` : (value as string),
    );
    continue;
  }
  return nextURL;
};

export const createFinalURL = <O>(
  pathname: string,
  options: {
    baseUrl: string;
    params: {
      query?: Record<string, unknown>;
      path?: Record<string, unknown>;
    };
    querySerializer: QuerySerializer<O>;
  },
): string => {
  let finalURL = `${options.baseUrl}${pathname}`;
  if (options.params?.path) {
    finalURL = defaultPathSerializer(finalURL, options.params.path);
  }
  let search = options.querySerializer((options.params.query as any) ?? {});
  if (search.startsWith('?')) {
    search = search.substring(1);
  }
  if (search) {
    finalURL += `?${search}`;
  }
  return finalURL;
};
