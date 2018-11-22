# Recipes

### Using in a typescript project

```js
const store = createStore(
  rootReducer,
  initialState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);
```
Note that you many need to set `no-any` to false in your `tslint.json` file.

### Export from browser console or from application

```js
store.liftedStore.getState()
```

The extension is not sharing `store` object, so you should take care of that.
