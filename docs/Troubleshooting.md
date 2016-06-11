# Troubleshooting

### I just see empty log or "No store found"

Make sure you [applied the enhancer](https://github.com/zalmoxisus/redux-devtools-extension#2-use-with-redux). Note that passing enhancer as last argument requires redux@>=3.1.0. For older versions apply it like [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/todomvc/store/configureStore.js) or [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/counter/store/configureStore.js#L7-L12).
