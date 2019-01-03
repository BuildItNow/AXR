import { takeLatest, takeEvery, throttle } from 'redux-saga/effects';
import { createContext } from './AXR';
 
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

export interface ASRCaseReducerCreator<S> {
    (state: S, actionData: ASRReduxActionData): S;
    case(action: () => ASREmptyAction, reducer?: ASRReducer<S, void>): ASRCaseReducerCreator<S>;
    case(action: () => ASRAction<ASRAsyncActionPayload<any, S>>): ASRCaseReducerCreator<S>;
    case(action: () => ASRAction<ASRAsyncActionFailedPayload<any, S>>): ASRCaseReducerCreator<S>;
    case(action: () => ASRAction<S>): ASRCaseReducerCreator<S>;    
    case<P>(action: () => ASRAction<P>, reducer: ASRReducer<S, P>): ASRCaseReducerCreator<S>;

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

export enum EAsync {
    STARTED = 1,
    DONE,
    FAILED,
}

export interface ASRSaga {
    saga(): Iterator<any>;
    handle(): Iterator<any>;
}

export interface ASRSagaHandle<P, S = any> {
    (payload: P, getter: () => S, actionData: ASRActionData<P>);
}

export interface ASRSagaCreator<S = any> {
    (action: () => ASREmptyAction, handle: ASRSagaHandle<void, S>): ASRSaga;
    <P>(action: () => ASRAction<P>, handle: ASRSagaHandle<P, S>): ASRSaga;
    (action: ASREmptyAction, handle: ASRSagaHandle<void, S>): ASRSaga;
    <P>(action: ASRAction<P>, handle: ASRSagaHandle<P, S>): ASRSaga;
    
    every(action: () => ASREmptyAction, handle: ASRSagaHandle<void, S>): ASRSaga;
    every<P>(action: () => ASRAction<P>, handle: ASRSagaHandle<P, S>): ASRSaga;
    every(action: ASREmptyAction, handle: ASRSagaHandle<void, S>): ASRSaga;
    every<P>(action: ASRAction<P>, handle: ASRSagaHandle<P, S>): ASRSaga;
    
    throttle(action: () => ASREmptyAction, time: number, handle: ASRSagaHandle<void, S>): ASRSaga;
    throttle<P>(action: () => ASRAction<P>, time: number, handle: ASRSagaHandle<P, S>): ASRSaga;
    throttle(action: ASREmptyAction, time: number, handle: ASRSagaHandle<void, S>): ASRSaga;
    throttle<P>(action: ASRAction<P>, time: number, handle: ASRSagaHandle<P, S>): ASRSaga;
}

export const createASRContext = () => {
    // tslint:disable:no-shadowed-variable
    const { axrGetOptions, axrSetOptions, axr, axrCombine } = createContext();

    const stateGetter = () => {
        return axrGetOptions().getState();
    };
    
    const actionDispatch = (actionData) => {
        return axrGetOptions().dispatch(actionData);
    };
    
    const actionCreatorFactory = (prefix: string = ''): ASRActionCreator => {
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
    
    const actionCreator: ASRActionCreator = actionCreatorFactory();
    
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
        let dyncReducers;
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
            // Setup the dynamic reducers
            if (dyncReducers) {
                for (let i = 0, iz = dyncReducers.length; i < iz; i += 2) {
                    reducers[dyncReducers[i]().type] = dyncReducers[i + 1];
                }
                dyncReducers = undefined!;
            }

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

            if (action.type) {
                reducers[action.type] = reducer;
            } else {
                if (!dyncReducers) {
                    dyncReducers = [];
                }

                dyncReducers.push(action, reducer);
            }
            
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
    
    const reducerCreator: ASRReducerCreator = reducerCreatorImpl as any;
    const reducersCreator: ASRReducersCreator = reducersCreatorImpl as any;
    
    const sagaCreatorImpl = (action, handle) => {
        const saga = function*() {
            const type = action.type ? action.type : action().type;
            yield takeLatest(type, function*(actionData: ASRActionData<any>) {
                try {
                    yield handle(actionData.payload, stateGetter, actionData);
                } catch (error) {
                    setTimeout(() => {
                        throw error;
                    });
                }
            });
        };
        return {
            saga,
            handle,
        };
    };
    
    const sagaEvenryCreatorImpl = (action, handle) => {
        const saga = function*() {
            const type = action.type ? action.type : action().type;
            yield takeEvery(type, function*(actionData: ASRActionData<any>) {
                try {
                    yield handle(actionData.payload, stateGetter, actionData);
                } catch (error) {
                    setTimeout(() => {
                        throw error;
                    });
                }
            });
        };
    
        return {
            saga,
            handle,
        };
    };
    
    const sagaThrottleCreatorImpl = (action, time, handle) => {
        const saga = function*() {
            const type = action.type ? action.type : action().type;
            yield throttle(time, type, function*(actionData: ASRActionData<any>) {
                try {
                    yield handle(actionData.payload, stateGetter, actionData);
                } catch (error) {
                    setTimeout(() => {
                        throw error;
                    });
                }
            });
        };
    
        return {
            saga,
            handle,
        };
    };
    
    const sagaCreator: ASRSagaCreator = sagaCreatorImpl as any;
    sagaCreator.every = sagaEvenryCreatorImpl as any;
    sagaCreator.throttle = sagaThrottleCreatorImpl as any;

    return {
        axr,
        axrCombine,
        axrSetOptions,
        axrGetOptions,
        actionCreatorFactory,
        actionCreator,
        sagaCreator,
        reducerCreator,
        reducersCreator,
    };
    // tslint:enable
};

// Export the default context
export const {
    axr,
    axrCombine,
    axrSetOptions,
    axrGetOptions,
    actionCreatorFactory,
    actionCreator,
    sagaCreator,
    reducerCreator,
    reducersCreator,
} = createASRContext();

export default 'Hello World';
