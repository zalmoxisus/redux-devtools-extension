## Communicate with the extension directly

> Note that this API is still excremental and is subject to future changes. 

Use the following methods of `window.__REDUX_DEVTOOLS_EXTENSION__`:

- [open](#openposition)
- [notifyErrors](#notifyerrorsonerror)
- [send](#listenonmessage-instanceid)
- [connect](#connectconfig)
- [disconnect](#disconnect)

### open([position])

Open monitor window. 

##### Arguments

- [`position`] *String* - window position: `left`, `right`, `bottom`. Also can be `panel` to [open it in a Chrome panel](../FAQ.md#how-to-keep-devtools-window-focused-all-the-time-in-a-chrome-panel). Or `remote` to [open remote monitor](../FAQ.md#how-to-get-it-work-with-webworkers-react-native-hybrid-desktop-and-server-side-apps). By default is `left`.

### notifyErrors([onError])

Show notifications for uncaught exceptions.

##### Arguments

- [`onError`] *Function* to call when there's an exceptions.

### send(action, state, [shouldStringify, instanceId])

Send a new action and state manually to be shown on the monitor.

##### Arguments

- `action` *String* (action type) or *Object* with required `type` key.
- `state` *any* - usually object to expand. 
- [`shouldStringify`] *Boolean* - indicates whether to serialize `action` and `state`.
- [`instanceId`] *String* - instance id for which to attach the log.  

### listen(onMessage, instanceId)

Send a new action and state manually to be shown on the monitor.

##### Arguments

- `onMessage` *Function* to call when there's an action form the monitor.
- `instanceId` *String* - instance id for which to handle actions.  

### connect([config])

##### Arguments

- [`config`] *Object* intended to be the same as for [Redux store enhancer](Arguments.md#windowdevtoolsextensionconfig). For now only `instanceId` and `shouldStringify` should be specified.

##### Returns
*Object* containing the following methods:

- `subscribe(listener)` - adds a change listener. It will be called any time an action is dispatched form the monitor.
- `unsubscribe()` - unsubscribes the change listener. You can use [window.__REDUX_DEVTOOLS_EXTENSION__.disconnect](#disconnect) to remove all listeners.
- `send(action, state)` - sends a new action and state manually to be shown on the monitor. If action is `null` then we suppose we send `liftedState`. 
- `init(state)` - sends the initial state to the monitor.
- `error(message)` - sends the error message to be shown in Dispatcher monitor.

Example of usage:

```js
let isStarted = false;
let isLiftedAction = false;

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
devTools.subscribe((message) => {
  if (message.type === 'START') {
    isStarted = true;
    devTools.send(null, store.liftedStore.getState());
  } else if (message.type === 'STOP') {
    isStarted = false;
  } else if (message.type === 'DISPATCH' && message.payload.type !== 'JUMP_TO_STATE') {
    isLiftedAction = true;
    store.liftedStore.dispatch(message.payload);
  } else if (message.type === 'ACTION') { // Received a store action from Dispatch monitor
    store.dispatch(message.payload);
  } 
});

store.subscribe(() => {
  if (!isStarted) return;
  const liftedState = store.liftedStore.getState();
  if (isLiftedAction) { devTools.send(null, liftedState); isLiftedAction = false; }
  else devTools.send(liftedState.actionsById[liftedState.nextActionId - 1], store.getState());
});
```

There's [a simpler example](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/examples/react-counter-messaging/components/Counter.js).

[See the post for more details](https://medium.com/@zalmoxis/redux-devtools-without-redux-or-how-to-have-a-predictable-state-with-any-architecture-61c5f5a7716f).

### disconnect()

Remove extensions listener and disconnect extensions background script connection.
