export interface axr {
    <A, X, R>(action: A, handler?: X, reducer?: R): {
        action: A;
        handler: X;
        reducer: R;
    };
}
export interface axrCombine {
    <A>(a: A): A;
    <A0, A1>(a0: A0, a1: A1): A0 & A1;
    <A0, A1, A2>(a0: A0, a1: A1, a2: A2): A0 & A1 & A2;
    <A0, A1, A2, A3>(a0: A0, a1: A1, a2: A2, a3: A3): A0 & A1 & A2 & A3;
    <A0, A1, A2, A3, A4>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4): A0 & A1 & A2 & A3 & A4;
    <A0, A1, A2, A3, A4, A5>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): A0 & A1 & A2 & A3 & A4 & A5;
    <A0, A1, A2, A3, A4, A5, A6>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): A0 & A1 & A2 & A3 & A4 & A5 & A6;
    <A0, A1, A2, A3, A4, A5, A6, A7>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7): A0 & A1 & A2 & A3 & A4 & A5 & A6 & A7;
    <A0, A1, A2, A3, A4, A5, A6, A7, A8>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8): A0 & A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8;
    <A0, A1, A2, A3, A4, A5, A6, A7, A8, A9>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9): A0 & A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8 & A9;
}
export interface AXROptions {
    getState: () => any;
    dispatch: (action: {
        type: string;
    }) => any;
}
export declare const createContext: () => {
    axr: axr;
    axrCombine: axrCombine;
    axrSetOptions: (options: AXROptions) => void;
    axrGetOptions: () => AXROptions;
};
