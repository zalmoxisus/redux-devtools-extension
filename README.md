# Redux DevTools Extension

[![Join the chat at https://gitter.im/zalmoxisus/redux-devtools-extension](https://badges.gitter.im/zalmoxisus/redux-devtools-extension.svg)](https://gitter.im/zalmoxisus/redux-devtools-extension?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![Demo](https://cloud.githubusercontent.com/assets/7957859/18002950/aacb82fc-6b93-11e6-9ae9-609862c18302.png)

## Installation

### 1. For Chrome
 - from [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
 - or build it with `npm i && npm run build:extension` and [load the extension's folder](https://developer.chrome.com/extensions/getstarted#unpacked) `./build/extension`
 - or run it in dev mode with `npm i && npm start` and [load the extension's folder](https://developer.chrome.com/extensions/getstarted#unpacked) `./dev`.

### 2. For Firefox
 - from [AMO](https://addons.mozilla.org/en-US/firefox/addon/remotedev/)
 - or build it with `npm i && npm run build:firefox` and [load the extension's folder](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox) `./build/firefox` (just select a file from inside the dir).

### 3. For Electron
  - just specify `REDUX_DEVTOOLS` in [`electron-devtools-installer`](https://github.com/GPMDP/electron-devtools-installer).

### 4. For other browsers and non-browser environment
  - use [`remote-redux-devtools`](https://github.com/zalmoxisus/remote-redux-devtools). 

## Usage

> Note that before v2.7, instead of `window.__REDUX_DEVTOOLS_EXTENSION__` / `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`, it was used `window.devToolsExtension`, which is [being deprecated](https://github.com/zalmoxisus/redux-devtools-extension/issues/220). 

### 1. With Redux
#### 1.1 Basic store
  
  If you have a basic [store](http://redux.js.org/docs/api/createStore.html) as described in the official [redux-docs](http://redux.js.org/index.html), simply replace:
  ```javascript
  const store = createStore(reducer);
  ```
  with
  ```javascript
  const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  ```

  Or with [preloadedState](http://redux.js.org/docs/api/createStore.html) but without middleware and enhancers arguments:
  
  ```javascript
  const store = createStore(reducer, preloadedState, 
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  ```

  Note: passing enhancer as last argument requires **redux@>=3.1.0**. For older versions apply it like [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/todomvc/store/configureStore.js) or [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/counter/store/configureStore.js#L7-L12).
  
  Warning: Don't mix the old Redux API with the new one. Pass enhancers and applyMiddleware as last createStore argument.

#### 1.2 Advanced store setup
  If you setup your store with [middleware and enhancers](http://redux.js.org/docs/api/applyMiddleware.html), change this:
  ```javascript
  import { createStore, applyMiddleware, compose } from 'redux';
  
  const store = createStore(reducer, preloadedState, compose(
    applyMiddleware(...middleware)
  ));
  ```
  to:
  ```javascript
  import { createStore, applyMiddleware, compose } from 'redux';
   
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(reducer, preloadedState, composeEnhancers(
    applyMiddleware(...middleware)
  ));
  ```
  When the extension is not installed, we’re using Redux compose here.
  
  In case you don’t want to allow the extension in production, [envify the code](https://github.com/gaearon/redux-devtools/blob/master/docs/Walkthrough.md#exclude-devtools-from-production-builds) and add `process.env.NODE_ENV !== 'production' && ` before `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`.
  
  To specify [extension’s options](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#windowdevtoolsextensionconfig) use it like that:
  ```js
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify here name, actionsBlacklist, actionsCreators and other options
      }) : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(...middleware),
    // other store enhancers if any
  );
  const store = createStore(reducer, enhancer);
  ```
  
  [See the post for more details](https://medium.com/@zalmoxis/improve-your-development-workflow-with-redux-devtools-extension-f0379227ff83).

#### 1.3 Use `redux-devtools-extension` package from npm

  To make things easier, there's a npm package to install:
  ```
  npm install --save redux-devtools-extension
  ```
  and to use like that:
  ```js
  import { createStore, applyMiddleware } from 'redux';
  import { composeWithDevTools } from 'redux-devtools-extension';

  const store = createStore(reducer, composeWithDevTools(
    applyMiddleware(...middleware),
    // other store enhancers if any
  ));
  ```
  or if needed to apply [extension’s options](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#windowdevtoolsextensionconfig):
  ```js
  import { createStore, applyMiddleware } from 'redux';
  import { composeWithDevTools } from 'redux-devtools-extension';

  const composeEnhancers = composeWithDevTools({
    // Specify here name, actionsBlacklist, actionsCreators and other options
  });
  const store = createStore(reducer, composeEnhancers(
    applyMiddleware(...middleware),
    // other store enhancers if any
  ));
  ```  
  There’re just [few lines of code](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/npm-package/index.js). If you don’t want to allow the extension in production, just use ‘redux-devtools-extension/developmentOnly’ instead of ‘redux-devtools-extension’.

#### 1.5 For React Native, hybrid, desktop and server side Redux apps
  Include [`Remote Redux DevTools`](https://github.com/zalmoxisus/remote-redux-devtools)'s store enhancer, and from the extension's context menu choose 'Open Remote DevTools' or press Alt+Shift+arrow up for remote monitoring.
  
### 2. Without Redux
  See [the post](https://medium.com/@zalmoxis/redux-devtools-without-redux-or-how-to-have-a-predictable-state-with-any-architecture-61c5f5a7716f) for more details on how to use the extension with any architecture.
  
## API Reference
  - [Parameters](docs/API/Arguments.md)
  - [Methods](docs/API/Methods.md)
  - [Create Redux store right in the extension](docs/API/Methods.md).

## Demo
Open these urls to test the extension:

 - [Counter](http://zalmoxisus.github.io/examples/counter/)
 - [TodoMVC](http://zalmoxisus.github.io/examples/todomvc/)
 - [Redux Router](http://zalmoxisus.github.io/examples/router/)
 - [Redux Form](http://erikras.github.io/redux-form/#/examples/simple)

Also you may run them from `./examples` folder.

## License

MIT

## Created By

If you like this, follow [@mdiordiev](https://twitter.com/mdiordiev) on twitter.
