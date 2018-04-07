const symbioteSecret = {
  actionInside: Symbol('object is contains action function for actions list'),
  action: Symbol('action function for actions list'),
}

const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]

      if (typeof handler === 'function') {
        const type = currentPath.join('/')

        actionsList[key] = handler[symbioteSecret.actionInside]
          ? handler[symbioteSecret.action]
          : (...args) => ({ type, payload: args })
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

const withSideEffect = (handlers) => {
  const [
    beforeHandlerName,
    successHandlerName,
    errorHandlerName,
    ...restHandlers
  ] = Object.keys(handlers)
  const beforeHandler = handlers[beforeHandlerName]
  const initiatorHandler = (...args) => beforeHandler(...args)

  initiatorHandler[symbioteSecret.actionInside] = true
  initiatorHandler[symbioteSecret.action] = function initiatorHandlerBlank(sideEffect, ...args) {
    return async (dispatch, getState, extraArgument) => {
      dispatch({ type: this[beforeHandlerName].toString(), payload: args })
      try {
        const result = await sideEffect(dispatch, getState, extraArgument)(...args)

        dispatch({ type: this[successHandlerName].toString(), payload: [result] })
      }
      catch (error) {
        dispatch({ type: this[errorHandlerName].toString(), payload: [error] })
      }
    }
  }

  return Object.assign({
    [beforeHandlerName]: initiatorHandler,
    [successHandlerName]: handlers[successHandlerName],
    [errorHandlerName]: handlers[errorHandlerName],
  }, restHandlers.reduce(
    (acc, handlerName) => Object.assign(acc, { [handlerName]: restHandlers[handlerName] }),
    {},
  ))
}

module.exports = {
  createSymbiote,
  withSideEffect,
  symbioteSecret,
}
