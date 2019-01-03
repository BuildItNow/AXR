"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _a;
var effects_1 = require("redux-saga/effects");
var AXR_1 = require("./AXR");
var EAsync;
(function (EAsync) {
    EAsync[EAsync["STARTED"] = 1] = "STARTED";
    EAsync[EAsync["DONE"] = 2] = "DONE";
    EAsync[EAsync["FAILED"] = 3] = "FAILED";
})(EAsync = exports.EAsync || (exports.EAsync = {}));
exports.createASRContext = function () {
    // tslint:disable:no-shadowed-variable
    var _a = AXR_1.createContext(), axrGetOptions = _a.axrGetOptions, axrSetOptions = _a.axrSetOptions, axr = _a.axr, axrCombine = _a.axrCombine;
    var stateGetter = function () {
        return axrGetOptions().getState();
    };
    var actionDispatch = function (actionData) {
        return axrGetOptions().dispatch(actionData);
    };
    var actionCreatorFactory = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        if (prefix) {
            prefix += '_';
        }
        var actions = {};
        var creator = function (type, __async) {
            type = prefix + type;
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
            var oldType = type;
            type = prefix + type;
            if (actions[type]) {
                throw new Error('Action [' + type + '] duplicated!');
            }
            actions[type] = true;
            var action = {
                type: type,
                started: creator(oldType + '_S', EAsync.STARTED),
                done: creator(oldType + '_D', EAsync.DONE),
                failed: creator(oldType + '_F', EAsync.FAILED),
            };
            return action;
        };
        creator.async = asyncCreator;
        return creator;
    };
    var actionCreator = actionCreatorFactory();
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
        var dyncReducers;
        var reducers = {};
        var propertyReducers = {};
        var properties = [];
        var initPartialState = function (state, actionData) {
            if (properties.length > 0) {
                properties.forEach(function (key) {
                    state[key] = propertyReducers[key](undefined, actionData);
                });
            }
        };
        var resolvePartialState = function (state, actionData) {
            if (properties.length === 0) {
                return state;
            }
            var newState;
            properties.forEach(function (key) {
                var oState = state[key];
                var nState = propertyReducers[key](oState, actionData);
                if (oState !== nState) {
                    if (!newState) {
                        newState = __assign({}, state);
                    }
                    newState[key] = nState;
                }
            });
            return newState === undefined ? state : newState;
        };
        var rootReducer = function (state, actionData) {
            // Setup the dynamic reducers
            if (dyncReducers) {
                for (var i = 0, iz = dyncReducers.length; i < iz; i += 2) {
                    reducers[dyncReducers[i]().type] = dyncReducers[i + 1];
                }
                dyncReducers = undefined;
            }
            if (state === undefined) {
                initPartialState(initState, actionData);
                return initState;
            }
            var reducer = reducers[actionData.type];
            if (reducer === 0) {
                if (actionData.__async === EAsync.DONE) {
                    state = actionData.payload.result;
                }
                else if (actionData.__async === EAsync.FAILED && actionData.payload.result !== undefined) {
                    state = actionData.payload.result;
                }
                else {
                    state = actionData.payload;
                }
            }
            else if (reducer) {
                state = reducer(state, actionData.payload, actionData);
            }
            else {
                state = resolvePartialState(state, actionData);
            }
            return state;
        };
        rootReducer.case = function (action, reducer) {
            reducer = reducer || 0;
            if (action.type) {
                reducers[action.type] = reducer;
            }
            else {
                if (!dyncReducers) {
                    dyncReducers = [];
                }
                dyncReducers.push(action, reducer);
            }
            return rootReducer;
        };
        rootReducer.property = function (name, reducer) {
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
    var reducerCreator = reducerCreatorImpl;
    var reducersCreator = reducersCreatorImpl;
    var sagaCreatorImpl = function (action, handle) {
        var saga = function () {
            var type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = action.type ? action.type : action().type;
                        return [4 /*yield*/, effects_1.takeLatest(type, function (actionData) {
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
        return {
            saga: saga,
            handle: handle,
        };
    };
    var sagaEvenryCreatorImpl = function (action, handle) {
        var saga = function () {
            var type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = action.type ? action.type : action().type;
                        return [4 /*yield*/, effects_1.takeEvery(type, function (actionData) {
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
        return {
            saga: saga,
            handle: handle,
        };
    };
    var sagaThrottleCreatorImpl = function (action, time, handle) {
        var saga = function () {
            var type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = action.type ? action.type : action().type;
                        return [4 /*yield*/, effects_1.throttle(time, type, function (actionData) {
                                var error_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, handle(actionData.payload, stateGetter, actionData)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_3 = _a.sent();
                                            setTimeout(function () {
                                                throw error_3;
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
        return {
            saga: saga,
            handle: handle,
        };
    };
    var sagaCreator = sagaCreatorImpl;
    sagaCreator.every = sagaEvenryCreatorImpl;
    sagaCreator.throttle = sagaThrottleCreatorImpl;
    return {
        axr: axr,
        axrCombine: axrCombine,
        axrSetOptions: axrSetOptions,
        axrGetOptions: axrGetOptions,
        actionCreatorFactory: actionCreatorFactory,
        actionCreator: actionCreator,
        sagaCreator: sagaCreator,
        reducerCreator: reducerCreator,
        reducersCreator: reducersCreator,
    };
    // tslint:enable
};
// Export the default context
exports.axr = (_a = exports.createASRContext(), _a.axr), exports.axrCombine = _a.axrCombine, exports.axrSetOptions = _a.axrSetOptions, exports.axrGetOptions = _a.axrGetOptions, exports.actionCreatorFactory = _a.actionCreatorFactory, exports.actionCreator = _a.actionCreator, exports.sagaCreator = _a.sagaCreator, exports.reducerCreator = _a.reducerCreator, exports.reducersCreator = _a.reducersCreator;
exports.default = 'Hello World';
//# sourceMappingURL=ASR.js.map