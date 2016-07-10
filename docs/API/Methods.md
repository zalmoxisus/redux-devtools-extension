## Communicate with the extension directly

Use the following methods of `window.devToolsExtension`:

- [open](#windowdevtoolsextensionopenposition)
- [notifyErrors](#windowdevtoolsextensionnotifyerrorsonerror)
- [send](#windowdevtoolsextensionlistenonmessage-instanceid)
- [connect](#windowdevtoolsextensionconnectconfig)
- [disconnect](#windowdevtoolsextensiondisconnect)

### window.devToolsExtension.open([position])

Open monitor window. 

##### Arguments

- [`position`] *String* - window position: `left`, `right`, `bottom`. Also can be `panel` to [open it in a Chrome panel](../docs/FAQ.md#how-to-keep-devtools-window-focused-all-the-time-in-a-chrome-panel). Or `remote` to [open remote monitor](..//docs/FAQ.md#how-to-get-it-work-with-webworkers-react-native-hybrid-desktop-and-server-side-apps). By default is `left`.

### window.devToolsExtension.notifyErrors([onError])

Show notifications for uncaught exceptions.

##### Arguments

- [`onError`] *Function* to call when there's an exceptions.

### window.devToolsExtension.updateStore(store, instanceId)

Specify a new `store` object to be used by the extension. For example, in case of Redux Saga we can use like this:
 
```js
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  compose(
    applyMiddleware(sagaMiddleware),
    window.devToolsExtension && window.devToolsExtension()
  )
);
sagaMiddleware.run(rootSaga);
if (window.devToolsExtension) window.devToolsExtension.updateStore(store);
```

##### Arguments

- `store` *Object* to update.
- [`instanceId`] *String* - instance id for which to update the store (in case your specified it in the config).  

### window.devToolsExtension.send(action, state, [shouldStringify, instanceId])

Send a new action and state manually to be shown on the monitor.

##### Arguments

- `action` *String* (action type) or *Object* with required `type` key.
- `state` *any* - usually object to expand. 
- [`shouldStringify`] *Boolean* - indicates whether to serialize `action` and `state`.
- [`instanceId`] *String* - instance id for which to attach the log.  

### window.devToolsExtension.listen(onMessage, instanceId)

Send a new action and state manually to be shown on the monitor.

##### Arguments

- `onMessage` *Function* to call when there's an action form the monitor.
- `instanceId` *String* - instance id for which to handle actions.  

### window.devToolsExtension.connect([config])

##### Arguments

- [`config`] *Object* intended to be the same as for [Redux store enhancer](Arguments.md#windowdevtoolsextensionconfig). For now only `instanceId` and `shouldStringify` should be specified.

##### Returns
*Object* containing the following methods:

- `subscribe(listener)` - adds a change listener. It will be called any time an action is dispatched form the monitor.
- `unsubscribe()` - unsubscribes the change listener. You can use [window.devToolsExtension.disconnect](#windowdevtoolsextensiondisconnect) to remove all listeners.
- `send(action, state)` - sends a new action and state manually to be shown on the monitor. If action is `null` then we suppose we send `liftedState`. 

[See the example for an example on usage](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/examples/react-counter-messaging/components/Counter.js).

### window.devToolsExtension.disconnect()

Remove extensions listener and disconnect extensions background script connection.
