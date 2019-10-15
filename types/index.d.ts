// TypeScript Version: 2.8

export {};

export interface NamespaceOptions<State> {
  namespace?: string;
  defaultReducer?: Reducer<State>;
  separator?: string;
}

// todo: Use just `export type Symbiote<State, Arguments extends any[]> = (state: State, ...payload: Arguments) => State;` when only TypeScript version 3+ is supported
type Symbiote0<State> = (state: State) => State;
type Symbiote1<State, A1> = (state: State, arg1: A1) => State;
type Symbiote2<State, A1, A2> = (state: State, arg1: A1, arg2: A2) => State;
type Symbiote3<State, A1, A2, A3> = (state: State, arg1: A1, arg2: A2, arg3: A3) => State;
type Symbiote4<State, A1, A2, A3, A4> = (state: State, arg1: A1, arg2: A2, arg3: A3, arg4: A4, ...args: any[]) => State;

export type Reducer<State> = (state: State, action: Action<any[]>) => State;

export type Symbiotes<State> = {
  [Key in any]:
    Symbiote0<State> |
    Symbiote1<State, any> |
    Symbiote2<State, any, any> |
    Symbiote3<State, any, any, any> |
    Symbiote4<State, any, any, any, any> |
    Symbiotes<State>;
};

export type ActionsCreators<TSymbiotes extends Symbiotes<any>> = {
  [Key in keyof TSymbiotes]:
    TSymbiotes[Key] extends Symbiote0<any> ? () => Action :
    TSymbiotes[Key] extends Symbiote1<any, infer A1> ? (arg1: A1) => Action<[A1]> :
    TSymbiotes[Key] extends Symbiote2<any, infer A1, infer A2> ? (arg1: A1, arg2: A2) => Action<[A1, A2]> :
    TSymbiotes[Key] extends Symbiote3<any, infer A1, infer A2, infer A3> ? (arg1: A1, arg2: A2, arg3: A3) => Action<[A1, A2, A3]> :
    TSymbiotes[Key] extends Symbiote4<any, infer A1, infer A2, infer A3, infer A4> ? (arg1: A1, arg2: A2, arg3: A3, arg4: A4, ...args: any[]) => Action<[A1, A2, A3, A4] & any[]> :
    TSymbiotes[Key] extends Symbiotes<any> ? ActionsCreators<TSymbiotes[Key]> :
    never
};

// todo: Replace [never] with [] when only TypeScript version 3+ is supported
export interface Action<Payload extends any[] = [never]> {
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
