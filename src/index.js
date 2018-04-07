const fetcherType = '@@redux-symbiote/fetcher'
const fetcherHandlers = '@@redux-symbiote/fetcher-handlers'
const fetchTypes = ['request', 'response', 'error']

const identity = payload => payload

const fetchDefaultHandlers = {
  request: identity,
  response: identity,
  error: identity,
}

const createSymbiote = (initialState, actionsConfig, actionTypePrefix = '') => {
  const handlersList = {}

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]

      if (typeof handler === 'function') {
        if (handler[fetcherType] === true) {
          const { request, response, error } = handler[fetcherHandlers]
          const typeBase = currentPath.concat(type).join('/')
          const types = fetchTypes.reduce(
            (acc, fetchType) => Object.assign(acc, { [fetchType]: `${typeBase}/${fetchType}` }),
            {}
          )

          actionsList[key] = (...args) => async (dispatch, getState, extraArgument) => {
            dispatch(({ type: types.request, payload: args }))
            try {
              const result = await handler(dispatch, getState, extraArgument)(...args)
              dispatch(({ type: types.response, payload: [result] }))
            } catch (error) {
              dispatch(({ type: types.error, payload: [error] }))
            }
          }
          actionsList[key].toString = () => types.request

          handlersList[type.request] = request
          handlersList[type.response] = response
          handlersList[type.error] = error
        } else {
          const type = currentPath.join('/')

          actionsList[key] = (...args) => ({ type, payload: args })
          actionsList[key].toString = () => type

          handlersList[type] = handler
        }
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

const handleFetching = (sideEffect, handlers) => {
  const fetcher = (...args) => sideEffect(...args)
  fetcher[fetcherType] = true
  fetcher[fetcherHandlers] = handlers ? Object.assign(fetchDefaultHandlers, handlers) : fetchDefaultHandlers
  return fetcher
}

module.exports = {
  createSymbiote,
  handleFetching,
}
