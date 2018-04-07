
const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]

      if (typeof handler === 'function') {
        const type = currentPath.join('/')

        actionsList[key] = (...args) => ({ type, payload: args })
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
    reducer: (previousState = initialState, { type, payload: args }) => {
      const handler = handlersList[type]

      return handler
        ? handler(previousState, ...args)
        : previousState
    },
  }
}

const handleSideEffect = (
  name,
  [beforeHandlerName, successHandlerName, errorHandlerName]
) => ({
  [name](sideEffect) {
    return (...args) => async (dispatch, getState, extraArgument) => {
      dispatch({ type: this[beforeHandlerName].toString(), payload: args })
      try {
        const result = await sideEffect(dispatch, getState, extraArgument)(...args)

        dispatch({ type: this[successHandlerName].toString(), payload: [result] })
      }
      catch (error) {
        dispatch({ type: this[errorHandlerName].toString(), payload: [error] })
      }
    }
  },
})

module.exports = {
  createSymbiote,
  handleSideEffect,
}
