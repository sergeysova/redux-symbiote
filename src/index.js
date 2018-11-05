const symbioteSymbols = require('symbiote-symbol')


module.exports = {
  createSymbiote,
}

/**
 * @param {{}} initialState
 * @param {{}} actionsConfig
 * @param {defaultOptions | string} namespaceOptions
 * @returns {{ actions: {}, reducer: Function }}
 */
function createSymbiote(initialState, actionsConfig, namespaceOptions = '') {
  const builder = new SymbioteBuilder({
    state: initialState,
    options: createOptions(namespaceOptions),
  })

  return builder.createSymbioteFor(actionsConfig)
}

/**
 * @param {defaultOptions | string} options
 * @return {defaultOptions}
 */
function createOptions(options) {
  if (typeof options === 'string') {
    return Object.assign({}, defaultOptions, {
      namespace: options,
    })
  }
  return Object.assign({}, defaultOptions, options)
}

const defaultOptions = {
  /** @type {string} */
  namespace: undefined,
  /** @type {Function} */
  defaultReducer: undefined,
  /** @type {string} */
  separator: '/',
}

class SymbioteBuilder {
  constructor({ state, options }) {
    this.initialReducerState = state
    this.options = options
    this.actions = {}
    this.reducers = {}
    this.namespacePath = options.namespace ? [options.namespace] : []
  }

  createSymbioteFor(actions) {
    const actionCreators = this.createActionsForScopeOfHandlers(actions, this.namespacePath)

    return {
      actions: actionCreators,
      reducer: this.createReducer(),
    }
  }

  createActionsForScopeOfHandlers(reducersMap, parentPath) {
    const actionsMap = {}

    Object.keys(reducersMap).forEach((key) => {
      const currentPath = createPathFor(parentPath, key)
      const currentHandlerOrScope = reducersMap[key]
      const currentType = this.createTypeFromPath(currentPath)

      if (isHandler(currentHandlerOrScope)) {
        const currentHandler = currentHandlerOrScope

        actionsMap[key] = makeActionCreatorFor(currentType, currentHandler)
        this.saveHandlerAsReducerFor(currentType, currentHandler)
      }
      else if (isScope(currentHandlerOrScope)) {
        actionsMap[key] = this.createActionsForScopeOfHandlers(currentHandlerOrScope, currentPath)
      }
      else {
        throw new TypeError('createSymbiote supports only function handlers and object scopes in actions config')
      }
    })

    return actionsMap
  }

  createTypeFromPath(path) {
    return path.join(this.options.separator)
  }

  saveHandlerAsReducerFor(type, handler) {
    this.reducers[type] = handler
  }

  createReducer() {
    return (previousState = this.initialReducerState, action) => {
      if (!action) throw new TypeError('Action should be passed')
      const reducer = this.findReducerFor(action.type)

      if (reducer) {
        return reducer(previousState, action)
      }

      return previousState
    }
  }

  findReducerFor(type) {
    const expectedReducer = this.reducers[type]

    if (expectedReducer) {
      return (state, { 'symbiote-payload': payload = [] }) => (
        expectedReducer(state, ...payload)
      )
    }

    return this.options.defaultReducer
  }
}

function createPathFor(path, ...chunks) {
  return path.concat(...chunks)
}

function isHandler(handler) {
  return typeof handler === 'function'
}

function isScope(scope) {
  return !Array.isArray(scope) && scope !== null && typeof scope === 'object'
}

const createDefaultActionCreator = (type) => (...args) => ({
  type,
  payload: args[0],
  'symbiote-payload': args,
})

function makeActionCreatorFor(type, handler) {
  const createActionCreator =
    handler[symbioteSymbols.getActionCreator] || createDefaultActionCreator
  const actionCreator = createActionCreator(type)

  actionCreator.toString = () => type
  return actionCreator
}
