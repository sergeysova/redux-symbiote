/* eslint-disable no-magic-numbers */
import test from 'ava'
import { createSymbiote, symbioteSecret, getSymbolCreator } from '../src/index'


test('createSymbiote return actions and reducer', (t) => {
  const result = createSymbiote({}, {})

  t.deepEqual(result.actions, {}, 'actions is not an object')
  t.is(typeof result.reducer, 'function', 'reducer is not a function')
})

test('symbioteSecret is map', (t) => {
  t.is(typeof symbioteSecret, 'object')
  t.deepEqual(Object.keys(symbioteSecret), ['getActionCreator'])
})

test('reducer return previous state', (t) => {
  const exampleState = { foo: 1 }
  const { reducer } = createSymbiote({}, {})

  t.is(reducer(exampleState, {}), exampleState)
})

test('reducer return initial state', (t) => {
  const initialState = { foo: 1 }
  const { reducer } = createSymbiote(initialState, {})

  t.is(reducer(undefined, {}), initialState)
})

test('simple actions returns type and payload', (t) => {
  const { actions } = createSymbiote({}, {
    foo: (arg) => ({ arg }),
  })

  t.deepEqual(actions.foo(1), { type: 'foo', payload: [1] })
})

test('actions with state returns type and payload', (t) => {
  const { actions } = createSymbiote({}, {
    bar: (arg) => (state) => ({ arg, state }),
  })

  t.deepEqual(actions.bar(1), { type: 'bar', payload: [1] })
  t.is(actions.bar.toString(), 'bar', '.toString() return correct type')
})

test('nested actions returns type and payload', (t) => {
  const { actions } = createSymbiote({}, {
    bar: {
      foo: (arg) => ({ arg }),
    },
  })

  t.deepEqual(actions.bar.foo(1), { type: 'bar/foo', payload: [1] })
  t.is(actions.bar.foo.toString(), 'bar/foo', '.toString() return correct type')
})

test('nested actions with state returns type and payload', (t) => {
  const { actions } = createSymbiote({}, {
    foo: {
      bar: (arg) => (state) => ({ arg, state }),
    },
  })

  t.deepEqual(actions.foo.bar(1), { type: 'foo/bar', payload: [1] })
  t.is(actions.foo.bar.toString(), 'foo/bar', '.toString() return correct type')
})

test('reducer return action resul', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: () => 100,
  })

  t.deepEqual(reducer(undefined, actions.foo(1)), 100)
})

test('createSymbiote with extended action creator', (t) => {
  const testValue = Math.random()
  const handler1 = () => {}
  const handler2 = () => {}

  handler1[symbioteSecret.getActionCreator] = type => () => testValue
  handler2[symbioteSecret.getActionCreator] = type => () => type

  const { actions, reducer } = createSymbiote({}, { handler1, handler2 }, 'test')

  t.is(actions.handler1(), testValue)
  t.is(actions.handler2(), 'test/handler2')
})

test('action accepts state in first argument', (t) => {
  const initialState = Symbol('initial state')

  const { actions, reducer } = createSymbiote(initialState, {
    foo: (state) => state,
  })

  t.is(reducer(undefined, actions.foo(1)), initialState)
})

test('action accepts arguments in call', (t) => {
  const initialState = Symbol('initial state')
  const a1 = Symbol('a1')
  const a2 = Symbol('a2')
  const a3 = Symbol('a3')
  const a4 = Symbol('a4')
  const a5 = Symbol('a5')
  const a6 = Symbol('a6')

  const { actions, reducer } = createSymbiote(initialState, {
    foo: (state, a, b, c, d, e, f) => [a, b, c, d, e, f],
  })

  t.deepEqual(reducer(undefined, actions.foo(a1, a2, a3, a4, a5, a6)), [a1, a2, a3, a4, a5, a6])
})

test('reducer handle simple action and return result of action', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: (state, value) => ({ ...state, value }),
  })

  t.deepEqual(reducer(undefined, actions.foo(1)), { value: 1, data: 'foo' })
})

test('reducer not merges state under the hood', (t) => {
  const { actions, reducer } = createSymbiote({ a: 1, b: 2, c: 3 }, {
    foo: (state, b) => ({ b }),
  })

  t.deepEqual(reducer(undefined, actions.foo(1)), { b: 1 })
})

test('reducer handle nested action and merges it', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    bar: {
      foo: (state, value) => ({ ...state, value }),
    },
  })

  t.deepEqual(reducer(undefined, actions.bar.foo(1)), { value: 1, data: 'foo' })
})

test('reducer handle simple action with state', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: (state, data) => ({ ...state, value: state.value + 1, data }),
  })

  t.deepEqual(reducer(undefined, actions.foo('bar')), { value: 1, data: 'bar' })
})

test('reducer handle nested action with state', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    bar: {
      foo: (state, data) => ({ ...state, value: state.value + 1, data }),
    },
  })

  t.deepEqual(reducer(undefined, actions.bar.foo('bar')), { value: 1, data: 'bar' })
})

test('prefix', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: (state, value) => ({ ...state, value }),
    bar: {
      foo: (state, data) => ({ ...state, value: state.value + 1, data }),
    },
  }, 'baz')

  t.deepEqual(actions.foo(1), { type: 'baz/foo', payload: [1] }, 'simple action type')
  t.deepEqual(actions.bar.foo('bar'), { type: 'baz/bar/foo', payload: ['bar'] }, 'nested action with state type')
  t.deepEqual(reducer(undefined, actions.foo(1)), { value: 1, data: 'foo' }, 'reduce simple action')
  t.deepEqual(reducer(undefined, actions.bar.foo('bar')), { value: 1, data: 'bar' }, 'reduce nested action with state')
  t.is(actions.foo.toString(), 'baz/foo', 'foo.toString() return correct type')
  t.is(actions.bar.foo.toString(), 'baz/bar/foo', 'bar.foo.toString() return correct type')
})

test('supernested with prefix', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    a: {
      b: {
        c: {
          d: {
            e: {
              g: (state, data) => ({ ...state, value: state.value + 1, data }),
            },
          },
        },
      },
    },
  }, 'prefix')

  t.deepEqual(actions.a.b.c.d.e.g('bar'), { type: 'prefix/a/b/c/d/e/g', payload: ['bar'] }, 'nested action with state type')
  t.deepEqual(reducer(undefined, actions.a.b.c.d.e.g('bar')), { value: 1, data: 'bar' }, 'reduce nested action with state')
  t.is(actions.a.b.c.d.e.g.toString(), 'prefix/a/b/c/d/e/g', '.toString() return correct type')
})

test('getSymbolCreator with difference environment', (t) => {
  t.is(typeof getSymbolCreator()('test'), 'symbol')

  const originalSymbol = Symbol

  global.Symbol = undefined
  t.is(getSymbolCreator()('test'), '@@redux-symbiote/test')
  global.Symbol = originalSymbol
})
