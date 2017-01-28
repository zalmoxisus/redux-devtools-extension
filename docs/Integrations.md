# Integrations for different languages and frameworks

Mostly functional:
- [Angular @ngrx/store](#angular-ngrxstore)
- [Cycle](#cycle)
- [Ember](#ember)
- [Fable](#fable)
- [Freezer](#freezer)
- [Mobx](#mobx)
- [PureScript](#purescript)

In progress:
- [ClojureScript](#clojurescript)
- [Horizon](#horizon)
- [Python](#python)
- [Swift](#swift)


### [Mobx](https://github.com/mobxjs/mobx)
#### [`mobx-remotedev`](https://github.com/toranb/ember-redux)
```js
import remotedev from 'mobx-remotedev';
// or import remotedev from 'mobx-remotedev/lib/dev'
// in case you want to use it in production or don't have process.env.NODE_ENV === 'development'

const appStore = observable({
  // ...
});

// Or
class appStore {
    // ...
}

export default remotedev(appStore);
````

### [Angular @ngrx/store](https://github.com/ngrx/store)
#### [`@ngrx/store-devtools`](https://github.com/ngrx/store-devtools)
```js
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  imports: [
    StoreModule.provideStore(rootReducer),
    // Note that you must instrument after importing StoreModule
    StoreDevtoolsModule.instrumentOnlyWithExtension({
      maxAge: 5
    })
  ]
})
export class AppModule { }
```

[`Example of integration`](https://github.com/ngrx/example-app) ([live demo](http://ngrx.github.io/example-app)).

### [Ember](http://emberjs.com/)
#### [`ember-redux`](https://github.com/toranb/ember-redux)
```js
//app/enhancers/index.js
import redux from 'npm:redux';
var devtools = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : noop => noop;
export default redux.compose(devtools);
```

### [Cycle](https://github.com/cyclejs/cyclejs)
#### [`@culli/store`](https://github.com/milankinen/culli/tree/master/packages/store)
```js
import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM} from "@cycle/dom"
import Store, {ReduxDevtools} from "@culli/store"
import App, {newId} from "./App"


run(App, {
  DOM: DOM("#app"),
  Store: Store(ReduxDevtools({items: [{id: newId(), num: 0}, {id: newId(), num: 0}]}))
})
```

### [Freezer](https://github.com/arqex/freezer)
#### [`freezer-redux-devtools`](https://github.com/arqex/freezer-redux-devtools)
```js
import React, { Component } from 'react';
import { supportChromeExtension } from 'freezer-redux-devtools/freezer-redux-middleware';
import Freezer from 'freezer-js';

// Our state is a freezer object
var State = new Freezer({hello: 'world'});

// Enable the extension
supportChromeExtension( State );
```

### [Horizon](https://github.com/rethinkdb/horizon)
#### [`horizon-remotedev`](https://github.com/zalmoxisus/horizon-remotedev)
```js
// import hzRemotedev from 'horizon-remotedev';
// or import hzRemotedev from 'horizon-remotedev/lib/dev'
// in case you want to use it in production or don't have process.env.NODE_ENV === 'development'

//Setup Horizon connection
const horizon = Horizon();

// ...
// Specify the horizon instance to monitor 
hzRemotedev(horizon("react_messages"))
```

### [Fable](https://github.com/fable-compiler/Fable)
#### [`purescript-react-redux`](fable-elmish)
```fsharp
open Elmish.Debug

Program.mkProgram init update view
|> Program.withDebugger // connect to a devtools monitor via Chrome extension if available
|> Program.run

```

or

```fsharp
open Elmish.Debug

Program.mkProgram init update view
|> Program.withDebuggerAt (Remote("localhost",8000)) // connect to a server running on localhost:8000
|> Program.run
```

### [PureScript](https://github.com/purescript/purescript)
#### [`purescript-react-redux`](https://github.com/ethul/purescript-react-redux)
[`Example of integration`](https://github.com/ethul/purescript-react-redux-example).

### [ClojureScript](https://github.com/clojure/clojurescript)
[`Example of integration`](http://gitlab.xet.ru:9999/publicpr/clojurescript-redux/tree/master#dev-setup)

### [Python](https://www.python.org/)
#### [`pyredux`](https://github.com/peterpeter5/pyredux)
[WIP](https://github.com/zalmoxisus/remotedev-server/issues/34)

### [Swift](https://github.com/apple/swift)
#### [`katana-swift`](https://github.com/BendingSpoons/katana-swift)
[WIP](https://github.com/zalmoxisus/redux-devtools-extension/issues/288)
