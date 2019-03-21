You could find the `AuthenticationStrategy` interface in file
[authentication-strategy.md](./docs/authentication-strategy.md)

```ts
import {Request} from '@loopback/rest';

class JWTAuthenticationStrategy implements AuthenticationStrategy {
  options: object;
  constructor(
    @inject(AUTHENTICATION_BINDINGS.SERVICES.USER) tokenService: TokenService,
    @inject(AUTHENTICATION_BINDINGS.BASIC.OPTIONS) options?: object,
  ) {}

  authenticate(request: Request): Promise<UserProfile | undefined> {
    // extract the username and password from request
    const token = await this.extractCredentials(request);
    // `verifyToken` should decode the payload from the token and convert the token payload to
    // userProfile object.
    return await tokenService.verifyToken(token);
  }

  setOptions(newOptions: object) {
    Object.assign(options, newOptions);
  }

  extractCredentials(request): Promise<string> {
    // code to extract json web token from request header/cookie/query
  }
}
```
