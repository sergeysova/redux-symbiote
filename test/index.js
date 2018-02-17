import test from 'ava'
import { createSymbiote } from '../lib/index'


test('createSymbiote return actions and reducer', (t) => {
  const result = createSymbiote({}, {})

  t.deepEqual(result.actions, {}, 'actions is not an object')
  t.is(typeof result.reducer, 'function', 'reducer is not a function')
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
})

test('nested actions returns type and payload', (t) => {
  const { actions } = createSymbiote({}, {
    bar: {
      foo: (arg) => ({ arg }),
    },
  })

  t.deepEqual(actions.bar.foo(1), { type: 'bar/foo', payload: [1] })
})

test('nested actions with state returns type and payload', (t) => {
  const { actions } = createSymbiote({}, {
    foo: {
      bar: (arg) => (state) => ({ arg, state }),
    },
  })

  t.deepEqual(actions.foo.bar(1), { type: 'foo/bar', payload: [1] })
})

test('reducer handle simple action and merges it', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: (value) => ({ value }),
  })

  t.deepEqual(reducer(undefined, actions.foo(1)), { value: 1, data: 'foo' })
})

test('reducer handle nested action and merges it', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    bar: {
      foo: (value) => ({ value }),
    },
  })

  t.deepEqual(reducer(undefined, actions.bar.foo(1)), { value: 1, data: 'foo' })
})

test('reducer handle simple action with state', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: (data) => (state) => ({ value: state.value + 1, data }),
  })

  t.deepEqual(reducer(undefined, actions.foo('bar')), { value: 1, data: 'bar' })
})

test('reducer handle nested action with state', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    bar: {
      foo: (data) => (state) => ({ value: state.value + 1, data }),
    },
  })

  t.deepEqual(reducer(undefined, actions.bar.foo('bar')), { value: 1, data: 'bar' })
})

test('prefix', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    foo: (value) => ({ value }),
    bar: {
      foo: (data) => (state) => ({ value: state.value + 1, data }),
    },
  }, 'baz')

  t.deepEqual(actions.foo(1), { type: 'baz/foo', payload: [1] }, 'simple action type')
  t.deepEqual(actions.bar.foo('bar'), { type: 'baz/bar/foo', payload: ['bar'] }, 'nested action with state type')
  t.deepEqual(reducer(undefined, actions.foo(1)), { value: 1, data: 'foo' }, 'reduce simple action')
  t.deepEqual(reducer(undefined, actions.bar.foo('bar')), { value: 1, data: 'bar' }, 'reduce nested action with state')
})

test('supernested with prefix', (t) => {
  const { actions, reducer } = createSymbiote({ value: 0, data: 'foo' }, {
    a: {
      b: {
        c: {
          d: {
            e: {
              g: (data) => (state) => ({ value: state.value + 1, data }),
            },
          },
        },
      },
    },
  }, 'prefix')

  t.deepEqual(actions.a.b.c.d.e.g('bar'), { type: 'prefix/a/b/c/d/e/g', payload: ['bar'] }, 'nested action with state type')
  t.deepEqual(reducer(undefined, actions.a.b.c.d.e.g('bar')), { value: 1, data: 'bar' }, 'reduce nested action with state')
})
