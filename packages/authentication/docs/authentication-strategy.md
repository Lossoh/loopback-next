### Auth strategy interface

```ts
import {Request} from '@loopback/rest';

interface AuthenticationStrategy {
  // The resolver will read the options object from metadata, call `strategy.setOptions`
  options: object;
  authenticate(request: Request): Promise<UserProfile | undefined>;
  setOptions(options: object);
  // This is a private function that extracts credential fields from a request,
  // it is called in function `authenticate`. You could organize the extraction
  // logic in this function or write them in `authenticate` directly without defining
  // this extra utility.
  private extractCredentials?(request: Request): Promise<Credentials>;
}
```
