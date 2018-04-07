
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

export const handleSideEffect = (name, processor) => ({
  [name](sideEffect) {
    return (...args) => async (dispatch, getState, extraArgument) => {
      dispatch({ type: this[processor[0]].toString(), payload: args })
      try {
        const result = await sideEffect(dispatch, getState, extraArgument)(...args)

        dispatch({ type: this[processor[1]].toString(), payload: [result] })
      }
      catch (error) {
        dispatch({ type: this[processor[2]].toString(), payload: [error] })
      }
    }
  },
})

module.exports = {
  createSymbiote,
  handleSideEffect,
}
