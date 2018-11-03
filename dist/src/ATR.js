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
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
var AXR_1 = require("./AXR");
exports.createATRContext = function () {
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
        var asyncCreator = function (type, thunk) {
            type = prefix + type;
            if (actions[type]) {
                throw new Error('Action [' + type + '] duplicated!');
            }
            actions[type] = true;
            var action = function (params) {
                var p = thunk.call(undefined, params, stateGetter);
                if (p) {
                    p = p.then(function (payload) {
                        actionDispatch({
                            type: type,
                            payload: {
                                params: params,
                                result: payload,
                            },
                            __async: true,
                        });
                        return payload;
                    });
                }
                else {
                    p = Promise.reject();
                }
                return p;
            };
            action.type = type;
            action.match = function (t) {
                return this.type === t;
            };
            return action;
        };
        var creator = function (type) {
            type = prefix + type;
            if (actions[type]) {
                throw new Error('Action [' + type + '] duplicated!');
            }
            actions[type] = true;
            var action = function (payload) {
                actionDispatch({
                    type: type,
                    payload: payload,
                });
                return Promise.resolve(payload);
            };
            action.type = type;
            action.match = function (t) {
                return this.type === t;
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
                if (actionData.__async) {
                    return actionData.payload.result;
                }
                return actionData.payload;
            }
            return reducer(state, actionData.payload, actionData);
        };
    };
    var reducersCreatorImpl = function (initState) {
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
            if (state === undefined) {
                initPartialState(initState, actionData);
                return initState;
            }
            var reducer = reducers[actionData.type];
            if (reducer === 0) {
                if (actionData.__async) {
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
            reducers[action.type] = reducer;
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
    return {
        axr: axr,
        axrCombine: axrCombine,
        axrSetOptions: axrSetOptions,
        axrGetOptions: axrGetOptions,
        actionCreatorFactory: actionCreatorFactory,
        actionCreator: actionCreator,
        reducerCreator: reducerCreator,
        reducersCreator: reducersCreator,
    };
};
// Export the default context
exports.axr = (_a = exports.createATRContext(), _a.axr), exports.axrCombine = _a.axrCombine, exports.axrSetOptions = _a.axrSetOptions, exports.axrGetOptions = _a.axrGetOptions, exports.actionCreatorFactory = _a.actionCreatorFactory, exports.actionCreator = _a.actionCreator, exports.reducerCreator = _a.reducerCreator, exports.reducersCreator = _a.reducersCreator;
//# sourceMappingURL=ATR.js.map