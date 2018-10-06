"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var actionCreatorFactory = function () {
    var actions = {};
    var asyncCreator = function (type, thunk) {
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
    var rootReducer = function (state, actionData) {
        if (state === undefined) {
            return initState;
        }
        var reducer = reducers[actionData.type];
        if (reducer === undefined) {
            return state;
        }
        if (reducer === 0) {
            if (actionData.__async) {
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
//# sourceMappingURL=ATR.js.map