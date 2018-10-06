const axrImpl = (action, handler, reducer) => {
    return {
        action: action || {},
        handler: handler || [],
        reducer: reducer || {},
    };
};

const axrCombineImpl = (...axrs) => {
    const ret = {
        action: {},
        handler: [],
        reducer: {},
    };

    if (!axrs || axrs.length === 0) {
        return ret;
    }

    const da = ret.action;
    const dh = ret.handler;
    const dr = ret.reducer;
    const ca = {};
    const cr = {};
    axrs.forEach((item) => {
        if (item.action) {
            const sa = item.action;
            for (const k in sa) {
                if (!sa.hasOwnProperty(k)) {
                    continue;
                }
                if (da[k]) {
                    ca[k] = true;
                }
                da[k] = sa[k];
            }
        }

        if (item.handler) {
            dh.push.apply(dh, item.handler);
        }

        if (item.reducer) {
            const sr = item.reducer;
            for (const k in sr) {
                if (!sr.hasOwnProperty(k)) {
                    continue;
                }
                if (dr[k]) {
                    cr[k] = true;
                }
                dr[k] = sr[k];
            }
        }
    });

    let ce = '';
    const cak = Object.keys(ca);
    if (cak.length > 0) {
        ce = '\n';
        ce += 'AXR action conflicts:\n';
        ce += cak.join(',');
    }

    const crk = Object.keys(cr);
    if (crk.length > 0) {
        ce = '\n';
        ce += 'AXR reducer conflicts:\n';
        ce += crk.join(',');
    }

    if (ce) {
        ce += '\n';
        throw new Error(ce);
    }

    return ret;
};

interface axr {
    <A, X, R>(action: A, handler?: X, reducer?: R): { action: A, handler: X, reducer: R };
}

export const axr: axr = axrImpl;

interface axrCombine {
    <A>(a: A): A;
    <A0, A1>(a0: A0, a1: A1): A0 & A1;
    <A0, A1, A2>(a0: A0, a1: A1, a2: A2): A0 & A1 & A2;
    <A0, A1, A2, A3>(a0: A0, a1: A1, a2: A2, a3: A3): A0 & A1 & A2 & A3;
    <A0, A1, A2, A3, A4>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4): A0 & A1 & A2 & A3 & A4;
    <A0, A1, A2, A3, A4, A5>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5)
        : A0 & A1 & A2 & A3 & A4 & A5;
    <A0, A1, A2, A3, A4, A5, A6>(a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6)
        : A0 & A1 & A2 & A3 & A4 & A5 & A6;
    <A0, A1, A2, A3, A4, A5, A6, A7>
        (a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7)
        : A0 & A1 & A2 & A3 & A4 & A5 & A6 & A7;
    <A0, A1, A2, A3, A4, A5, A6, A7, A8>
        (a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8)
        : A0 & A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8;
    <A0, A1, A2, A3, A4, A5, A6, A7, A8, A9>
        (a0: A0, a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9)
        : A0 & A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8 & A9;
}

export const axrCombine: axrCombine = axrCombineImpl;

export interface AXROptions {
    getState: () => any;
    dispatch: (action: { type: string }) => any;
}

const axrOptions: AXROptions = {
    getState: () => {
        throw new Error('Please use axrSetOptions before use it.');
    },
    dispatch: (actionData) => {
        throw new Error('Please use axrSetOptions before use it.');
    },
};

export const axrSetOptions = (options: AXROptions) => {
    for (const k in options) {
        if (!options.hasOwnProperty(k)) {
            continue;
        }

        axrOptions[k] = options[k];
    }
};

export const axrGetOptions = (): AXROptions => {
    return axrOptions;
};
