## Endpoint definitions

The following decorated controller functions demos the endpoints described at
the beginning of markdown file
[authentication-system](./authentication-system.md).

Please note how they are decorated with `@authenticate()`, the syntax is:
`@authenticate(<strategy_name>, {action: <action_name>, session: <enabled_or_not>})`

- /login

```ts
class LoginController {
  @post('/login', APISpec)
  login() {
    // static route
  }
}
```

- /loginWithLocal

```ts

const RESPONSE_SPEC_FOR_JWT_LOGIN = {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
};

class LoginController{
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER) userProfile: UserProfile,
    @inject(AuthenticationBindings.SERVICES.JWT_TOKEN) JWTtokenService: TokenService,
  ) {}

  // Describe the response using OpenAPI spec
  @post('/loginOAI/local', RESPONSE_SPEC_FOR_JWT_LOGIN)
  @authenticate('basicAuth')
  localLoginReturningJWTToken() {
    await token = JWTtokenService.generateToken(this.userProfile);
    // Action `send` will serialize token into response according to the OpenAPI spec.
    return token;
  }

  // OR
  // Serialize the token into response in the controller directly without describing it
  // with OpenAPI spec
  @post('/loginWithoutOAI/local')
  @authenticate('basicAuth')
  localLoginReturningJWTToken() {
    await token = JWTtokenService.generateToken(this.userProfile);
    // It's on users to serialize the token into the response.
    await writeTokenToResponse();
  }
}
```

```ts
class UserOrdersController {
  @get('Users/me/orders', ...APISpec)
  @authenticate('jwt')
  getOrders() {
    // The `userProfile` is set in the authentication action
    // and get injected in the controller constructor
    const id = this.userProfile.id;
    await this.userRepo(id).orders();
  }
}
```

Other auth strategies like oauth2 will be determined in another story.

- /loginWithFB

```ts
class UserController {
  @post('/loginWithFB', APISpec)
  @authenticate('oath2.fb', {session: false})
  loginWithFB() {}
}
```

- /loginWithGoogle

```ts
class UserController {
  @post('/loginWithGoogle', APISpec)
  @authenticate('oath2.google', {session: true})
  loginWithGoogle() {}
}
```
