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
      start: (prevState) => ({ ...prevState, loading: true }),
      failed: (prevState, error) => ({ ...prevState, loading: false, error }),
      finish: (prevState, accounts) => ({ ...prevState, loading: false, accounts }),
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

If action handler returns `function`, symbiote call it with previous state. On other hand, symbiote merges result of handler call with previous state

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
  increment: (prevState) => ({ ...prevState, value: prevState.value + 1 }),
  decrement: (prevState) => ({ ...prevState, value: prevState.value - 1 }),
  setValue: (prevState, value) => ({ ...prevState, value }),
  setData: (prevState, data) => ({ ...prevState, data }),
  concatData: (prevState, data) => ({ ...prevState, data: data + prevState.data }),
})

dispatch(actions.increment()) // { type: 'increment' }
dispatch(actions.setValue(4)) // { type: 'setValue', payload: [4] }
dispatch(actions.decrement()) // { type: 'decrement' }
dispatch(actions.setData('bar')) // { type: 'setData', payload: ['bar'] }
dispatch(actions.concatData('foo ')) // { type: 'concatData', payload: ['foo '] }

// State here { value: 3, data: 'foo bar' }
```

Nested example

```js
export const { actions, reducer } = createSymbiote({ value: 1, data: 'another' }, {
  value: {
    increment: (prevState) => ({ ...prevState, value: prevState.value + 1 }),
    decrement: (prevState) => ({ ...prevState, value: prevState.value - 1 }),
  },
  data: {
    set: (prevState, data) => ({ ...prevState, data }),
    concat: (prevState, data) => ({ ...prevState, data: data + prevState.data }),
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
      baz: (prevState, arg1, arg2) => ({ ...prevState, data: arg1, atad: arg2 }),
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
