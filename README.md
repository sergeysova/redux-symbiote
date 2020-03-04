# redux-symbiote [![Build Status](https://travis-ci.org/sergeysova/redux-symbiote.svg?branch=master)](https://travis-ci.org/sergeysova/redux-symbiote) [![Coverage Status](https://coveralls.io/repos/github/sergeysova/redux-symbiote/badge.svg?branch=master)](https://coveralls.io/github/sergeysova/redux-symbiote?branch=master) [![All Contributors](https://img.shields.io/badge/all_contributors-9-orange.svg)](#contributors)

<img src="https://raw.githubusercontent.com/sergeysova/redux-symbiote/master/assets/logo.svg?sanitize=true" width="80" />



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
<table>
  <tr>
    <td align="center"><a href="https://sergeysova.com"><img src="https://avatars0.githubusercontent.com/u/5620073?v=4" width="100px;" alt="Sergey Sova"/><br /><sub><b>Sergey Sova</b></sub></a><br /><a href="https://github.com/sergeysova/redux-symbiote/commits?author=sergeysova" title="Documentation">📖</a> <a href="https://github.com/sergeysova/redux-symbiote/commits?author=sergeysova" title="Code">💻</a> <a href="#example-sergeysova" title="Examples">💡</a> <a href="#ideas-sergeysova" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/sergeysova/redux-symbiote/commits?author=sergeysova" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://t.me/artalar"><img src="https://avatars0.githubusercontent.com/u/27290320?v=4" width="100px;" alt="Arutyunyan Artyom"/><br /><sub><b>Arutyunyan Artyom</b></sub></a><br /><a href="#review-artalar" title="Reviewed Pull Requests">👀</a> <a href="#ideas-artalar" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/sergeysova/redux-symbiote/issues?q=author%3Aartalar" title="Bug reports">🐛</a> <a href="https://github.com/sergeysova/redux-symbiote/commits?author=artalar" title="Code">💻</a></td>
    <td align="center"><a href="https://kamyshev.me"><img src="https://avatars3.githubusercontent.com/u/26767722?v=4" width="100px;" alt="Igor Kamyshev"/><br /><sub><b>Igor Kamyshev</b></sub></a><br /><a href="#platform-igorkamyshev" title="Packaging/porting to new platform">📦</a> <a href="https://github.com/sergeysova/redux-symbiote/commits?author=igorkamyshev" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/ilyaagarkov"><img src="https://avatars2.githubusercontent.com/u/10822601?v=4" width="100px;" alt="Ilya"/><br /><sub><b>Ilya</b></sub></a><br /><a href="https://github.com/sergeysova/redux-symbiote/issues?q=author%3Ailyaagarkov" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/ivanov-v"><img src="https://avatars2.githubusercontent.com/u/13759065?v=4" width="100px;" alt="Ivanov Vadim"/><br /><sub><b>Ivanov Vadim</b></sub></a><br /><a href="https://github.com/sergeysova/redux-symbiote/commits?author=ivanov-v" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/antonkri97"><img src="https://avatars0.githubusercontent.com/u/16399895?v=4" width="100px;" alt="Аnton Krivokhizhin"/><br /><sub><b>Аnton Krivokhizhin</b></sub></a><br /><a href="#platform-antonkri97" title="Packaging/porting to new platform">📦</a> <a href="#infra-antonkri97" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://betula.co"><img src="https://avatars0.githubusercontent.com/u/421161?v=4" width="100px;" alt="Viacheslav"/><br /><sub><b>Viacheslav</b></sub></a><br /><a href="#ideas-betula" title="Ideas, Planning, & Feedback">🤔</a> <a href="#review-betula" title="Reviewed Pull Requests">👀</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://ootm.ru/"><img src="https://avatars1.githubusercontent.com/u/1402016?v=4" width="100px;" alt="Dmitri Razin"/><br /><sub><b>Dmitri Razin</b></sub></a><br /><a href="https://github.com/sergeysova/redux-symbiote/issues?q=author%3ARusTorg" title="Bug reports">🐛</a> <a href="#design-RusTorg" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/Finesse"><img src="https://avatars3.githubusercontent.com/u/9006227?v=4" width="100px;" alt="Surgie Finesse"/><br /><sub><b>Surgie Finesse</b></sub></a><br /><a href="https://github.com/sergeysova/redux-symbiote/commits?author=Finesse" title="Code">💻</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
