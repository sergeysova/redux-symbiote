# redux-symbiote [![Build Status](https://travis-ci.org/sergeysova/redux-symbiote.svg?branch=master)](https://travis-ci.org/atomixinteractions/redux-symbiote) [![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/redux-symbiote/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/redux-symbiote?branch=master)
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors)

<img src="https://raw.githubusercontent.com/RusTorg/redux-symbiote/master/assets/logo.svg?sanitize=true" width="80" />



Write your actions and reducers without pain

## Usage

```js
import { createSymbiote } from 'redux-symbiote'


const initialState = {
  error: null,
  accounts: [],
  loading: false,
}

const symbiotes = {
  accounts: {
    loading: {
      start: (state) => ({ ...state, loading: true }),
      failed: (state, error) => ({ ...state, loading: false, error }),
      finish: (state, accounts) => ({ ...state, loading: false, accounts }),
    },
  },
}

export const { actions, reducer } = createSymbiote(initialState, symbiotes)
```

Also you can use CommonJS:

```js
const { createSymbiote } = require('redux-symbiote')

// ...
```

## Demo

[![Edit Redux Symbiote Todos](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3x7n34n336?module=%2Fsrc%2Fstore%2Fsymbiotes%2Ftodos.js)

## API

### Create symbiote

```js
function createSymbiote(
  initialState,
  symbiotes,
  ?namespace = ''
)
```

### Create action handlers + reducer

```js
createSymbiote(initialState, {
  actionType: actionReducer,
  nestedType: {
    actionType: nestedActionReducer,
  }
})
```

Example:

```js
const initialState = { value: 1, data: 'another' }

const symbiotes = {
  increment: (state) => ({ ...state, value: state.value + 1 }),
  decrement: (state) => ({ ...state, value: state.value - 1 }),
  setValue: (state, value) => ({ ...state, value }),
  setData: (state, data) => ({ ...state, data }),
  concatData: (state, data) => ({ ...state, data: data + state.data }),
}

export const { actions, reducer } = createSymbiote(initialState, symbiotes)

dispatch(actions.increment()) // { type: 'increment' }
dispatch(actions.setValue(4)) // { type: 'setValue', payload: [4] }
dispatch(actions.decrement()) // { type: 'decrement' }
dispatch(actions.setData('bar')) // { type: 'setData', payload: ['bar'] }
dispatch(actions.concatData('foo ')) // { type: 'concatData', payload: ['foo '] }

// State here { value: 3, data: 'foo bar' }
```

When you call `actions.setValue` symbiote calls your action handler with previousState and all arguments spreaded after state.

#### Nested example

```js
const initialState = { value: 1, data: 'another' }

const symbiotes = {
  value: {
    increment: (state) => ({ ...state, value: state.value + 1 }),
    decrement: (state) => ({ ...state, value: state.value - 1 }),
  },
  data: {
    set: (state, data) => ({ ...state, data }),
    concat: (state, data) => ({ ...state, data: data + state.data }),
  },
}

export const { actions, reducer } = createSymbiote(initialState, symbiotes)

dispatch(actions.value.increment()) // { type: 'value/increment' }
dispatch(actions.value.decrement()) // { type: 'value/decrement' }
dispatch(actions.data.set('bar')) // { type: 'data/set', payload: ['bar'] }
dispatch(actions.data.concat('foo ')) // { type: 'data/concat', payload: ['foo '] }
```

#### Options

Third parameter in `createSymbiote` is optional `string` or `object`.

If `string` passed, symbiote converts it to `{ namespace: 'string' }`.

Object has optional properties:

- `namespace` is `string` — set prefix for each action type
- `defaultReducer` is `(previousState, action) -> newState` — called instead of return previous state
- `separator` is `string` — change separator of nested action types (default `/`)

#### ActionHandler##toString

You can use action as action type in classic reducer or in [`handleAction(s)`](https://redux-actions.js.org/docs/api/handleAction.html) in [`redux-actions`](https://npmjs.com/redux-actions)

```js
import { handleActions } from 'redux-actions'
import { createSymbiote } from 'redux-symbiote'

const initialState = { /* ... */ }

const symbiotes = {
  foo: {
    bar: {
      baz: (state, arg1, arg2) => ({ ...state, data: arg1, atad: arg2 }),
    },
  },
}

const { actions } = createSymbiote(initialState, symbiotes)

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

Created reducer already handles created actions. You don't need to handle actions from symbiote.

```js
// accounts.js
export const { actions, reducer } = createSymbiote(initialState, symbiotes, options)

// reducer.js
import { reducer as accounts } from '../accounts/symbiote'
// another imports

export const reducer = combineReducers({
  accounts,
  // another reducers
})
```

## Why?

Redux recommends creating constants, action creators and reducers separately.

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
    type: ACCOUNTS_LOADING_FAILED,
    payload: {
      error,
    },
  }
}

export function loadingFinish(accounts) {
  return {
    type: ACCOUNTS_LOADING_FINISH,
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
        error: action.payload.error,
      })

    case ACCOUNTS_LOADING_FINISH:
      return Object.assign({}, state, {
        loading: false,
        accounts: action.payload.accounts,
      })
  }

  return state
}
```

So much boilerplate.

Let's look at [redux-actions](https://npmjs.com/redux-actions).

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

But we have some duplicate in action creators properties and reducer.

Let's rewrite it to redux-symbiote:


```js
import { createSymbiote } from 'redux-symbiote'

const initialState = {
  error: null,
  accounts: [],
  loading: false,
}

const symbiotes = {
  start: (state) => ({ ...state, loading: true }),
  finish: (state, { accounts }) => ({ ...state, loading: false, accounts }),
  failed: (state, { error }) => ({ ...state, loading: false, error }),
}

export const { actions, reducer: accountsReducer } =
  createSymbiote(initialState, symbiotes, 'accounts/loading')
```

That's all. `accounts/loading` is an optional namespace for actions types.

To reduce noise around loading actions try [`symbiote-fetching`](https://npmjs.com/symbiote-fetching).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/5620073?v=4" width="100px;"/><br /><sub><b>Sergey Sova</b></sub>](https://sergeysova.com)<br />[📖](https://github.com/sergeysova/redux-symbiote/commits?author=sergeysova "Documentation") [💻](https://github.com/sergeysova/redux-symbiote/commits?author=sergeysova "Code") [💡](#example-sergeysova "Examples") [🤔](#ideas-sergeysova "Ideas, Planning, & Feedback") [⚠️](https://github.com/sergeysova/redux-symbiote/commits?author=sergeysova "Tests") | [<img src="https://avatars0.githubusercontent.com/u/27290320?v=4" width="100px;"/><br /><sub><b>Arutyunyan Artyom</b></sub>](https://t.me/artalar)<br />[👀](#review-artalar "Reviewed Pull Requests") [🤔](#ideas-artalar "Ideas, Planning, & Feedback") [🐛](https://github.com/sergeysova/redux-symbiote/issues?q=author%3Aartalar "Bug reports") [💻](https://github.com/sergeysova/redux-symbiote/commits?author=artalar "Code") | [<img src="https://avatars3.githubusercontent.com/u/26767722?v=4" width="100px;"/><br /><sub><b>Igor Kamyshev</b></sub>](https://kamyshev.me)<br />[📦](#platform-igorkamyshev "Packaging/porting to new platform") [⚠️](https://github.com/sergeysova/redux-symbiote/commits?author=igorkamyshev "Tests") | [<img src="https://avatars2.githubusercontent.com/u/10822601?v=4" width="100px;"/><br /><sub><b>Ilya</b></sub>](https://github.com/ilyaagarkov)<br />[🐛](https://github.com/sergeysova/redux-symbiote/issues?q=author%3Ailyaagarkov "Bug reports") | [<img src="https://avatars2.githubusercontent.com/u/13759065?v=4" width="100px;"/><br /><sub><b>Ivanov Vadim</b></sub>](https://github.com/ivanov-v)<br />[📖](https://github.com/sergeysova/redux-symbiote/commits?author=ivanov-v "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/16399895?v=4" width="100px;"/><br /><sub><b>Аnton Krivokhizhin</b></sub>](https://github.com/antonkri97)<br />[📦](#platform-antonkri97 "Packaging/porting to new platform") [🚇](#infra-antonkri97 "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars0.githubusercontent.com/u/421161?v=4" width="100px;"/><br /><sub><b>Viacheslav</b></sub>](http://betula.co)<br />[🤔](#ideas-betula "Ideas, Planning, & Feedback") [👀](#review-betula "Reviewed Pull Requests") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
