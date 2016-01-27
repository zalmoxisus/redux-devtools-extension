import React, { cloneElement, Component, PropTypes } from 'react';
import styles from 'remotedev-app/lib/styles';
import Instances from 'remotedev-app/lib/components/Instances';

export default class App extends Component {
  static propTypes = {
    store: PropTypes.object,
    children: PropTypes.element
  };

  static update = () => ({});

  handleSelectInstance = e => {
    this.props.store.instance = e.target.value;
    this.props.store.setInstance(this.props.store.instance, true);
  };

  render() {
    const { store, children, ...childProps } = this.props;
    const Monitor = cloneElement(children, childProps);
    return (
      <div style={styles.container}>
        <div style={styles.buttonBar}>
          <Instances instances={store.instances} onSelect={this.handleSelectInstance}/>
        </div>
        { Monitor }
      </div>
    );
  }
}
