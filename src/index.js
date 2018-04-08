const createSymbol = (name) => `@@redux-symbiote/${name}`

const symbioteSecret = {
  action: createSymbol('action function for actions list'),
}

const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]
      const type = currentPath.join('/')

      if (typeof handler === 'function') {
        actionsList[key] = (...args) => ({ type, payload: args })
        actionsList[key].toString = () => type

        handlersList[type] = handler
      }
      else if (handler && typeof handler[symbioteSecret.action] === 'function') {
        actionsList[type] = handler[symbioteSecret.action]
        handlersList[type] = handler[symbioteSecret.action]
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
