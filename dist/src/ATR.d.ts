export { axrSetOptions, axr, axrCombine } from './AXR';
declare const stateGetter: () => any;
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
    (params: A, getter: typeof stateGetter): Promise<P>;
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
    <S>(initState: S, action: ATREmptyAction, reducer?: ATRReducer<S, void>): (state: S, actionData: ATRReduxActionData) => S;
    <S>(initState: S, action: ATREmptyAsyncAction<S>): (state: S, actionData: ATRReduxActionData) => S;
    <S>(initState: S, action: ATRAction<S>): (state: S, actionData: ATRReduxActionData) => S;
    <S, A>(initState: S, action: ATRAsyncAction<A, S>): (state: S, actionData: ATRReduxActionData) => S;
    <S, P>(initState: S, action: ATREmptyAsyncAction<P>, reducer: ATRReducer<S, ATRAsyncActionPayload<void, P>>): (state: S, actionData: ATRReduxActionData) => S;
    <S, P>(initState: S, action: ATRAction<P>, reducer: ATRReducer<S, P>): (state: S, actionData: ATRReduxActionData) => S;
    <S, P, A>(initState: S, action: ATRAsyncAction<A, P>, reducer: ATRReducer<S, ATRAsyncActionPayload<A, P>>): (state: S, actionData: ATRReduxActionData) => S;
}
interface ATRCaseReducerCreator<S> {
    (state: S, actionData: ATRReduxActionData): S;
    case(action: ATREmptyAction, reducer?: ATRReducer<S, void>): ATRCaseReducerCreator<S>;
    case(action: ATREmptyAsyncAction<S>): ATRCaseReducerCreator<S>;
    case(action: ATRAction<S>): ATRCaseReducerCreator<S>;
    case<A>(action: ATRAsyncAction<A, S>): ATRCaseReducerCreator<S>;
    case<P>(action: ATREmptyAsyncAction<P>, reducer: ATRReducer<S, ATRAsyncActionPayload<void, P>>): ATRCaseReducerCreator<S>;
    case<P>(action: ATRAction<P>, reducer: ATRReducer<S, P>): ATRCaseReducerCreator<S>;
    case<P, A>(action: ATRAsyncAction<A, P>, reducer: ATRReducer<S, ATRAsyncActionPayload<A, P>>): ATRCaseReducerCreator<S>;
}
export interface ATRReducersCreator {
    <S>(initState: S): ATRCaseReducerCreator<S>;
}
export declare const actionCreator: ATRActionCreator;
export declare const reducerCreator: ATRReducerCreator;
export declare const reducersCreator: ATRReducersCreator;