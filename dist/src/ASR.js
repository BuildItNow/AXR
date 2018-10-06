"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var effects_1 = require("redux-saga/effects");
var AXR_1 = require("./AXR");
var AXR_2 = require("./AXR");
exports.axrSetOptions = AXR_2.axrSetOptions;
exports.axr = AXR_2.axr;
exports.axrCombine = AXR_2.axrCombine;
var stateGetter = function () {
    return AXR_1.axrGetOptions().getState();
};
var actionDispatch = function (actionData) {
    return AXR_1.axrGetOptions().dispatch(actionData);
};
var EAsync;
(function (EAsync) {
    EAsync[EAsync["STARTED"] = 1] = "STARTED";
    EAsync[EAsync["DONE"] = 2] = "DONE";
    EAsync[EAsync["FAILED"] = 3] = "FAILED";
})(EAsync || (EAsync = {}));
var actionCreatorFactory = function () {
    var actions = {};
    var creator = function (type, __async) {
        if (actions[type]) {
            throw new Error('Action [' + type + '] duplicated!');
        }
        actions[type] = true;
        var action = function (payload) {
            return {
                type: type,
                payload: payload,
                __async: __async,
            };
        };
        action.dispatch = function (payload) {
            return actionDispatch({
                type: type,
                payload: payload,
                __async: __async,
            });
        };
        action.type = type;
        action.match = function (t) {
            return this.type === t;
        };
        return action;
    };
    var asyncCreator = function (type) {
        if (actions[type]) {
            throw new Error('Action [' + type + '] duplicated!');
        }
        actions[type] = true;
        var action = {
            type: type,
            started: creator(type + '_S_', EAsync.STARTED),
            done: creator(type + '_D_', EAsync.DONE),
            failed: creator(type + '_F_', EAsync.FAILED),
        };
        return action;
    };
    creator.async = asyncCreator;
    return creator;
};
exports.actionCreator = actionCreatorFactory();
var reducerCreatorImpl = function (initState, action, reducer) {
    return function (state, actionData) {
        if (state === undefined) {
            return initState;
        }
        if (!action.match(actionData.type)) {
            return state;
        }
        if (!reducer) {
            if (actionData.__async === EAsync.DONE) {
                return actionData.payload.result;
            }
            else if (actionData.__async === EAsync.FAILED && actionData.payload.result !== undefined) {
                return actionData.payload.result;
            }
            return actionData.payload;
        }
        return reducer(state, actionData.payload, actionData);
    };
};
var reducersCreatorImpl = function (initState) {
    var reducers = {};
    var rootReducer = function (state, actionData) {
        if (state === undefined) {
            return initState;
        }
        var reducer = reducers[actionData.type];
        if (reducer === undefined) {
            return state;
        }
        if (reducer === 0) {
            if (actionData.__async === EAsync.DONE) {
                return actionData.payload.result;
            }
            else if (actionData.__async === EAsync.FAILED && actionData.payload.result !== undefined) {
                return actionData.payload.result;
            }
            return actionData.payload;
        }
        return reducer(state, actionData.payload, actionData);
    };
    rootReducer.case = function (action, reducer) {
        reducer = reducer || 0;
        reducers[action.type] = reducer;
        return rootReducer;
    };
    return rootReducer;
};
exports.reducerCreator = reducerCreatorImpl;
exports.reducersCreator = reducersCreatorImpl;
var sagaCreatorImpl = function (action, handle) {
    return function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, effects_1.takeLatest(action.type, function (actionData) {
                        var error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, handle(actionData.payload, stateGetter, actionData)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    setTimeout(function () {
                                        throw error_1;
                                    });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
};
var sagaEvenryCreatorImpl = function (action, handle) {
    return function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, effects_1.takeEvery(action.type, function (actionData) {
                        var error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, handle(actionData.payload, stateGetter, actionData)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    setTimeout(function () {
                                        throw error_2;
                                    });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
};
exports.sagaCreator = sagaCreatorImpl;
exports.sagaCreator.every = sagaEvenryCreatorImpl;
//# sourceMappingURL=ASR.js.map