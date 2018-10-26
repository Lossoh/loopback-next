// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingScope,
  Context,
  createBindingFromClass,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  asLifeCycleObserverBinding,
  CoreBindings,
  CoreTags,
  LifeCycleObserver,
  LifeCycleObserverRegistry,
} from '../..';

describe('LifeCycleRegistry', () => {
  let context: Context;
  let registry: LifeCycleObserverRegistry;
  const events: string[] = [];

  beforeEach(() => events.splice(0, events.length));
  beforeEach(givenContext);
  beforeEach(givenLifeCycleRegistry);

  it('starts all registered observers', async () => {
    givenObserver('1');
    givenObserver('2');
    await registry.start();
    expect(events).to.eql(['1-start', '2-start']);
  });

  it('stops all registered observers in reverse order', async () => {
    givenObserver('1');
    givenObserver('2');
    await registry.stop();
    expect(events).to.eql(['2-stop', '1-stop']);
  });

  it('starts all registered observers by group', async () => {
    givenObserver('1', 'g1');
    givenObserver('2', 'g2');
    givenObserver('3', 'g1');
    registry.setGroupsByOrder(['g1', 'g2']);
    await registry.start();
    expect(events).to.eql(['1-start', '3-start', '2-start']);
  });

  it('stops all registered observers in reverse order by group', async () => {
    givenObserver('1', 'g1');
    givenObserver('2', 'g2');
    givenObserver('3', 'g1');
    registry.setGroupsByOrder(['g1', 'g2']);
    await registry.stop();
    expect(events).to.eql(['2-stop', '3-stop', '1-stop']);
  });

  it('starts observers by alphabetical group names if no group order is configured', async () => {
    givenObserver('1', 'g1');
    givenObserver('2', 'g2');
    givenObserver('3', 'g1');
    await registry.start();
    expect(events).to.eql(['1-start', '3-start', '2-start']);
  });

  function givenContext() {
    context = new Context('app');
  }

  async function givenLifeCycleRegistry() {
    context
      .bind(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY)
      .toClass(LifeCycleObserverRegistry)
      .inScope(BindingScope.SINGLETON);
    registry = await context.get(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY);
  }

  function givenObserver(name: string, group = '') {
    @bind({tags: {[CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: group}})
    class MyObserver implements LifeCycleObserver {
      start() {
        events.push(`${name}-start`);
      }
      stop() {
        events.push(`${name}-stop`);
      }
    }
    const binding = createBindingFromClass(MyObserver, {
      key: `observers.observer-${name}`,
    }).apply(asLifeCycleObserverBinding);
    context.add(binding);

    return MyObserver;
  }
});
