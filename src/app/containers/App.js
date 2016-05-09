import React, { cloneElement, Component, PropTypes } from 'react';
import { sendToBg } from 'crossmessaging';
import styles from 'remotedev-app/lib/styles';
import DevTools from 'remotedev-app/lib/containers/DevTools';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import Instances from 'remotedev-app/lib/components/Instances';
import Button from 'remotedev-app/lib/components/Button';
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
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
    monitor: location.hash && location.hash.substr(1).split('/')[0],
    dispatcherIsOpen: false,
    sliderIsOpen: false
  };

  handleSelectMonitor = e => {
    this.setState({ monitor: e.target.value });
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

  toggleSlider = () => {
    this.setState({ sliderIsOpen: !this.state.sliderIsOpen });
  };

  render() {
    const { store } = this.props;
    const instances = store.instances;
    const { monitor } = this.state;
    return (
      <div style={styles.container}>
        {instances &&
          <div style={styles.buttonBar}>
            <MonitorSelector selected={this.state.monitor} onSelect={this.handleSelectMonitor}/>
            <Instances instances={instances} onSelect={this.handleSelectInstance}/>
          </div>
        }
        <DevTools monitor={monitor} store={store} key={`${monitor}-${store.instance}`} />
        {this.state.sliderIsOpen && <div style={styles.sliderMonitor}>
          <DevTools monitor="SliderMonitor" store={store} key={`Slider-${store.instance}`} />
        </div>}
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
          <SliderButton isOpen={this.state.sliderIsOpen} onClick={this.toggleSlider} />
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
