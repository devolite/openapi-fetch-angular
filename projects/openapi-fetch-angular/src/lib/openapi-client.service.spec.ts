import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { OpenAPIClientService } from './openapi-client.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { paths } from './fixtures.spec';

describe('OpenAPIClientService', () => {
  @Injectable()
  class ExampleService extends OpenAPIClientService<paths> {
    constructor(http: HttpClient) {
      super(http, {
        baseUrl: '/',
      });
    }
  }

  let service: ExampleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExampleService],
    });
    service = TestBed.inject(ExampleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('params', () => {
    describe('route', () => {
      it('should correctly type the route params', () => {
        // @ts-expect-error - missing required parameter
        service.getPromise('/blogposts/{post_id}');
        expect(httpMock.expectOne('/blogposts/{post_id}')).toBeDefined();

        service.getPromise('/blogposts/{post_id}', {
          // @ts-expect-error - empty object
          params: { path: {} },
        });
        expect(httpMock.expectOne('/blogposts/{post_id}')).toBeDefined();

        service.getPromise('/blogposts/{post_id}', {
          params: {
            path: {
              // @ts-expect-error - wrong type
              post_id: 123,
            },
          },
        });
        expect(httpMock.expectOne('/blogposts/123')).toBeDefined();

        service.getPromise('/blogposts/{post_id}', {
          params: {
            path: {
              post_id: '123',
            },
          },
        });
        expect(httpMock.match('/blogposts/123')).toBeDefined();
      });
    });

    describe('query', () => {
      it('should correctly type the query params', () => {
        service.getPromise('/query-params', {});
        expect(httpMock.expectOne('/query-params')).toBeDefined();

        service.getPromise('/query-params', {
          params: {
            query: {
              // @ts-expect-error - doesn't exist
              limit: '10',
            },
          },
        });
        expect(httpMock.expectOne('/query-params?limit=10')).toBeDefined();

        service.getPromise('/query-params', {
          params: {
            query: {
              // @ts-expect-error - wrong type
              string: 10,
            },
          },
        });
        expect(httpMock.expectOne('/query-params?string=10')).toBeDefined();

        service.getPromise('/query-params', {
          params: {
            query: {
              string: '10',
            },
          },
        });
        expect(httpMock.expectOne('/query-params?string=10')).toBeDefined();
      });
    });

    describe('headers', () => {
      it('should correctly type the headers', () => {
        service
          // @ts-expect-error - missing required parameter
          .get('/header-params')
          .subscribe(({ response }) => expect(response).toBeDefined());
        let req = httpMock.expectOne('/header-params');
        expect(req).toBeDefined();

        service
          .get('/header-params', {
            // @ts-expect-error - empty object
            params: {},
          })
          .subscribe(({ response }) => expect(response).toBeDefined());
        req = httpMock.expectOne('/header-params');
        expect(req).toBeDefined();

        service
          .get('/header-params', {
            params: {
              header: {
                // @ts-expect-error - wrong type
                'x-required-header': 123,
              },
            },
          })
          .subscribe(({ response }) => expect(response).toBeDefined());
        req = httpMock.expectOne('/header-params');
        expect(req).toBeDefined();

        service
          .get('/header-params', {
            params: {
              header: {
                'x-required-header': '123',
              },
            },
          })
          .subscribe(({ response }) => expect(response).toBeDefined());
        req = httpMock.expectOne('/header-params');
        expect(req).toBeDefined();
      });

      it('should correctly send headers', () => {
        service
          .get('/header-params', {
            params: {
              header: {
                'x-required-header': '123',
              },
            },
          })
          .subscribe(({ response }) =>
            expect(response.headers.get('x-required-header-server')).toEqual(
              '123',
            ),
          );
        const req = httpMock.expectOne('/header-params');

        expect(req.request.headers.get('Content-Type')).toEqual(
          'application/json',
        );
        expect(req.request.headers.get('x-required-header')).toEqual('123');

        req.flush(null, { headers: { 'x-required-header-server': '123' } });
      });
    });

    describe('headers (promise)', () => {
      it('should correctly type the headers', () => {
        // @ts-expect-error - missing required parameter
        service.getPromise('/header-params');
        expect(httpMock.expectOne('/header-params')).toBeDefined();

        service.getPromise('/header-params', {
          // @ts-expect-error - empty object
          params: {},
        });
        expect(httpMock.expectOne('/header-params')).toBeDefined();

        service.getPromise('/header-params', {
          params: {
            header: {
              // @ts-expect-error - wrong type
              'x-required-header': 123,
            },
          },
        });
        expect(httpMock.expectOne('/header-params')).toBeDefined();

        service.getPromise('/header-params', {
          params: {
            header: {
              'x-required-header': '123',
            },
          },
        });
        expect(httpMock.expectOne('/header-params')).toBeDefined();
      });

      it('should correctly send headers', () => {
        service
          .getPromise('/header-params', {
            params: {
              header: {
                'x-required-header': '123',
              },
            },
          })
          .then(({ response }) =>
            expect(response.headers.get('x-required-header-server')).toEqual(
              '123',
            ),
          );
        const req = httpMock.expectOne('/header-params');

        expect(req.request.headers.get('Content-Type')).toEqual(
          'application/json',
        );
        expect(req.request.headers.get('x-required-header')).toEqual('123');
        req.flush(null, { headers: { 'x-required-header-server': '123' } });
      });
    });
  });

  describe('body', () => {
    it('should correctly type the body', () => {
      // @ts-expect-error - missing required parameter
      service.putPromise('/tag/{name}', {
        params: {
          path: {
            name: 'tag1',
          },
        },
      });
      expect(httpMock.expectOne('/tag/tag1')).toBeDefined();

      service.putPromise('/tag/{name}', {
        params: {
          path: { name: 'tag1' },
        },
        body: {}, // optional
      });
      expect(httpMock.expectOne('/tag/tag1')).toBeDefined();

      service.putPromise('/tag/{name}', {
        params: {
          path: { name: 'tag1' },
        },
        body: {
          // @ts-expect-error - wrong type
          description: 123,
        },
      });
      expect(httpMock.expectOne('/tag/tag1')).toBeDefined();

      service.putPromise('/tag/{name}', {
        params: {
          path: { name: 'tag1' },
        },
        body: {
          description: 'some description',
        },
      });
      const req = httpMock.expectOne('/tag/tag1');
      expect(req).toBeDefined();
      expect(req.request.body).toEqual({ description: 'some description' });
    });
  });

  describe('errors', () => {
    it('should handle errors', () => {
      service.get('/anyMethod').subscribe(({ data, error, response }) => {
        expect(data).toBeUndefined();
        expect(error).toEqual({
          code: 403,
          message: 'Forbidden',
        });
        expect(response.status).toBe(403);
      });
      const req = httpMock.expectOne('/anyMethod');
      req.flush(
        { code: 403, message: 'Forbidden' },
        {
          status: 403,
          statusText: 'Forbidden',
        },
      );
    });

    it('should handle errors (promise)', async () => {
      service
        .getPromise('/anyMethod')
        .then(({ data, error, response }) => {
          expect(data).toBeUndefined();
          expect(error).toEqual({
            code: 403,
            message: 'Forbidden',
          });
          expect(response.status).toBe(403);
        })
        .catch((error) => {
          console.log(error);
          fail(error);
        });
      const req = httpMock.expectOne('/anyMethod');
      expect(req.request.method).toBe('GET');
      req.flush(
        { code: 403, message: 'Forbidden' },
        {
          status: 403,
          statusText: 'Forbidden',
        },
      );
    });
  });

  describe('methods', () => {
    describe('get', () => {
      it('should make a GET request', () => {
        service.get('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('GET');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a GET request (promise)', () => {
        service.getPromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('GET');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('put', () => {
      it('should make a PUT request', () => {
        service.put('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('PUT');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a PUT request (promise)', () => {
        service.putPromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('PUT');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('post', () => {
      it('should make a POST request', () => {
        service.post('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('POST');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a POST request (promise)', () => {
        service.postPromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('POST');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('delete', () => {
      it('should make a DELETE request', () => {
        service.delete('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('DELETE');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a DELETE request (promise)', () => {
        service.deletePromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('DELETE');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('options', () => {
      it('should make a OPTIONS request', () => {
        service.options('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('OPTIONS');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a OPTIONS request (promise)', () => {
        service.optionsPromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('OPTIONS');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('head', () => {
      it('should make a HEAD request', () => {
        service.head('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('HEAD');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a HEAD request (promise)', () => {
        service.headPromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('HEAD');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('patch', () => {
      it('should make a PATCH request', () => {
        service.patch('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('PATCH');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a PATCH request (promise)', () => {
        service.patchPromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('PATCH');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });

    describe('trace', () => {
      it('should make a TRACE request', () => {
        service.trace('/anyMethod').subscribe(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('TRACE');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });

      it('should make a TRACE request (promise)', () => {
        service.tracePromise('/anyMethod').then(({ data }) => {
          expect(data).toEqual({
            email: 'Hello, world!',
            created_at: 1,
            updated_at: 1,
          });
        });

        const req = httpMock.expectOne('/anyMethod');
        expect(req.request.method).toBe('TRACE');
        req.flush({
          email: 'Hello, world!',
          created_at: 1,
          updated_at: 1,
        });
      });
    });
  });
});
