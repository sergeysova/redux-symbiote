const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => (
    Object.keys(rootConfig).reduce((acc, key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]

      if (typeof handler === 'function') {
        const type = currentPath.join('/')

        acc[key] = (...args) => ({ type, payload: args })
        acc[key].toString = () => type

        handlersList[type] = handler
      }
      else {
        acc[key] = traverseActions(rootConfig[key], currentPath)
      }
      return acc
    }, {})
  )

  const actionsList = traverseActions(
    actionsConfig,
    actionTypePrefix ? [actionTypePrefix] : undefined
  )

  return {
    actions: actionsList,
    reducer: (previousState = initialState, { type, payload: args }) => {
      const handler = handlersList[type]

      if (handler) {
        const actionResult = handler(...args)

        return typeof actionResult === 'function'
          ? actionResult(previousState)
          : Object.assign({}, previousState, actionResult)
      }
      return previousState
    },
  }
}

module.exports = {
  createSymbiote,
}
