let globalScope

try {
  globalScope = global
}
catch (error) {
  globalScope = window
}

const createSymbol = globalScope.Symbol || ((name) => `@@redux-symbiote/${name}`)

const symbioteSecret = {
  getActionCreator: createSymbol('action function for actions list'),
}

const getActionCreatorDefault = (type) => (...args) => ({ type, payload: args })

const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]
      const type = currentPath.join('/')

      if (typeof handler === 'function') {
        const getActionCreator = handler[symbioteSecret.getActionCreator] || getActionCreatorDefault

        actionsList[key] = getActionCreator(type)
        actionsList[key].toString = () => type

        handlersList[type] = handler
      }
      else {
        actionsList[key] = traverseActions(rootConfig[key], currentPath)
      }
    })

    return actionsList
  }

  const actionsList = traverseActions(
    actionsConfig,
    actionTypePrefix ? [actionTypePrefix] : undefined
  )

  return {
    actions: actionsList,
    reducer: (previousState = initialState, { type, payload: args = [] }) => {
      const handler = handlersList[type]

      return handler
        ? handler(previousState, ...args)
        : previousState
    },
  }
}

module.exports = {
  createSymbiote,
  symbioteSecret,
}
