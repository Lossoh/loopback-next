You could find the `AuthenticationStrategy` interface in file
[authentication-strategy.md](./docs/authentication-strategy.md)

```ts
import {Request} from '@loopback/rest';

class BasicAuthenticationStrategy implements AuthenticationStrategy {
  options: object;
  constructor(
    @inject(AUTHENTICATION_BINDINGS.SERVICES.USER) userService: UserService,
    @inject(AUTHENTICATION_BINDINGS.BASIC.OPTIONS) options?: object,
  ) {}

  authenticate(request: Request): Promise<UserProfile | undefined> {
    // extract the username and password from request
    const credentials = await this.extractCredentials(request);
    // `verifyCredentials` throws error accordingly: user doesn't exist OR invalid credentials
    const user = await userService.verifyCredentials(credentials);
    return await userService.convertToUserProfile(user);
  }

  setOptions(newOptions: object) {
    Object.assign(options, newOptions);
  }

  extractCredentials(request): Promise<Credentials> {
    // code to extract username and password from request header
  }
}
```
