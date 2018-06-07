# redux-symbiote [![Build Status](https://travis-ci.org/atomixinteractions/redux-symbiote.svg?branch=master)](https://travis-ci.org/atomixinteractions/redux-symbiote) [![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/redux-symbiote/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/redux-symbiote?branch=master)

Write your actions and reducers without pain

## Usage

```js
import { createSymbiote } from 'redux-symbiote'


const initialState = {
  error: null,
  accounts: [],
  loading: false,
}

export const { actions, reducer } = createSymbiote(initialState, {
  accounts: {
    loading: {
      start: (state) => ({ ...state, loading: true }),
      failed: (state, error) => ({ ...state, loading: false, error }),
      finish: (state, accounts) => ({ ...state, loading: false, accounts }),
    },
  },
})
```

## API

### Create symbiot

```js
function createSymbiote(
  initialState,
  actionsConfig,
  ?actionTypePrefix = ''
)
```

### Create action handler

```js
createSymbiote(initialState, {
  actionType: actionHandler,
  nestedType: {
    actionType: nestedActionHandler,
  }
})
```

Example:

```js
export const { actions, reducer } = createSymbiote({ value: 1, data: 'another' }, {
  increment: (state) => ({ ...state, value: state.value + 1 }),
  decrement: (state) => ({ ...state, value: state.value - 1 }),
  setValue: (state, value) => ({ ...state, value }),
  setData: (state, data) => ({ ...state, data }),
  concatData: (state, data) => ({ ...state, data: data + state.data }),
})

dispatch(actions.increment()) // { type: 'increment' }
dispatch(actions.setValue(4)) // { type: 'setValue', payload: [4] }
dispatch(actions.decrement()) // { type: 'decrement' }
dispatch(actions.setData('bar')) // { type: 'setData', payload: ['bar'] }
dispatch(actions.concatData('foo ')) // { type: 'concatData', payload: ['foo '] }

// State here { value: 3, data: 'foo bar' }
```

When you call `actions.setValue` symbiote calls your action handler with previousState and all arguments.

#### Nested example

```js
export const { actions, reducer } = createSymbiote({ value: 1, data: 'another' }, {
  value: {
    increment: (state) => ({ ...state, value: state.value + 1 }),
    decrement: (state) => ({ ...state, value: state.value - 1 }),
  },
  data: {
    set: (state, data) => ({ ...state, data }),
    concat: (state, data) => ({ ...state, data: data + state.data }),
  },
})

dispatch(actions.value.increment()) // { type: 'value/increment' }
dispatch(actions.value.decrement()) // { type: 'value/decrement' }
dispatch(actions.data.set('bar')) // { type: 'data/set', payload: ['bar'] }
dispatch(actions.data.concat('foo ')) // { type: 'data/concat', payload: ['foo '] }
```

#### ActionHandler##toString

You can use action as action type in classic reducer or in [`handleAction(s)`](https://redux-actions.js.org/docs/api/handleAction.html) in [`redux-actions`](https://npmjs.com/redux-actions)

```js
import { handleActions } from 'redux-actions'
import { createSymbiote } from 'redux-symbiote'

const { actions } = createSymbiote(initialState, {
  foo: {
    bar: {
      baz: (state, arg1, arg2) => ({ ...state, data: arg1, atad: arg2 }),
    },
  },
})

const reducer = handleActions({
  [actions.foo.bar.baz]: (state, { payload: [arg1, arg2] }) => ({
    ...state,
    data: arg1,
    atad: arg2,
  }),
}, initialState)
```

### How to use reducer

`createSymbiote` returns object with `actions` and `reducer`.

Created reducer already handle created actions. You don't need handle actions from symbiote.

```js
// accounts.js
export const { actions, reducer } = createSymbiote(initialState, {
  // actions map
})

// reducer.js
import { reducer as accounts } from '../accounts/symbiote'
// another imports

export const reducer = combineReducers({
  accounts,
  // another reducers
})
```

## Why?

Redux recommends create constants, action creators and reducers separately.

https://redux.js.org/basics/

```js
const ACCOUNTS_LOADING_START = 'ACCOUNTS_LOADING_START'
const ACCOUNTS_LOADING_FAILED = 'ACCOUNTS_LOADING_FAILED'
const ACCOUNTS_LOADING_FINISH = 'ACCOUNTS_LOADING_FINISH'


export function loadingStart() {
  return {
    type: ACCOUNTS_LOADING_START,
  }
}

export function loadingFailed(error) {
  return {
    type: ACCOUNTS_LOADING_START,
    error,
  }
}

export function loadingFinish(accounts) {
  return {
    type: ACCOUNTS_LOADING_START,
    payload: {
      accounts,
    },
  }
}

const initialState = {
  error: null,
  accounts: [],
  loading: false,
}

export function accountsReducer(state = initialState, action) {
  switch (action.type) {
    case ACCOUNTS_LOADING_START:
      return Object.assign({}, state, {
        loading: true,
      })

    case ACCOUNTS_LOADING_FAILED:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
      })

    case ACCOUNTS_LOADING_FINISH:
      return Object.assign({}, state, {
        loading: false,
        accounts: action.accounts,
      })
  }

  return state
}
```

So much boilerplate.

Let's see at [redux-actions](https://npmjs.com/redux-actions).

```js
import { createActions, handleActions, combineActions } from 'redux-actions'


export const actions = createActions({
  accounts: {
    loading: {
      start: () => ({ loading: true }),
      failed: (error) => ({ loading: false, error }),
      finish: (accounts) => ({ loading: false, accounts }),
    },
  },
}).accounts

const initialState = {
  error: null,
  accounts: [],
  loading: false,
}

export const accountsReducer = handleActions({
  [combineActions(actions.loading.start, actions.loading.failed, actions.loading.finish)]:
    (state, { payload: { loading } }) => ({ ...state, loading }),

  [actions.loading.failed]: (state, { payload: { error } }) => ({ ...state, error }),

  [actions.loading.finish]: (state, { payload: { accounts } }) => ({ ...state, accounts }),
}, initialState)
```
## Side effects

```js
import { createSymbiote, withSideEffect } from 'redux-symbiote'


const initialState = {
  data: {},
  loading: false,
  error: null,
}

export const { actions, reducer } = createSymbiote(initialState, {
  classicSymbiotAction: (state, someData) => ({ ...state, ...someData}),
  loadData: withSideEffect({
    // first action in this collection takes side effect function and it arguments
    // dispatch action and handle it by code below
    // then call side effect function
    request: (state, options) => ({ ...state, loading: true }),
    // second handle in this collection will trigger by action when side effect end
    response: (state, data) => ({ ...state, loading: false, data }),
    // third handle in this collection will trigger by action when side effect throw error
    error: (state, error) => ({ ...state, loading: false, error }),
  }),
})

// usage
const sideEffect = (args) => async (dispatch, getState, extraArgument) => await api.method()
dispatch(actions.loadData.request(sideEffect, args))
```