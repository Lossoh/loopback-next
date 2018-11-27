// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {LifeCycleObserver} from '@loopback/core';

export class MyLifeCycleObserver implements LifeCycleObserver {
  status = '';

  async start() {
    this.status = 'started';
  }

  stop() {
    this.status = 'stopped';
  }
}
