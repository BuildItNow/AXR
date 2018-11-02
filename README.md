# AXR
Asynchronous stream development util. It's more **convenient**, **modulized** and **typesafe** to develop redux style application with **AXR**.

**AXR** takes the first character from each role of redux:
* **A**: Redux action
* **X**: Asyncchronous stream lib, maybe **saga** or **thunk**
* **R**: Redux reducer

AXR is based on **[redux-saga](https://redux-saga.js.org/)**. **[redux](https://redux.js.org/)** is not the required, you still can use AXR will your own state management style.

## How to use

### Install
Use npm:
``` bash
npm install axr
```
or use yarn:
``` bash
yarn add axr
```

### Initialized
AXR dependents on two apis: `dispatch` and `getState`, so you need to set them first:

``` js
// in setup.js
// 1: import axrSetOptions(), axrSetOptions will tell what axr needed
import { axrSetOptions } from 'axr/dist/ASR';

// 2: Setup the two api, just delegate to redux store
axrSetOptions({
    getState: () => {
        return store.getState();
    },
    dispatch: (action) => {
        return store.dispatch(action);
    }
});

// 3: Now, export anything from axr
export * from 'axr/dist/ASR';
```

After setup options, just import apis from *setup.js* to create an AXR module. **NB: Don't import apis from AXR directly**.
``` js
// in AXR.js
import { actionCreator, sagaCreator, reducerCreator, axr } from './setup.js';

// Create an action
const appStart = actionCreator<string>('appStart');

// Create an saga
const sagaAppStart = sagaCreator(appStart, function*(payload, getState) {
	console.log(payload);
});

// Create a reducer
const startInfo = reducerCreator('Hello World', appStart, (state, payload) => {
	return payload;
})

// Export axr
export default axr(
{
	appStart,
},
[
	sagaAppStart,
],
{
	startInfo,
});

```

Now setup saga and redux in application!
``` js
import AXR from './AXR';

// Create redux sagaMiddleware
const sagaMiddleware = createSagaMiddleware();
// Create root reducer
const rootReducer = combineReducers(AXR.reducer);
// Create store
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

// Start saga
const sagas = AXR.handler;
const rootSaga = function*() {
	yield all(sagas.map(saga => spawn(saga.saga)));
};
sagaMiddleware.run(rootSaga);
```

Trigger an action:
``` js
import AXR from './AXR';

// Trigger the appStart action
AXR.action.appStart.dispatch('Hello AXR');
```

This is all of AXR.

## API
### actionCreatorFactory(prefix)
Create an `actionCreator` with prefix.

``` js
// Create an actionCreator with prefix 'BZ_A'
const actionCreator = actionCreatorFactory('BZ_A');
```

### actionCreator(type)
Create an action object, the type of action object is `type`. If the actionCreator is from `actionCreatorFactory(prefix)`, the type will automatically prefixed.

The action object is a function in fact, and has some properties as bellow:
* type: The type of action object (prefixed)
* match(type): Check action type
* dispatch(payload): Trigger an action with payload data

Example:

``` js
// Create an action object
const appStart = actionCreator('appStart');

// Create an action
// action.type === 'appStart'
// action.payload === undefined
const action = appStart();

// Check action is 'appStart' and do something
if (appStart.match('appStart')) {
	// Do something
}

// Trigger an action
appStart.dispatch();

////////////////////////////////////////////////////

// Create an action with payload
// The type of payload is
// {
//    username: string,
//    password: string,
// }
const login = actionCreator<
{
	username: string,
    password: string,
}>('login');

// Create an action data
// action.type === 'login'
// action.payload.username === 'zhangsan'
// action.payload.password === 'admin@123'
const action = login({
	username: 'zhangsan',
    password: 'admin@123',
});

// Trigger an action
login.dispatch({
	username: 'zhangsan',
    password: 'admin@123',
});

```

### actionCreator.async(type)
Create an async action object. An async action object has three sub action objects: **started**, **done** and **failed**. The payload of **done** is:
``` js
{
	// The param of async action
	params: startPayload,
    // The result of async action
    result: doneResult,
}
```

Example:

``` js
// Create an async action with started payload and done payload
// The payload type of started action is
// {
//    username: string,
//    password: string,
// }
//
// The payload type of done action is
// {
//     name: string,
//     age: number,
// }
const login = actionCreator<
{
	username: string,
    password: string,
},
{
	name: string,
    age: number,
}>('login');

// Trigger an started action
login.started.dispatch({
	username: 'zhangsan',
    password: 'admin@123',
});

// Trigger an done action
login.done.dispatch({
	params: payload,
    result: result,
});

```
### sagaCreator(action, handle)
Create an saga, the saga will be actived while action trigged. The `action` is an action object created by `actionCreator`, the `handle` is a **generaor**.

The defination of `handle` is:
``` js
function*(payload, getState, action){}
```
* payload: The data of triggered action
* getState: State getter
* action: The triggered action

There are some default saga helpers from **redux-saga**.
* latest(action, handle)：Wrapped `takeLatest`
* every(action, handle)：Wrapped `takeEvenry`
* throttle(action, time, handle)：Wrapped `throttle`

``` js
const sagaFromLatest = sagaCreator(action, handle);
const sagaFromEvery = sagaCreator.evenry(action, handle);
const sagaFromThrottle = sagaCreator.throttle(action, 1000, handle);

```

The result of sagaCreator (or helpers) has the property as bellow:
* saga: The actual saga
* handle: The raw generator from arguments

Example:

``` js
// Create an action
const appStart = actionCreator<string>('appStart');
// Create saga handler of action
const sagaAppStart = sagaCreator(appStart, function*(payload, getState) {
	// Do the async task
	const result0 = yield ...;
    // Do the async task
    const result1 = yield ...;
    // Do something else
    ...
});

// Or an async action
const login = actionCreator<
{
	username: string,
    password: string,
},
{
	name: string,
    age: number,
}>('login');

const sagaLogin = sagaCreator(login.started, function*(payload, getState) {
	// loginAPI will use username and password
    // and return a promise
	const result = yield loginAPI(payload);

    // Trigger the done event
    login.done.dispatch({
    	params: payload,
        result: result,
    });
})
```

### reducerCreator(initState, action, reducer)
Create a reducer. The arguments as bellow:
* initState: Initial state of this reducer
* action: The related action object
* reducer: Reducer handle, has the defination`(state, payload, action) => state`
	* state: The old state
	* payload: Data with the triggered action
	* action: The triggered action

Example:

``` js
// Create a reducer will be called when login.done triggered.
// The reducer just return the payload of this action.
const userInfo = reducerCreator({ name: '', age: 0}, login.done, (state, payload, action) => {
	return payload.result;
});
```


### reducersCreator(initState)
Create a reducer who can handle mutiple action types. The result can use `case(action, handle)` to declare action handle branch.

Example:

``` js
// Create a reducer will be called when login.done or login.started triggered.
const userInfo = reducersCreator({ name: '', age: 0})
.case(login.started, (state, payload, action) => {
	// Reset state when started action
	return {
    	name: '',
        age: 0,
    };
})
.case(login.done, (state, payload, action) => {
	// Record the data when done action
	return payload.result;
});
```

### axr(action, handle, reducer)
Create a axr object. An axr object has these information:
* action: A `map`, include the whole action objects
* handler: An `array`, include the whole sagas
* reducer: A `map`, include the whole reducers

The key of action map is what used to dispatch action.
``` js
axrObject.action.appStart()
// or
axrObject.action.appStart.dispatch();
```

The key of reducer map is the property name in global state of store.

Example:

``` js
export default axr(
{
	// Use axr.action.appStart and axr.action.login
	appStart,
    login,
},
[
	sagaAppStart,
    sagaLogin,
],
{
	// Use state.userInfo to get the data
	userInfo,
}
);
```

### axrCombine(axr,[axr...])
Combine mutiple axr objects as a big axr object. If there is name conflict in action or reducer, will throw an error.

`axrCombine` is the method to modulize our AXR source code.
```
// The directories
// The AXR in root will combine the sub directories's AXR (a and b)
root
	AXR
    	export axrCombine(aAXR, bAXR...)
    a
    	AXR
        	export axr()
    b
    	AXR
        	export axr()
	...
```

Example:

``` js
export default axrCombine(
	commonAXR,
    loginAXR,
    ...
);
```

### axrSetOptions(options)
Setup AXR, the `options` must provide:
* dispatch: Action dispatch function, the same as **redux** `dispatch(action) => action`
* getState: State getter function, the same as **redux** `getState() => state`

Example:

``` js
axrSetOptions({
    getState: () => {
        return app().axrState();
    },
    dispatch: (action) => {
        return app().axrDispatch(action);
    }
});
```

