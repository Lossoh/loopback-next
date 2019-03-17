// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingFilter,
  BindingScope,
  Constructor,
  Context,
  ContextView,
  createBindingFromClass,
  inject,
  MetadataInspector,
} from '@loopback/context';
import {CoreBindings, CoreTags} from '@loopback/core';
import {HttpServer, HttpServerOptions} from '@loopback/http-server';
import * as debugFactory from 'debug';
import {Server, ServerOptions, Socket} from 'socket.io';
import {
  getSocketIOMetadata,
  SOCKET_IO_METADATA,
  SOCKET_IO_SUBSCRIBE_METADATA,
} from './decorators/socketio.decorator';
import {SocketIOBindings} from './keys';
import {SocketIOControllerFactory} from './socketio-controller-factory';
import SocketIO = require('socket.io');

const debug = debugFactory('loopback:socketio');

// tslint:disable:no-any
export type SockIOMiddleware = (
  socket: Socket,
  fn: (err?: any) => void,
) => void;

export const socketIOControllers: BindingFilter = binding => {
  if (!binding.tagNames.includes(CoreTags.CONTROLLER)) return false;
  if (binding.tagNames.includes('socketio')) return true;
  if (binding.valueConstructor) {
    const classMeta = MetadataInspector.getClassMetadata(
      SOCKET_IO_METADATA,
      binding.valueConstructor,
    );
    if (classMeta != null) return true;
    const methodMeta = MetadataInspector.getAllMethodMetadata(
      SOCKET_IO_SUBSCRIBE_METADATA,
      binding.valueConstructor,
    );
    if (methodMeta != null) return true;
  }
  return false;
};

export interface SocketIOServerOptions {
  httpServerOptions?: HttpServerOptions;
  socketIOOptions?: ServerOptions;
}

/**
 * A socketio server
 */
export class SocketIOServer extends Context {
  private controllers: ContextView;
  private httpServer: HttpServer;
  private io: Server;

  constructor(
    @inject(SocketIOBindings.CONFIG, {optional: true})
    private options: SocketIOServerOptions = {},
  ) {
    super();
    this.io = SocketIO(options);
    this.controllers = this.createView(socketIOControllers);
  }

  /**
   * Register a sock.io middleware function
   * @param fn
   */
  use(fn: SockIOMiddleware) {
    return this.io.use(fn);
  }

  get url() {
    return this.httpServer && this.httpServer.url;
  }

  /**
   * Register a socketio controller
   * @param controllerClass
   * @param namespace
   */
  route(controllerClass: Constructor<object>, namespace?: string | RegExp) {
    this.controller(controllerClass);
    if (namespace == null) {
      const meta = getSocketIOMetadata(controllerClass);
      namespace = meta && meta.namespace;
    }

    const nsp = namespace ? this.io.of(namespace) : this.io;
    nsp.on('connection', async socket => {
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      // Create a request context
      const reqCtx = new SocketIORequestContext(socket, this);
      // Bind socketio
      reqCtx.bind('socketio.socket').to(socket);
      reqCtx.bind(CoreBindings.CONTROLLER_CLASS).to(controllerClass);
      reqCtx
        .bind(CoreBindings.CONTROLLER_CURRENT)
        .toClass(controllerClass)
        .inScope(BindingScope.SINGLETON);
      // Instantiate the controller instance
      await new SocketIOControllerFactory(reqCtx, controllerClass).create();
    });
    return nsp;
  }

  controller(controllerClass: Constructor<unknown>) {
    const binding = createBindingFromClass(controllerClass, {
      namespace: 'socketio.controllers',
      defaultScope: BindingScope.TRANSIENT,
    }).tag('socketio');
    this.add(binding);
    return binding;
  }

  /**
   * Start the socketio server
   */
  async start() {
    this.httpServer = new HttpServer(() => {}, this.options.httpServerOptions);
    await this.httpServer.start();
    this.io.attach(this.httpServer.server, this.options.socketIOOptions);
  }

  /**
   * Stop the socketio server
   */
  async stop() {
    const closePromise = new Promise<void>((resolve, reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    await closePromise;
    if (this.httpServer) await this.httpServer.stop();
  }
}

export class SocketIORequestContext extends Context {
  constructor(public readonly socket: Socket, parent: Context) {
    super(parent);
  }
}
