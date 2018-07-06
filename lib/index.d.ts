type NamespaceOptions<S> = {
    namespace?: string
    defaultReducer?: (prevState: S) => S
    separator?: string
}

type Reducer<S> = (state: S, action: Action) => S

type ActionsConfig<S, A> = {
    [P in keyof A]: ActionsConfig<S, A[P]> | ((state: S, ...payload: any[]) => S)
}

export type Action<P = any> = { type: string, payload?: P }

export function createSymbiote<State, Actions>(
    initialState: State,
    actionsConfig: ActionsConfig<State, Actions>,
    namespaceOptions?: string | NamespaceOptions<State>,
): {
    actions: Actions,
    reducer: Reducer<State>,
};

