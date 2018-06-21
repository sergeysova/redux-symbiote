const symbioteSymbols = require('symbiote-symbol')


const getActionCreatorDefault = (type) => (...args) => ({ type, payload: args })

const createOptions = (options) => {
  if (typeof options === 'string') {
    return { namespace: options }
  }
  return options
}

const createSymbiote = (initialState, actionsConfig, namespaceOptions = '') => {
  const handlersList = {}
  const options = createOptions(namespaceOptions)

  const traverseActions = (rootConfig, rootPath = []) => {
    const actionsList = {}

    Object.keys(rootConfig).forEach((key) => {
      const currentPath = rootPath.concat(key)
      const handler = rootConfig[key]
      const type = currentPath.join('/')

      if (typeof handler === 'function') {
        const getActionCreator = handler[symbioteSymbols.getActionCreator]
          || getActionCreatorDefault

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
    options.namespace ? [options.namespace] : undefined
  )

  return {
    actions: actionsList,
    reducer: (previousState = initialState, { type, payload: args = [] }) => {
      const handler = handlersList[type]

      if (handler) {
        return handler(previousState, ...args)
      }

      return options.defaultReducer
        ? options.defaultReducer(previousState)
        : previousState
    },
  }
}

module.exports = {
  createSymbiote,
}
