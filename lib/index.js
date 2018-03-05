
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


const LOADING = {
  failed: -1,
  initial: 0,
  loading: 1,
  ready: 2,
}


const handleFetching = (actions, fetcher) => (
  async (dispatch, getState, extra) => {
    let beforeResult

    dispatch(actions.start())

    if (fetcher.before) {
      beforeResult = await fetcher.before(dispatch, getState, extra)
    }

    try {
      await fetcher.run(dispatch, getState, extra, beforeResult)
      dispatch(actions.finish())
    }
    catch (error) {
      if (fetcher.fail) {
        fetcher.fail(error, dispatch, getState, extra)
      }
      dispatch(actions.fail(error))
    }
  }
)

const propFetching = 'symbiote/fetching'
const propError = 'error'

const createFetching = () => ({
  start: (state) => ({ ...state, [propFetching]: LOADING.loading, [propError]: null }),
  finish: (state) => ({ ...state, [propFetching]: LOADING.ready, [propError]: null }),
  fail: (state, error) => ({ ...state, [propFetching]: LOADING.failed, [propError]: error }),
})

const initialFetching = {
  [propFetching]: LOADING.initial,
  [propError]: null,
}

module.exports = {
  createSymbiote,
  handleFetching,
  createFetching,
  initialFetching,
}
