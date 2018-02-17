
const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const hander = rootConfig[key]

      if (typeof hander === 'function') {
        const type = currentPath.join('/')

        actionsList[key] = (...args) => ({ type, payload: args })

        handlersList[type] = hander
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
    reducer: (previousState = initialState, { type, payload: args }) => {
      const handler = handlersList[type]

      if (handler) {
        const actionResult = handler(...args)

        if (typeof actionResult === 'function') {
          return actionResult(previousState)
        }

        return Object.assign({}, previousState, actionResult)
      }

      return previousState
    },
  }
}

module.exports = {
  createSymbiote,
}
