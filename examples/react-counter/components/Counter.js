import React, { Component, PropTypes } from 'react';

const withDevTools = (
  // process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' && window.devToolsExtension
);

const reducer = (state = { counter: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { counter: state.counter + 1 };
    case 'DECREMENT':
      return { counter: state.counter - 1 };
    default:
      return state;
  }
};

class Counter extends Component {
  constructor() {
    super();
    this.state = { counter: 0 };
    
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
  }

  componentWillMount() {
    if (withDevTools) {
      this.store = window.devToolsExtension(reducer);
      this.store.subscribe(() => { this.setState(this.store.getState()); });
    }
  }

  dispatch(action) {
    if (withDevTools) this.store.dispatch(action);
    else this.setState(reducer(this.state, action));
  }

  increment() {
    this.dispatch({ type: 'INCREMENT' });
  }

  decrement() {
    this.dispatch({ type: 'DECREMENT' });
  }

  render() {
    const { counter } = this.state;
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={this.increment}>+</button>
        {' '}
        <button onClick={this.decrement}>-</button>
      </p>
    );
  }
}

export default Counter;
