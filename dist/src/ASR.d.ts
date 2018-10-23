export { axrSetOptions, axr, axrCombine } from './AXR';
declare const stateGetter: () => any;
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
interface ASRCaseReducerCreator<S> {
    (state: S, actionData: ASRReduxActionData): S;
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
export declare const actionCreatorFactory: (prefix?: string) => ASRActionCreator;
export declare const actionCreator: ASRActionCreator;
export declare const reducerCreator: ASRReducerCreator;
export declare const reducersCreator: ASRReducersCreator;
export interface ASRSaga {
    (): Iterator<any>;
}
export interface ASRSagaHandle<P> {
    (payload: P, getter: typeof stateGetter, actionData: ASRActionData<P>): any;
}
export interface ASRSagaCreator {
    (action: ASREmptyAction, handle: ASRSagaHandle<void>): ASRSaga;
    <P>(action: ASRAction<P>, handle: ASRSagaHandle<P>): ASRSaga;
    every(action: ASREmptyAction, handle: ASRSagaHandle<void>): ASRSaga;
    every<P>(action: ASRAction<P>, handle: ASRSagaHandle<P>): ASRSaga;
}
export declare const sagaCreator: ASRSagaCreator;
