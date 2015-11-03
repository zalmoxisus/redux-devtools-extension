# Redux DevTools Extension

![Demo](demo/v0.1.0.gif)

If you do not know what [Redux DevTools](https://github.com/gaearon/redux-devtools) is, [see Dan's React Europe talk](https://www.youtube.com/watch?v=xsSnOQynTHs)!

## Advantages

1. Simple implementation (only [1 line of code](https://github.com/zalmoxisus/redux-devtools-extension/commit/ffa804594008c585d28b3319bfcd4b87d5df384d) without importing anything!).
2. Having DevTools even in production without any drawbacks. 
2. Keeping the DevTools up to date (Chrome extension is updated automatically).
3. Having Redux DevTools in a page without window (Chrome extensions’ background page).
4. Using DevTools remotely for Chrome Mobile.

## Implementation

1. Get the extension
 - from [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
 - or build it with `npm i & npm run build:extension` and [load the extension's folder](https://developer.chrome.com/extensions/getstarted#unpacked) `./build/extension`
 - or run it in dev mode with `npm i & npm start` and [load the extension's folder](https://developer.chrome.com/extensions/getstarted#unpacked) `./dev`.
2. Use with your favorite Flux implementation
 - **[Redux](https://github.com/rackt/redux)**
    Just update your [configureStore](https://github.com/zalmoxisus/redux-devtools-extension/commit/ffa804594008c585d28b3319bfcd4b87d5df384d) as follows:
    ```javascript
    const store = createStore(rootReducer, initialState);
    ```
    becomes
    ```javascript
    const store = (window.devToolsExtension ? window.devToolsExtension(createStore) : createStore)(rootReducer, initialState);
    ```

    or
    ```javascript
        const finalCreateStore = compose(
          applyMiddleware(thunk),
          ...
        )(createStore);
    ```
    becomes
    ```javascript
    const finalCreateStore = compose(
      applyMiddleware(thunk),
      ...
      window.devToolsExtension || (f => f)
    )(createStore);
    ```
 - **[Freezer](https://github.com/arqex/freezer)**<br />
    Just use [supportChromeExtension](https://github.com/zalmoxisus/freezer-redux-devtools#using-redux-devtools-chrome-extension) from `freezer-redux-devtools/freezer-redux-middleware`.

## Examples
Open these urls to test the extension:

 - [Counter](http://zalmoxisus.github.io/redux-devtools-extension/examples/counter/)
 - [TodoMVC](http://zalmoxisus.github.io/redux-devtools-extension/examples/todomvc/)

Also you may run them from `./examples` folder (on port 4001 and 4002 by default).

## FAQ

 - **How to open Redux DevTools in a new window?**<br />
   Right click on the page and open it from the context menu.
 - **How to persist debug sessions across page reloads?**<br />
   Just add `?debug_session=<session_name>` to the url.
    
## Credits

 - Built with our [browser-redux](https://github.com/zalmoxisus/browser-redux) boilerplate.
 - Includes [Dan Abramov](https://github.com/gaearon)'s [redux-devtools](https://github.com/gaearon/redux-devtools).
 - Inspired from [Taylor Hakes](https://github.com/taylorhakes)' [work](https://github.com/taylorhakes/redux-devtools/tree/chrome-devtools).
 - [The logo icon](https://github.com/rackt/redux/issues/151#issuecomment-150060367) made by [Keith Yong](https://github.com/keithyong) .
 - Examples from [Redux](https://github.com/rackt/redux/tree/master/examples).

## Roadmap

- [x] Chrome extension.
- [ ] Firefox extension.
- [ ] Safari extension (simplified).

## LICENSE

[MIT](LICENSE)