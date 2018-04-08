const symbioteSecret = {
  getActionCreator: Symbol('function in handler that receive type and return action creator'),
}

const getActionCreatorDefault = (type) => (...args) => ({ type, payload: args })

const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]

      if (typeof handler === 'function') {
        const type = currentPath.join('/')
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
  ] = Object.keys(handlers)
  const beforeHandler = (...args) => handlers[beforeHandlerName](...args)
  const successHandler = (...args) => handlers[successHandlerName](...args)
  const errorHandler = (...args) => handlers[errorHandlerName](...args)

  let successHandlerType = ''
  let errorHandlerType = ''

  beforeHandler[symbioteSecret.getActionCreator] = (beforeHandlerType) =>
    (sideEffect, ...args) => async (dispatch, getState, extraArgument) => {
      dispatch({ type: beforeHandlerType, payload: args })
      try {
        const result = await sideEffect(...args)(dispatch, getState, extraArgument)

        dispatch({ type: successHandlerType, payload: [result] })
      }
      catch (error) {
        dispatch({ type: errorHandlerType, payload: [error] })
      }
    }

  successHandler[symbioteSecret.getActionCreator] = (type) => {
    successHandlerType = type
    return getActionCreatorDefault(type)
  }

  errorHandler[symbioteSecret.getActionCreator] = (type) => {
    errorHandlerType = type
    return getActionCreatorDefault(type)
  }

  return {
    [beforeHandlerName]: beforeHandler,
    [successHandlerName]: successHandler,
    [errorHandlerName]: errorHandler,
  }
}

module.exports = {
  createSymbiote,
  symbioteSecret,
  withSideEffect,
}
