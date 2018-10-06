"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axrImpl = function (action, handler, reducer) {
    return {
        action: action || {},
        handler: handler || [],
        reducer: reducer || {},
    };
};
var axrCombineImpl = function () {
    var axrs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        axrs[_i] = arguments[_i];
    }
    var ret = {
        action: {},
        handler: [],
        reducer: {},
    };
    if (!axrs || axrs.length === 0) {
        return ret;
    }
    var da = ret.action;
    var dh = ret.handler;
    var dr = ret.reducer;
    var ca = {};
    var cr = {};
    axrs.forEach(function (item) {
        if (item.action) {
            var sa = item.action;
            for (var k in sa) {
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
            var sr = item.reducer;
            for (var k in sr) {
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
    var ce = '';
    var cak = Object.keys(ca);
    if (cak.length > 0) {
        ce = '\n';
        ce += 'AXR action conflicts:\n';
        ce += cak.join(',');
    }
    var crk = Object.keys(cr);
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
exports.axr = axrImpl;
exports.axrCombine = axrCombineImpl;
var axrOptions = {
    getState: function () {
        throw new Error('Please use axrSetOptions before use it.');
    },
    dispatch: function (actionData) {
        throw new Error('Please use axrSetOptions before use it.');
    },
};
exports.axrSetOptions = function (options) {
    for (var k in options) {
        if (!options.hasOwnProperty(k)) {
            continue;
        }
        axrOptions[k] = options[k];
    }
};
exports.axrGetOptions = function () {
    return axrOptions;
};
//# sourceMappingURL=AXR.js.map