// TypeScript Version: 2.8

export interface NamespaceOptions<State> {
	namespace?: string;
	defaultReducer?: (prevState: State, action: Action) => State;
	separator?: string;
}

export type Symbiote<State> = ((state: State, ...payload: any[]) => State);

export type Reducer<State> = (state: State, action: Action) => State;

export type ActionsConfig<State, Actions> = {
	[Key in keyof Actions]: Actions[Key] extends Function // tslint:disable-line
		? Symbiote<State>
		: ActionsConfig<State, Actions[Key]>
};

export interface Action<Payload = any> {
	type: string;
	payload?: Payload;
}

export function createSymbiote<State, Actions>(
	initialState: State,
	actionsConfig: ActionsConfig<State, Actions>,
	namespaceOptions?: string | NamespaceOptions<State>,
): {
	actions: Actions,
	reducer: Reducer<State>,
};
