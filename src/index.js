const sideEffectType = '@@redux-symbiote/sideEffect'
const sideEffectHandlers = '@@redux-symbiote/sideEffect-handlers'
const sideEffectPostfix = ['before', 'success', 'error']

const identity = (payload) => payload

const sideEffectDefaultHandlers = {
  before: identity,
  success: identity,
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
        const type = currentPath.join('/')

        if (handler[sideEffectType] === true) {
          const { before, success, error: errorHandler } = handler[sideEffectHandlers]
          const types = sideEffectPostfix.reduce(
            (acc, postfix) => Object.assign(acc, { [postfix]: `${type}/${postfix}` }),
            {}
          )

          actionsList[key] = (...args) => async (dispatch, getState, extraArgument) => {
            dispatch(({ type: types.before, payload: args }))
            try {
              const result = await handler(dispatch, getState, extraArgument)(...args)

              dispatch(({ type: types.success, payload: [result] }))
            }
            catch (error) {
              dispatch(({ type: types.error, payload: [error] }))
            }
          }
          actionsList[key].toString = () => types.before

          handlersList[type.before] = before
          handlersList[type.success] = success
          handlersList[type.error] = errorHandler
        }
        else {
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

const handleSideEffect = (sideEffectUser, handlers) => {
  const sideEffect = (...args) => sideEffectUser(...args)

  sideEffect[sideEffectType] = true
  sideEffect[sideEffectHandlers] = handlers
    ? Object.assign({}, sideEffectDefaultHandlers, handlers)
    : sideEffectDefaultHandlers
  return sideEffect
}

module.exports = {
  createSymbiote,
  handleSideEffect,
}
