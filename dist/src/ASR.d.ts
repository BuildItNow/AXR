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
    <S>(initState: S, action: ASREmptyAction, reducer?: ASRReducer<S, void>): (state: S, actionData: ASRReduxActionData) => S;
    <S>(initState: S, action: ASRAction<ASRAsyncActionPayload<any, S>>): (state: S, actionData: ASRReduxActionData) => S;
    <S>(initState: S, action: ASRAction<ASRAsyncActionFailedPayload<any, S>>): (state: S, actionData: ASRReduxActionData) => S;
    <S>(initState: S, action: ASRAction<S>): (state: S, actionData: ASRReduxActionData) => S;
    <S, P>(initState: S, action: ASRAction<P>, reducer: ASRReducer<S, P>): (state: S, actionData: ASRReduxActionData) => S;
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
    property<PS>(name: string, reducer: (state: PS, actionData: ASRReduxActionData) => PS): ASRCaseReducerCreator<S>;
}
export interface ASRReducersCreator {
    <S>(initState: S): ASRCaseReducerCreator<S>;
}
export declare enum EAsync {
    STARTED = 1,
    DONE = 2,
    FAILED = 3
}
export interface ASRSaga {
    saga(): Iterator<any>;
    handle(): Iterator<any>;
}
export interface ASRSagaHandle<P, S = any> {
    (payload: P, getter: () => S, actionData: ASRActionData<P>): any;
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
export declare const createASRContext: () => {
    axr: import("./AXR").axr;
    axrCombine: import("./AXR").axrCombine;
    axrSetOptions: (options: import("./AXR").AXROptions) => void;
    axrGetOptions: () => import("./AXR").AXROptions;
    actionCreatorFactory: (prefix?: string) => ASRActionCreator;
    actionCreator: ASRActionCreator;
    sagaCreator: ASRSagaCreator<any>;
    reducerCreator: ASRReducerCreator;
    reducersCreator: ASRReducersCreator;
};
export declare const axr: import("./AXR").axr, axrCombine: import("./AXR").axrCombine, axrSetOptions: (options: import("./AXR").AXROptions) => void, axrGetOptions: () => import("./AXR").AXROptions, actionCreatorFactory: (prefix?: string) => ASRActionCreator, actionCreator: ASRActionCreator, sagaCreator: ASRSagaCreator<any>, reducerCreator: ASRReducerCreator, reducersCreator: ASRReducersCreator;
declare const _default: "Hello World";
export default _default;
