import type { AxiosRequestConfig, AxiosStatic } from 'axios';

import type {
  BodySerializer,
  Middleware,
  QuerySerializer,
  QuerySerializerOptions,
} from './utils';

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

// Omit<RequestInit, 'body' | 'headers' | 'method'>
export interface Config extends Omit<AxiosRequestConfig, 'headers' | 'method'> {
  /**
   * Axios implementation. You can use this option to provide a custom
   * Axios instance.
   * @default axios
   */
  // TODO: update signature interface
  axios?: AxiosStatic;
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  body?:
    | RequestInit['body']
    | Record<string, unknown>
    | Array<Record<string, unknown>>;
  /**
   * A function for serializing request body parameter. By default,
   * {@link JSON.stringify()} will be used.
   */
  bodySerializer?: BodySerializer;
  /**
   * By default, options passed to this call will be applied to the global
   * client instance. Set to false to create a local client instance.
   * @default true
   */
  global?: boolean;
  /**
   * An object containing any HTTP headers that you want to pre-populate your
   * `Headers` object with.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/Headers/Headers#init See more}
   */
  headers?:
    | AxiosRequestConfig['headers']
    | Record<
        string,
        | string
        | number
        | boolean
        | (string | number | boolean)[]
        | null
        | undefined
      >;
  /**
   * The request method.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#method See more}
   */
  method?:
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'TRACE';
  /**
   * Return the response data parsed in a specified format. By default, `auto`
   * will infer the appropriate method from the `Content-Type` response header.
   * You can override this behavior with any of the {@link Body} methods.
   * Select `stream` if you don't want to parse response data at all.
   * @default 'auto'
   */
  parseAs?: Exclude<keyof Body, 'body' | 'bodyUsed'> | 'auto' | 'stream';
  /**
   * A function for serializing request query parameters. By default, arrays
   * will be exploded in form style, objects will be exploded in deepObject
   * style, and reserved characters are percent-encoded.
   *
   * {@link https://swagger.io/docs/specification/serialization/#query View examples}
   */
  querySerializer?: QuerySerializer | QuerySerializerOptions;
}

interface RequestOptionsBase extends Omit<Config, 'global'> {
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  url: string;
}

type RequestResult<Data = unknown, Error = unknown> = Promise<{
  error?: Error;
  data?: Data;
  request: Request;
  response: Response;
}>;

type MethodFn = <Data = unknown, Error = unknown>(
  options: RequestOptionsBase,
) => RequestResult<Data, Error>;
type RequestFn = <Data = unknown, Error = unknown>(
  options: RequestOptionsBase & Pick<Required<RequestOptionsBase>, 'method'>,
) => RequestResult<Data, Error>;

interface ClientBase<Request = unknown, Response = unknown, Options = unknown> {
  delete: MethodFn;
  get: MethodFn;
  getConfig: () => Config;
  head: MethodFn;
  interceptors: Middleware<Request, Response, Options>;
  options: MethodFn;
  patch: MethodFn;
  post: MethodFn;
  put: MethodFn;
  request: RequestFn;
}

export type RequestOptions = RequestOptionsBase &
  Config & {
    headers: Headers;
  };

export type Client = ClientBase<Request, Response, RequestOptions>;

type OptionsBase = Omit<RequestOptionsBase, 'url'> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
};

export type Options<T = unknown> = T extends { body: any; headers: any }
  ? OmitKeys<OptionsBase, 'body' | 'headers'> & T
  : T extends { body: any }
    ? OmitKeys<OptionsBase, 'body'> & T
    : T extends { headers: any }
      ? OmitKeys<OptionsBase, 'headers'> & T
      : OptionsBase & T;
