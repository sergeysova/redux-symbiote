import { createSymbiote } from 'redux-symbiote';

// empty
(() => {
	// Works correct with empty types

	const { actions, reducer} = createSymbiote<{}, {}>({}, {});
	actions; // $ExpectType {}
	reducer; // $ExpectType Reducer<{}>
})();

// plain symbiote
interface PlainState {
	count: number;
}

interface PlainActions {
	inc: () => number;
	dec: () => number;
}

(() => {
	// Works correct with plain state and actions

	const { actions, reducer} = createSymbiote<PlainState, PlainActions>(
		{ count: 0 },
		{
			inc: (state: PlainState) => ({ ...state, count: state.count + 1 }),
			dec: (state: PlainState) => ({ ...state, count: state.count + 1 }),
		}
	);

	actions; // $ExpectType PlainActions
	reducer; // $ExpectType Reducer<PlainState>
})();

(() => {
	// Throw error if actions config have a incorrect type

	const symbiotes = {
		inc: (state: PlainState) => ({ ...state, count: 'hello!' }),
		dec: (state: PlainState) => ({ ...state, count: state.count - 1 }),
	};

	createSymbiote<PlainState, PlainActions>({ count: 0 }, symbiotes); // $ExpectError
})();

(() => {
	// Throw error if initial state have a incorrect type

	const symbiotes = {
		inc: (state: PlainState) => ({ ...state, count: state.count + 1 }),
		dec: (state: PlainState) => ({ ...state, count: state.count + 1 }),
	};

	createSymbiote<PlainState, PlainActions>({ count: 'hello!' }, symbiotes); // $ExpectError
})();

// symbiote with arguments
interface ArgumentedActions {
	change: (diff: number) => number;
}

(() => {
	// Works correct with plain state and actions with argument

	const { actions, reducer} = createSymbiote<PlainState, ArgumentedActions>(
		{ count: 0 },
		{
			change: (state: PlainState, diff: number) => ({ ...state, count: state.count + diff }),
		}
	);

	actions; // $ExpectType ArgumentedActions
	reducer; // $ExpectType Reducer<PlainState>
})();

(() => {
	// Throw error if action payload have a incorrect type

	// TODO: Must throw error!

	const symbiote = {
		change: (state: PlainState, diff: string) => ({ ...state, count: state.count + parseInt(diff, 10) }),
	};

	createSymbiote<PlainState, ArgumentedActions>({ count: 0 }, symbiote);
})();

// nested symbiote
interface NestedState {
	counter: {
		count: number;
	};
}

interface NestedActions {
	counter: {
		inc: () => number;
	};
}

(() => {
	// Works correct with nested state and actions

	const { actions, reducer} = createSymbiote<NestedState, NestedActions>(
		{ counter: { count: 0} },
		{ counter: {
			inc: (state: NestedState) => ({...state, counter: {...state.counter, count: state.counter.count + 1}})}
		}
	);

	actions; // $ExpectType NestedActions
	reducer; // $ExpectType Reducer<NestedState>
})();

(() => {
	// Throws error if nested state have an incorrect type

	const symbiote = { counter: {
		inc: (state: NestedState) => ({...state, counter: {...state.counter, count: state.counter.count + 1}})}
	};

	const { actions, reducer} = createSymbiote<NestedState, NestedActions>({ counter: { cnt: 0 } }, symbiote); // $ExpectError

	actions; // $ExpectType NestedActions
	reducer; // $ExpectType Reducer<NestedState>
})();

(() => {
	// Throws error if nested action have an incorrect type

	const symbiote = { counter: {
		inc: (state: NestedState) => ({...state, counter: {...state.counter, count: 'newString'}})}
	};

	const { actions, reducer} = createSymbiote<NestedState, NestedActions>({ counter: { count: 0 } }, symbiote); // $ExpectError

	actions; // $ExpectType NestedActions
	reducer; // $ExpectType Reducer<NestedState>
})();
