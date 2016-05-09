import React, { cloneElement, Component, PropTypes } from 'react';
import { sendToBg } from 'crossmessaging';
import styles from 'remotedev-app/lib/styles';
import DevTools from 'remotedev-app/lib/containers/DevTools';
import Instances from 'remotedev-app/lib/components/Instances';
import Button from 'remotedev-app/lib/components/Button';
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import SettingsIcon from 'react-icons/lib/md/settings';
import LeftIcon from 'react-icons/lib/md/border-left';
import RightIcon from 'react-icons/lib/md/border-right';
import BottomIcon from 'react-icons/lib/md/border-bottom';
import RemoteIcon from 'react-icons/lib/go/radio-tower';

let monitorPosition;
if (location.hash) monitorPosition = location.hash.substr(location.hash.indexOf('-') + 1);

export default class App extends Component {
  static propTypes = {
    store: PropTypes.object
  };

  state = {
    dispatcherIsOpen: false
  };

  handleSelectInstance = e => {
    this.props.store.setInstance(e.target.value);
  };

  openWindow = (position) => {
    sendToBg({ type: 'OPEN', position });
  };

  toggleDispatcher = () => {
    this.setState({ dispatcherIsOpen: !this.state.dispatcherIsOpen });
  };

  render() {
    const { store } = this.props;
    const instances = store.instances;
    const monitor = location.hash && location.hash.substr(1).split('/')[0];
    return (
      <div style={styles.container}>
        {instances &&
          <div style={styles.buttonBar}>
           <Instances instances={instances} onSelect={this.handleSelectInstance}/>
          </div>
        }
        <DevTools monitor={monitor} store={store} key={`${monitor}-${store.instance}`} />
        {this.state.dispatcherIsOpen &&
          <DevTools monitor="DispatchMonitor"
            store={store} dispatchFn={store.dispatch}
            key={`Dispatch-${store.instance}`}
          />
        }
        <div style={styles.buttonBar}>
          {monitorPosition !== 'left' &&
            <Button
              Icon={LeftIcon}
              onClick={() => { this.openWindow('left'); }}
            />
          }
          {monitorPosition !== 'right' &&
            <Button
              Icon={RightIcon}
              onClick={() => { this.openWindow('right'); }}
            />
          }
          {monitorPosition !== 'bottom' &&
            <Button
              Icon={BottomIcon}
              onClick={() => { this.openWindow('bottom'); }}
            />
          }
          <DispatcherButton
            dispatcherIsOpen={this.state.dispatcherIsOpen} onClick={this.toggleDispatcher}
          />
          <ImportButton importState={store.importState} />
          <ExportButton exportState={store.getState} />
          <Button
            Icon={RemoteIcon}
            onClick={() => { this.openWindow('remote'); }}
          >Remote</Button>
          {chrome.runtime.openOptionsPage &&
            <Button
              Icon={SettingsIcon}
              onClick={() => { chrome.runtime.openOptionsPage(); }}
            >Settings</Button>
          }
        </div>
      </div>
    );
  }
}
