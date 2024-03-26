# openapi-fetch-angular

This library is an [openapi-fetch](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-fetch) clone that uses [Angular's HTTPClient API](https://angular.io/api/common/http/HttpClient).
_Thanks, [@drwpow](https://github.com/drwpow)!_

> [!CAUTION]
> This library is still in development. Please report any issues you encounter.

> [!CAUTION]
> Currently **only** supports JSON requests and responses.

## Usage

In order to get started, generate a specification file using [openapi-typescript](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-typescript).

```sh
# Local schema...
npx openapi-typescript ./path/to/my/schema.yaml -o ./path/to/my/schem # npm
yarn dlx openapi-typescript ./path/to/my/schema.d.ts -o ./path/to/my/schema.ts # or yarn
pnpm dlx openapi-typescript ./path/to/my/schema.d.ts -o ./path/to/my/schema.ts # or pnpm
# 🚀 ./path/to/my/schema.yaml -> ./path/to/my/schema.d.ts [7ms]

# Remote schema...
npx openapi-typescript https://example.com/schema.yaml -o ./path/to/my/schema # npm
yarn dlx openapi-typescript https://example.com/schema.d.ts -o ./path/to/my/schema.ts # or yarn
pnpm dlx openapi-typescript https://example.com/schema.d.ts -o ./path/to/my/schema.ts # or pnpm
# 🚀 https://example.com/schema.yaml -> ./path/to/my/schema.d.ts [7ms]
```

Then, utilize the generated specification file to make requests. In order to do this, create a service like so:

```ts
@Injectable({
  providedIn: "root",
})
export class TestAPIService extends OpenAPIClientService<paths> {
  constructor(httpClient: HttpClient) {
    super(httpClient, {
      baseUrl: "/api",
      // ... options
    });
  }
}
```

Now, you can use the service to make requests that match the specification:

```ts
constructor(private api: TestAPIService) {}

const { data, error /*, response*/ } = await this.api.get("/path/to/endpoint");
```

For more information, see the [openapi-fetch documentation](https://openapi-ts.pages.dev/openapi-fetch/).

## Credits

Big thanks to [@drwpow](https://github.com/drwpow) for creating the original openapi-fetch and openapi-typescript library!
