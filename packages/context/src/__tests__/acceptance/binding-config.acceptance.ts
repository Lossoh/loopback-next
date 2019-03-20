// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject} from '../..';

interface RestServerConfig {
  host?: string;
  port?: number;
}

class RestServer {
  constructor(@inject.config() public config: RestServerConfig) {}
}

describe('Context bindings - injecting configuration for bound artifacts', () => {
  it('binds configuration independent of binding', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx.configure('servers.rest.server1').to({port: 3000});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');

    expect(server1.config).to.eql({port: 3000});
  });

  it('configures an artifact with a dynamic source', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx
      .configure('servers.rest.server1')
      .toDynamicValue(() => Promise.resolve({port: 3000}));

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');
    expect(server1.config).to.eql({port: 3000});
  });

  it('injects a getter function to access config', async () => {
    interface LoggerConfig {
      level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
    }

    class Logger {
      constructor(
        @inject.configGetter()
        public configGetter: () => Promise<LoggerConfig | undefined>,
      ) {}
    }

    const ctx = new Context();

    // Bind logger configuration
    ctx.configure('loggers.Logger').to({level: 'INFO'});

    // Bind Logger
    ctx.bind('loggers.Logger').toClass(Logger);

    const logger = await ctx.get<Logger>('loggers.Logger');
    let config = await logger.configGetter();
    expect(config).to.eql({level: 'INFO'});

    // Update logger configuration
    ctx.configure('loggers.Logger').to({level: 'DEBUG'});

    config = await logger.configGetter();
    expect(config).to.eql({level: 'DEBUG'});
  });
});
