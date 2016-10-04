# Troubleshooting

### I just see empty log or "No store found"

Make sure you [applied the enhancer](https://github.com/zalmoxisus/redux-devtools-extension#2-use-with-redux). Note that passing enhancer as last argument requires redux@>=3.1.0. For older versions apply it like [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/todomvc/store/configureStore.js) or [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/counter/store/configureStore.js#L7-L12).

Don't mix the old Redux API with the new one. Pass enhancers and applyMiddleware as last createStore argument.

### Access file url (`file:///`) 

If you develop on your local filesystem, make sure to allow Redux DevTools access to `file:///` URLs in the settings of this extension:

<img width="746" alt="extensions" src="https://cloud.githubusercontent.com/assets/7957859/19075220/a0fad99e-8a4c-11e6-8b87-757f2dc179cb.png">

### It shows only the `@@INIT` action or moving back and forth doesn't update the state

Most likely you mutate the state. Check it by [adding `redux-immutable-state-invariant` middleware](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/examples/counter/store/configureStore.js#L3).
