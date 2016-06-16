# Redux DevTools Extension FAQ

#### How to get it work
- Test the extension with [Counter](http://zalmoxisus.github.io/redux-devtools-extension/examples/counter/) or [TodoMVC](http://zalmoxisus.github.io/redux-devtools-extension/examples/todomvc/) demo.
- Reload the extension on the extensions page (`chrome://extensions/`).
- If something goes wrong, [open an issue](https://github.com/zalmoxisus/redux-devtools-extension/issues) or tweet me: [@mdiordiev](https://twitter.com/mdiordiev).

#### How to filter actions
On the options page you may enable actions filtering and specify either actions to be hidden or shown in DevTools. If the latter is specified, other than those actions will be hidden.
You can overwrite theese settings for an individual project using `actionsBlacklist` and `actionsWhitelist` [config options](#API).
#### How to disable/enable it in production
On the options page you may enable the extension to be injected in all pages or you may specify the pages urls to be injected in. Use regex values and new line as a separator. A good practice would be to add a condition for including the extension - a variable in localStorage or a url query, which will use only the developers.
#### How to persist debug sessions across page reloads
Just add `?debug_session=<session_name>` to the url.
#### How to include it in chrome apps and extensions
Unlike web apps, Chrome extension doesn't inject anything in other chrome extensions or apps, so you have to do it by yourself to allow debugging. Just add:
```
<script src="chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/inject.bundle.js"></script>
```
To include it in a chrome extension's content script follow [the example](https://github.com/zalmoxisus/browser-redux/commit/df2db9ee11f2d197c4329b2c8a6e197da1edffd4). 
#### How to open DevTools programmatically
```js
window.devToolsExtension.open();
```
#### How to keep DevTools window focused all the time in a chrome panel
To enable chrome panels feature in Chrome, type in `chrome://flags/#enable-panels` in the url bar and click on "enable" under "enable panels". Make sure to click on "relaunch now " at the bottom of the page, to take effect.
#### How to include DevTools in the page
You can open DevTools in a new window (by opening context menu with right mouse click), from popup (clicking on the browser action button) or from Chrome dev panel. If you still, for some reason, want to include it directly in your page, load the following url in iframe: `chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/window.html`. You'd probably include it in a docker or in a resizeable component.
#### How to enable/disable errors notifying
Just find `Redux DevTools` on the extensions page (`chrome://extensions/`) and click the `Options` link to customize everything. The errors notifying is enabled by default, but it works only when the store enhancer is called (in order not to show notifications for any sites you visit). In case you want notifications for a non-redux app, init it explicitly by calling `window.devToolsExtension.notifyErrors()` (probably you'll check if `window.devToolsExtension` exists before calling it).
#### How to get it work with WebWorkers, React Native, hybrid, desktop and server side apps
Of course, it is not possible to inject extension's script there and to communicate directly. To solve this we use [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools). Just find `Remote` button or press `Alt`+`Shift`+`arrow up` for remote monitoring. 
#### Keyboard shortcuts
Use `Cmd`+`Ctrl`+Arrows for OSX and `Alt`+`Shift`+Arrows for Windows, Linux and ChromeOS. Arrow down, left and right indicate the position of the DevTools window. Use `arrow up` to open Remote monitoring to communicate with [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools). To change the shortcuts, click "Keyboard shortcuts" button on the bottom of the extensions page (`chrome://extensions/`).
#### How to change keyboard shortcuts
On the bottom of `chrome://extensions/` page there's a "Keyboard shortcuts" link where you can customize the extension's shortcuts.
