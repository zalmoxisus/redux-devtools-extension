import React, { Component, PropTypes } from 'react';

class Provider extends Component {
  static childContextTypes = {
    store: React.PropTypes.any
  };
  getChildContext() {
    return {store: this.props.store};
  }
  render() {
    return <div>{this.props.children}</div>;
  }
}

Provider.propTypes = {
  store: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};

export default Provider;
