// TypeScript Version: 3.0

export {};

export interface NamespaceOptions<State> {
  namespace?: string;
  defaultReducer?: Reducer<State>;
  separator?: string;
}

export type Symbiote<State, Arguments extends any[]> = (state: State, ...payload: Arguments) => State;

export type Symbiotes<State> = {
  [Key in any]: Symbiote<State, any[]> | Symbiotes<State>;
};

interface BasicAction {
  type: string | number | symbol;
}

export type Reducer<State> = (state: State, action: BasicAction) => State;

export type ActionCreator<TSymbiote> = TSymbiote extends Symbiote<any, infer Arguments>
  ? (...payload: Arguments) => Action<Arguments>
  : never;

export type ActionsCreators<TSymbiotes extends Symbiotes<any>> = {
  [Key in keyof TSymbiotes]:
    TSymbiotes[Key] extends Symbiote<any, any[]> ? ActionCreator<TSymbiotes[Key]> :
    TSymbiotes[Key] extends Symbiotes<any> ? ActionsCreators<TSymbiotes[Key]> :
    never
};

export interface Action<Payload extends any[] = []> {
  type: string;
  payload: Payload[0];
  "symbiote-payload": Payload;
}

export function createSymbiote<State, TSymbiotes extends Symbiotes<State>>(
  initialState: State,
  actionsConfig: TSymbiotes,
  namespaceOptions?: string | NamespaceOptions<State>,
): {
  actions: ActionsCreators<TSymbiotes>
  reducer: Reducer<State>
};
