import React, { cloneElement, Component, PropTypes } from 'react';
import { sendToBg } from 'crossmessaging';
import styles from 'remotedev-app/lib/styles';
import Instances from 'remotedev-app/lib/components/Instances';
import Button from 'remotedev-app/lib/components/Button';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import SettingsIcon from 'react-icons/lib/md/settings';
import LeftIcon from 'react-icons/lib/md/border-left';
import RightIcon from 'react-icons/lib/md/border-right';
import BottomIcon from 'react-icons/lib/md/border-bottom';
import RemoteIcon from 'react-icons/lib/go/radio-tower';
import Monitor from './Monitor';

let monitorPosition;
if (location.hash) monitorPosition = location.hash.substr(location.hash.indexOf('-') + 1);

export default class App extends Component {
  static propTypes = {
    store: PropTypes.object
  };

  static update = () => ({});

  handleSelectInstance = e => {
    this.props.store.instance = e.target.value;
    this.props.store.setInstance(this.props.store.instance, true);
  };

  openWindow = (position) => {
    sendToBg({ type: 'OPEN', position });
  };

  render() {
    const { store, ...childProps } = this.props;
    return (
      <div style={styles.container}>
        {store.instances ?
          <div style={styles.buttonBar}>
           <Instances instances={store.instances} onSelect={this.handleSelectInstance}/>
          </div>
        : null }
        <Monitor {...childProps} />
        {chrome.runtime.openOptionsPage ?
          <div style={styles.buttonBar}>
            {monitorPosition !== 'left' ?
              <Button
                Icon={LeftIcon}
                onClick={() => { this.openWindow('left'); }}
              />
            : null }
            {monitorPosition !== 'right' ?
              <Button
                Icon={RightIcon}
                onClick={() => { this.openWindow('right'); }}
              />
            : null }
            {monitorPosition !== 'bottom' ?
              <Button
                Icon={BottomIcon}
                onClick={() => { this.openWindow('bottom'); }}
              />
            : null }
            <ImportButton importState={store && store.importState} />
            <ExportButton exportState={store.getState} />
            <Button
              Icon={RemoteIcon}
              onClick={() => { this.openWindow('remote'); }}
            >Remote</Button>
            <Button
              Icon={SettingsIcon}
              onClick={() => { chrome.runtime.openOptionsPage(); }}
            >Settings</Button>
          </div>
        : null }
      </div>
    );
  }
}
