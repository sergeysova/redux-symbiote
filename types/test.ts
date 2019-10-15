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

  const { actions, reducer } = createSymbiote(
    { count: 0 },
    {
      inc: (state: PlainState) => ({ ...state, count: state.count + 1 }),
      dec: (state: PlainState) => ({ ...state, count: state.count + 1 }),
    },
  );

  actions as PlainActionCreators;
  reducer as Reducer<PlainState>;

  actions.inc();
  actions.dec();
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
  twoArgs: (one: string, two: number) => Action<[string, number]>;
  threeArgs: (one: boolean, two: number, three: string) => Action<[boolean, number, string]>;
  manyArgs: (one: '1', two: '2', three: '3', four: '4', five: '5', six: '6') => Action<['1', '2', '3', '4'] & any[]>;
}

const argumentedSymbiotes = {
  oneArg: (state: PlainState, one: number) => state,
  twoArgs: (state: PlainState, one: string, two: number) => state,
  threeArgs: (state: PlainState, one: boolean, two: number, three: string) => state,
  manyArgs: (state: PlainState, one: '1', two: '2', three: '3', four: '4', five: '5', six: '6') => state,
};

{
  // Works correct with plain state and actions with argument

  const { actions, reducer } = createSymbiote(
    { count: 0 },
    argumentedSymbiotes,
  );

  actions as ArgumentedActionCreators;
  reducer as Reducer<PlainState>;

  actions.manyArgs('1', '2', '3', '4', '5', '6');
}
{
  // Throw error if an action payload has an incorrect type

  const { actions } = createSymbiote({ count: 0 }, argumentedSymbiotes);

  actions.oneArg(); // $ExpectError
  actions.oneArg('wrong'); // $ExpectError
  actions.oneArg(1, 'excess'); // $ExpectError
  actions.twoArgs('too few'); // $ExpectError
  actions.twoArgs(1, 'wrong'); // $ExpectError
  actions.twoArgs('right', 1, 'excess'); // $ExpectError
  actions.threeArgs(true, 1); // $ExpectError
  actions.threeArgs('wrong', 'wrong', true); // $ExpectError
  actions.threeArgs(true, 1, 'right', 'excess'); // $ExpectError
  actions.manyArgs('1', '2', '3'); // $ExpectError
  actions.manyArgs('wrong', 1, 1, 1, 1, 1); // $ExpectError
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
