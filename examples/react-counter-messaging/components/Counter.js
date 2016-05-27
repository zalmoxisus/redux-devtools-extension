import React, { Component, PropTypes } from 'react';

const withDevTools = (
  // process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' && window.devToolsExtension
);

class Counter extends Component {
  constructor() {
    super();
    this.state = { counter: 0 };
    
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
  }

  componentWillMount() {
    if (withDevTools) {
      this.devTools = window.devToolsExtension.connect();
    }
  }

  componentWillUnmount() {
    if (withDevTools) {
      window.devToolsExtension.disconnect();
    }
  }

  increment() {
    const state = { counter: this.state.counter + 1 };
    if (withDevTools) this.devTools.send('increment', state);
    this.setState(state);
  }

  decrement() {
    const state = { counter: this.state.counter - 1 };
    if (withDevTools) this.devTools.send('decrement', state);
    this.setState(state);
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
