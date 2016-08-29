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
### 1. With Redux
#### 1.1 Basic store
  
  If you have a basic [store](http://redux.js.org/docs/api/createStore.html) as described in the official [redux-docs](http://redux.js.org/index.html), simply replace:
  ```javascript
  let store = createStore(reducer);
  ```
  with
  ```javascript
  let store = createStore(reducer, window.devToolsExtension && window.devToolsExtension());
  ```

  Or with [initialState](http://redux.js.org/docs/api/createStore.html) but without middleware and enhancers arguments:
  
  ```javascript
  let store = createStore(reducer, initialState, 
    window.devToolsExtension && window.devToolsExtension()
  );
  ```

  Note: passing enhancer as last argument requires **redux@>=3.1.0**. For older versions apply it like [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/todomvc/store/configureStore.js) or [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/counter/store/configureStore.js#L7-L12).

#### 1.2 Advanced store setup
  If you setup your store with [middleware and enhancers](http://redux.js.org/docs/api/applyMiddleware.html), change this:
  ```javascript
  import { createStore, applyMiddleware, compose } from 'redux';
  
  let store = createStore(reducer, initialState, compose(
    applyMiddleware(...middleware)
  ));
  ```
  to this:
  ```javascript
  let store = createStore(reducer, initialState, compose(
    applyMiddleware(...middleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
  ```

#### 1.3 Together with Redux DevTools
  You can use this extension together with vanilla [Redux DevTools](https://github.com/gaearon/redux-devtools) as a fallback, but not both simultaneously:
  ```js
  window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument()
  ```
  
  [Make sure not to render DevTools when using the extension](https://github.com/zalmoxisus/redux-devtools-extension/issues/57) or you'll probably want to render the monitor from vanilla DevTools as follows: 
  ```js
  { !window.devToolsExtension ? <DevTools /> : null }
  ```
  
#### 1.4 Use with universal (isomorphic) apps
```javascript
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
```
#### 1.5 For React Native, hybrid, desktop and server side Redux apps
  Include [`Remote Redux DevTools`](https://github.com/zalmoxisus/remote-redux-devtools)'s store enhancer, and from the extension's context menu choose 'Open Remote DevTools' or press Alt+Shift+arrow up for remote monitoring.
  
### 2. For advanced usage with Redux or without it, see [our documentation](http://zalmoxisus.github.io/redux-devtools-extension/).

## Demo
Open these urls to test the extension:

 - [Counter](http://zalmoxisus.github.io/examples/counter/)
 - [TodoMVC](http://zalmoxisus.github.io/examples/todomvc/)
 - [Redux Form](http://erikras.github.io/redux-form/#/examples/simple)
 - [Redux Router](http://zalmoxisus.github.io/examples/router/)

Also you may run them from `./examples` folder.

## License

MIT

## Created By

If you like this, follow [@mdiordiev](https://twitter.com/mdiordiev) on twitter.
