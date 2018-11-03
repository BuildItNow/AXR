import { createContext } from './AXR';

export interface ATRReduxActionData {
    type: string;
}

export interface ATRActionData<P> extends ATRReduxActionData {
    payload: P;
}

export interface ATRAsyncActionPayload<A, P> {
    params: A;
    result: P;
}

export interface ATRAsyncActionData<A, P> extends ATRActionData<ATRAsyncActionPayload<A, P>> {
}

export interface ATRAction<P> {
    (payload: P): Promise<P>;
    type: string;
    match(type: string): boolean;
}

export interface ATREmptyAction extends ATRAction<void> {
    (): Promise<void>;
}

export interface ATRAsyncAction<A, P> {
    (params: A): Promise<P>;
    type: string;
    match(type: string): boolean;
}

export interface ATREmptyAsyncAction<P> extends ATRAsyncAction<void, P> {
    (): Promise<P>;
}

export interface ATRAsyncThunk<A, P> {
    (params: A, getter: () => any): Promise<P>;
}

export interface ATRActionCreator {
    (type: string): ATREmptyAction;
    <P>(type: string): ATRAction<P>;
    async<P>(type: string, thunk: ATRAsyncThunk<void, P>): ATREmptyAsyncAction<P>;
    async<A, P>(type: string, thunk: ATRAsyncThunk<A, P>): ATRAsyncAction<A, P>;
}

export interface ATRReducer<S, P> {
    (state: S, payload: P, actionData: ATRActionData<P>): S;
}

export interface ATRReducerCreator {
    <S>(initState: S, action: ATREmptyAction, reducer?: ATRReducer<S, void>)
        : (state: S, actionData: ATRReduxActionData) => S;
    <S>(initState: S, action: ATREmptyAsyncAction<S>): (state: S, actionData: ATRReduxActionData) => S;
    <S>(initState: S, action: ATRAction<S>): (state: S, actionData: ATRReduxActionData) => S;
    <S, A>(initState: S, action: ATRAsyncAction<A, S>): (state: S, actionData: ATRReduxActionData) => S;

    <S, P>(initState: S, action: ATREmptyAsyncAction<P>, reducer: ATRReducer<S, ATRAsyncActionPayload<void, P>>)
        : (state: S, actionData: ATRReduxActionData) => S;
    <S, P>(initState: S, action: ATRAction<P>, reducer: ATRReducer<S, P>)
        : (state: S, actionData: ATRReduxActionData) => S;
    <S, P, A>(initState: S, action: ATRAsyncAction<A, P>, reducer: ATRReducer<S, ATRAsyncActionPayload<A, P>>)
        : (state: S, actionData: ATRReduxActionData) => S;
}

interface ATRCaseReducerCreator<S> {
    (state: S, actionData: ATRReduxActionData): S;
    
    case(action: ATREmptyAction, reducer?: ATRReducer<S, void>): ATRCaseReducerCreator<S>;
    case(action: ATREmptyAsyncAction<S>): ATRCaseReducerCreator<S>;
    case(action: ATRAction<S>): ATRCaseReducerCreator<S>;
    case<A>(action: ATRAsyncAction<A, S>): ATRCaseReducerCreator<S>;

    case<P>(action: ATREmptyAsyncAction<P>, reducer: ATRReducer<S, ATRAsyncActionPayload<void, P>>)
        : ATRCaseReducerCreator<S>;
    case<P>(action: ATRAction<P>, reducer: ATRReducer<S, P>): ATRCaseReducerCreator<S>;
    case<P, A>(action: ATRAsyncAction<A, P>, reducer: ATRReducer<S, ATRAsyncActionPayload<A, P>>)
        : ATRCaseReducerCreator<S>;

    property<PS>(name: string, reducer: (state: PS, actionData: ATRReduxActionData) => PS)
        : ATRCaseReducerCreator<S>;
}

export interface ATRReducersCreator {
    <S>(initState: S): ATRCaseReducerCreator<S>;
}

export const createATRContext = () => {
    // tslint:disable:no-shadowed-variable
    const { axrGetOptions, axrSetOptions, axr, axrCombine } = createContext();

    const stateGetter = () => {
        return axrGetOptions().getState();
    };

    const actionDispatch = (actionData) => {
        return axrGetOptions().dispatch(actionData);
    };

    const actionCreatorFactory = (prefix: string = ''): ATRActionCreator => {
        if (prefix) {
            prefix += '_';
        }

        const actions: { [key: string]: boolean } = {};

        const asyncCreator = (type: string, thunk) => {
            type = prefix + type;

            if (actions[type]) {
                throw new Error('Action [' + type + '] duplicated!');
            }

            actions[type] = true;

            const action: any = (params) => {
                let p = thunk.call(undefined, params, stateGetter);
                if (p) {
                    p = p.then((payload: any) => {
                        actionDispatch({
                            type,
                            payload: {
                                params,
                                result: payload,
                            },
                            __async: true,
                        });

                        return payload;
                    });
                } else {
                    p = Promise.reject();
                }
                return p;
            };
            action.type = type;
            action.match = function(t: string) {
                return this.type === t;
            };

            return action;
        };

        const creator: any = (type: string) => {
            type = prefix + type;

            if (actions[type]) {
                throw new Error('Action [' + type + '] duplicated!');
            }

            actions[type] = true;

            const action: any = (payload) => {
                actionDispatch({
                    type,
                    payload,
                });

                return Promise.resolve(payload);
            };
            action.type = type;
            action.match = function(t: string) {
                return this.type === t;
            };

            return action;
        };

        creator.async = asyncCreator;

        return creator;
    };

    const actionCreator: ATRActionCreator = actionCreatorFactory();

    const reducerCreatorImpl = (initState, action, reducer) => {
        return (state, actionData) => {
            if (state === undefined) {
                return initState;
            }

            if (!action.match(actionData.type)) {
                return state;
            }

            if (!reducer) {
                if (actionData.__async) {
                    return actionData.payload.result;
                }
                return actionData.payload;
            }

            return reducer(state, actionData.payload, actionData);
        };
    };

    const reducersCreatorImpl = (initState) => {
        const reducers = {};
        const propertyReducers = {};
        const properties: string[] = [];

        const initPartialState = (state, actionData) => {
            if (properties.length > 0) {
                properties.forEach((key) => {
                    state[key] = propertyReducers[key](undefined, actionData);
                });
            }
        };

        const resolvePartialState = (state, actionData) => {
            if (properties.length === 0) {
                return state;
            }

            let newState;
            properties.forEach((key) => {
                const oState = state[key];
                const nState = propertyReducers[key](oState, actionData);
                if (oState !== nState) {
                    if (!newState) {
                        newState = { ...state };
                    }

                    newState[key] = nState;
                }
            });

            return newState === undefined ? state : newState;
        };

        const rootReducer: any = (state, actionData) => {
            if (state === undefined) {
                initPartialState(initState, actionData);
                return initState;
            }

            const reducer = reducers[actionData.type];
            if (reducer === 0) {
                if (actionData.__async) {
                    state = actionData.payload.result;
                } else {
                    state = actionData.payload;
                }
            } else if (reducer) {
                state = reducer(state, actionData.payload, actionData);
            } else {
                state = resolvePartialState(state, actionData);
            }

            return state;
        };

        rootReducer.case = (action, reducer) => {
            reducer = reducer || 0;
            reducers[action.type] = reducer;

            return rootReducer;
        };

        rootReducer.property = (name, reducer) => {
            if (!reducer) {
                return;
            }

            if (propertyReducers[name]) {
                throw new Error('Property reducer [' + name + '] duplicated!');
            }

            propertyReducers[name] = reducer;
            properties.push(name);

            return rootReducer;
        };

        return rootReducer;
    };

    const reducerCreator: ATRReducerCreator = reducerCreatorImpl as any;
    const reducersCreator: ATRReducersCreator = reducersCreatorImpl as any;

    return {
        axr,
        axrCombine,
        axrSetOptions,
        axrGetOptions,
        actionCreatorFactory,
        actionCreator,
        reducerCreator,
        reducersCreator,
    };
};

// Export the default context
export const {
    axr,
    axrCombine,
    axrSetOptions,
    axrGetOptions,
    actionCreatorFactory,
    actionCreator,
    reducerCreator,
    reducersCreator,
} = createATRContext();
