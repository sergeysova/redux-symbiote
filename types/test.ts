import { Action, createSymbiote, Reducer } from "redux-symbiote";

// empty
{
  // Works correct with empty types

  const { actions, reducer } = createSymbiote({}, {});

  // dtslint doesn't support duck typing so the following line emits an error
  // actions; // $ExpectType {}
  actions as {};
  reducer as Reducer<{}>;
}

// plain symbiote
interface PlainState {
  count: number;
}

interface PlainActionCreators {
  inc: () => Action;
  dec: () => Action;
}

{
  // Works correct with plain state and actions

  const initialState = { count: 0 };
  const { actions, reducer } = createSymbiote(
    initialState,
    {
      inc: (state: PlainState) => ({ ...state, count: state.count + 1 }),
      dec: (state: PlainState) => ({ ...state, count: state.count + 1 }),
    },
  );

  actions as PlainActionCreators;
  reducer as Reducer<PlainState>;

  actions.inc();
  reducer(initialState, actions.dec());
  reducer(initialState, { type: 'other' });
}
{
  // Throw error if the initial state type doesn't match the symbiotes state type

  const symbiotes = {
    inc: (state: PlainState) => ({ ...state, count: state.count + 1 }),
    dec: (state: PlainState) => ({ ...state, count: state.count + 1 }),
  };

  createSymbiote({ count: "hello!" }, symbiotes); // $ExpectError
}
{
  // Throw error if a symbiote return state type doesn't match the initial state type

  const symbiotes = {
    inc: (state: PlainState) => ({ ...state, count: 'inc' }),
    dec: (state: PlainState) => ({ ...state, count: 'dec' }),
  };

  createSymbiote({ count: 0 }, symbiotes); // $ExpectError
}

// symbiotes with arguments
interface ArgumentedActionCreators {
  oneArg: (one: number) => Action<[number]>;
  oneOptionalArg: (one?: number) => Action<[number | undefined]>;
  manyArgs: (one: number, two: boolean, three: string) => Action<[number, boolean, string]>;
}

const argumentedSymbiotes = {
  oneArg: (state: PlainState, one: number) => state,
  oneOptionalArg: (state: PlainState, one?: number) => state,
  manyArgs: (state: PlainState, one: number, two: boolean, three: string) => state,
};

{
  // Works correct with plain state and actions with argument

  const { actions, reducer } = createSymbiote(
    { count: 0 },
    argumentedSymbiotes,
  );

  actions as ArgumentedActionCreators;
  reducer as Reducer<PlainState>;

  actions.oneArg(1);
  actions.oneOptionalArg();
  actions.oneOptionalArg(1);
  actions.manyArgs(1, true, 'str');
}
{
  // Throw error if an action payload has an incorrect type

  const { actions } = createSymbiote({ count: 0 }, argumentedSymbiotes);

  actions.oneArg(); // $ExpectError
  actions.oneArg('wrong'); // $ExpectError
  actions.oneArg(1, 'excess'); // $ExpectError
  actions.manyArgs(1, true); // $ExpectError
  actions.manyArgs('wrong', 'wrong', true); // $ExpectError
  actions.manyArgs(1, true, 'str', 'excess'); // $ExpectError
}

// nested symbiote
interface NestedState {
  counter: {
    count: number
  };
}

interface NestedActionCreators {
  counter: {
    inc: (amount: number) => Action<[number]>
  };
}

{
  // Works correct with nested state and actions

  const { actions, reducer } = createSymbiote(
    { counter: { count: 0 } },
    {
      counter: {
        inc: (state: NestedState, amount: number) => ({
          ...state,
          counter: { ...state.counter, count: state.counter.count + amount },
        }),
      },
    },
  );

  actions as NestedActionCreators;
  reducer as Reducer<NestedState>;

  actions.counter.inc(1);
}
{
  // Throws error if nested state have an incorrect type

  const symbiote = {
    counter: {
      inc: (state: NestedState) => ({
        ...state,
        counter: { ...state.counter, count: state.counter.count + 1 },
      }),
    },
  };

  const { actions, reducer } = createSymbiote({ counter: { cnt: 0 } }, symbiote); // $ExpectError

  actions as NestedActionCreators;
  reducer as Reducer<NestedState>;
}
{
  // Throws error if nested action have an incorrect type

  const symbiote = {
    counter: {
      inc: (state: NestedState) => ({
        ...state,
        counter: { ...state.counter, count: "newString" },
      }),
    },
  };

  const { actions, reducer } = createSymbiote({ counter: { count: 0 } }, symbiote); // $ExpectError

  actions as NestedActionCreators;
  reducer as Reducer<NestedState>;
}
