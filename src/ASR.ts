import { takeLatest, takeEvery } from 'redux-saga/effects';
import { axrGetOptions } from './AXR';
export { axrSetOptions, axr, axrCombine } from './AXR'; 

const stateGetter = () => {
    return axrGetOptions().getState();
};

const actionDispatch = (actionData) => {
    return axrGetOptions().dispatch(actionData);
};

export interface ASRReduxActionData {
    type: string;
}

export interface ASRActionData<P> extends ASRReduxActionData {
    payload: P;
}

export interface ASRAsyncActionPayload<A, P> {
    params: A;
    result: P;
}

export interface ASRAsyncActionFailedPayload<A, P> {
    params: A;
    result?: P;
    error?: any;
}

export interface ATRAsyncActionData<A, P> extends ASRActionData<ASRAsyncActionPayload<A, P>> {
}

export interface ASRAction<P> {
    (payload: P): ASRActionData<P>;
    type: string;
    match(type: string): boolean;
    dispatch(payload: P): any;
}

export interface ASREmptyAction extends ASRAction<void> {
    (): ASRReduxActionData;
    dispatch(): any;
}

export interface ASRAsyncAction<A, P> {
    type: string;
    started: ASRAction<A>;
    done: ASRAction<ASRAsyncActionPayload<A, P>>;
    failed: ASRAction<ASRAsyncActionFailedPayload<A, P>>;
}

export interface ASREmptyAsyncAction<P> {
    type: string;
    started: ASREmptyAction;
    done: ASRAction<ASRAsyncActionPayload<void, P>>;
    failed: ASRAction<ASRAsyncActionFailedPayload<void, P>>;
}

export interface ASRActionCreator {
    (type: string): ASREmptyAction;
    <P>(type: string): ASRAction<P>;
    async<P>(type: string): ASREmptyAsyncAction<P>;
    async<A, P>(type: string): ASRAsyncAction<A, P>;
}

export interface ASRReducer<S, P> {
    (state: S, payload: P, actionData: ASRActionData<P>): S;
}

export interface ASRReducerCreator {
    <S>(initState: S, action: ASREmptyAction, reducer?: ASRReducer<S, void>)
        : (state: S, actionData: ASRReduxActionData) => S;
    <S>(initState: S, action: ASRAction<ASRAsyncActionPayload<any, S>>)
        : (state: S, actionData: ASRReduxActionData) => S;
    <S>(initState: S, action: ASRAction<ASRAsyncActionFailedPayload<any, S>>)
        : (state: S, actionData: ASRReduxActionData) => S;
    <S>(initState: S, action: ASRAction<S>): (state: S, actionData: ASRReduxActionData) => S;
    
    <S, P>(initState: S, action: ASRAction<P>, reducer: ASRReducer<S, P>)
        : (state: S, actionData: ASRReduxActionData) => S;
}

interface ASRCaseReducerCreator<S> {
    (state: S, actionData: ASRReduxActionData): S;
    
    case(action: ASREmptyAction, reducer?: ASRReducer<S, void>): ASRCaseReducerCreator<S>;
    case(action: ASRAction<ASRAsyncActionPayload<any, S>>): ASRCaseReducerCreator<S>;
    case(action: ASRAction<ASRAsyncActionFailedPayload<any, S>>): ASRCaseReducerCreator<S>;
    case(action: ASRAction<S>): ASRCaseReducerCreator<S>;
    
    case<P>(action: ASRAction<P>, reducer: ASRReducer<S, P>): ASRCaseReducerCreator<S>;

    property<PS>(name: string, reducer: (state: PS, actionData: ASRReduxActionData) => PS)
        : ASRCaseReducerCreator<S>;
}

export interface ASRReducersCreator {
    <S>(initState: S): ASRCaseReducerCreator<S>;
}

enum EAsync {
    STARTED = 1,
    DONE,
    FAILED,
}

export const actionCreatorFactory = (prefix: string = ''): ASRActionCreator => {
    if (prefix) {
        prefix += '_';
    }

    const actions: { [key: string]: boolean } = {};

    const creator: any = (type: string, __async) => {
        type = prefix + type;
 
        if (actions[type]) {
            throw new Error('Action [' + type + '] duplicated!');
        }

        actions[type] = true;

        const action: any = (payload) => {
            return {
                type,
                payload,
                __async,
            };
        };

        action.dispatch = (payload) => {
            return actionDispatch({
                type,
                payload,
                __async,
            });
        };

        action.type = type;
        action.match = function(t: string) {
            return this.type === t;
        };

        return action;
    };

    const asyncCreator = (type: string) => {
        const oldType = type;
        type = prefix + type;
        if (actions[type]) {
            throw new Error('Action [' + type + '] duplicated!');
        }

        actions[type] = true;

        const action = {
            type,
            started: creator(oldType + '_S', EAsync.STARTED),
            done: creator(oldType + '_D', EAsync.DONE),
            failed: creator(oldType + '_F', EAsync.FAILED),   
        };

        return action;
    };

    creator.async = asyncCreator;

    return creator;
};

export const actionCreator: ASRActionCreator = actionCreatorFactory();

const reducerCreatorImpl = (initState, action, reducer) => {
    return (state, actionData) => {
        if (state === undefined) {
            return initState;
        }

        if (!action.match(actionData.type)) {
            return state;
        }

        if (!reducer) {
            if (actionData.__async === EAsync.DONE) {
                return actionData.payload.result;
            } else if (actionData.__async === EAsync.FAILED && actionData.payload.result !== undefined) {
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
            if (actionData.__async === EAsync.DONE) {
                state = actionData.payload.result;
            } else if (actionData.__async === EAsync.FAILED && actionData.payload.result !== undefined) {
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

export const reducerCreator: ASRReducerCreator = reducerCreatorImpl as any;
export const reducersCreator: ASRReducersCreator = reducersCreatorImpl as any;

export interface ASRSaga {
    (): Iterator<any>;
}

export interface ASRSagaHandle<P> {
    (payload: P, getter: typeof stateGetter, actionData: ASRActionData<P>);
}

export interface ASRSagaCreator {
    (action: ASREmptyAction, handle: ASRSagaHandle<void>): ASRSaga;
    <P>(action: ASRAction<P>, handle: ASRSagaHandle<P>): ASRSaga;
    every(action: ASREmptyAction, handle: ASRSagaHandle<void>): ASRSaga;
    every<P>(action: ASRAction<P>, handle: ASRSagaHandle<P>): ASRSaga;
}

const sagaCreatorImpl = (action, handle) => {
    return function*() {
        yield takeLatest(action.type, function*(actionData: ASRActionData<any>) {
            try {
                yield handle(actionData.payload, stateGetter, actionData);
            } catch (error) {
                setTimeout(() => {
                    throw error;
                });
            }
        });
    };
};

const sagaEvenryCreatorImpl = (action, handle) => {
    return function*() {
        yield takeEvery(action.type, function*(actionData: ASRActionData<any>) {
            try {
                yield handle(actionData.payload, stateGetter, actionData);
            } catch (error) {
                setTimeout(() => {
                    throw error;
                });
            }
        });
    };
};

export const sagaCreator: ASRSagaCreator = sagaCreatorImpl as any;
sagaCreator.every = sagaEvenryCreatorImpl as any;
