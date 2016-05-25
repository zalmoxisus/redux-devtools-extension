import React, { cloneElement, Component, PropTypes } from 'react';
import styles from 'remotedev-app/lib/styles';
import enhance from 'remotedev-app/lib/hoc';
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

const monitorPosition = location.hash;

// Mock localStorage when it is not allowed
let localStorage;
try {
  localStorage = window.localStorage;
} catch (error) {
  localStorage = {
    getItem: key => undefined,
    setItem: () => {}
  };
}

@enhance
export default class App extends Component {
  static propTypes = {
    store: PropTypes.object
  };

  state = {
    monitor: localStorage.getItem('monitor' + monitorPosition),
    instance: 'auto',
    dispatcherIsOpen: false,
    sliderIsOpen: false
  };

  handleSelectMonitor = (event, index, value) => {
    this.setState({ monitor: value });
    localStorage.setItem('monitor' + monitorPosition, value);
  };

  handleSelectInstance = (event, index, value) => {
    this.setState({ instance: value });
    this.props.store.setInstance(value);
  };

  openWindow = (position) => {
    chrome.runtime.sendMessage({ type: 'OPEN', position });
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
    const { instance, monitor } = this.state;
    return (
      <div style={styles.container}>
          <div style={styles.buttonBar}>
            <MonitorSelector selected={this.state.monitor} onSelect={this.handleSelectMonitor}/>
            {instances &&
              <Instances instances={instances} onSelect={this.handleSelectInstance} selected={instance} />
            }
          </div>
        <DevTools monitor={monitor} store={store} key={`${monitor}-${instance}`} />
        {this.state.sliderIsOpen && <div style={styles.sliderMonitor}>
          <DevTools monitor="SliderMonitor" store={store} key={`Slider-${instance}`} />
        </div>}
        {this.state.dispatcherIsOpen &&
          <DevTools monitor="DispatchMonitor"
            store={store} dispatchFn={store.dispatch}
            key={`Dispatch-${instance}`}
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
          <ImportButton importState={store.liftedStore.importState} />
          <ExportButton exportState={store.liftedStore.getState} />
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
