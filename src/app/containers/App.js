import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { liftedDispatch } from 'remotedev-app/lib/actions';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';
import styles from 'remotedev-app/lib/styles';
import enhance from 'remotedev-app/lib/hoc';
import DevTools from 'remotedev-app/lib/containers/DevTools';
import Dispatcher from 'remotedev-app/lib/containers/monitors/Dispatcher';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import Notification from 'remotedev-app/lib/components/Notification';
import Instances from 'remotedev-app/lib/components/Instances';
import Button from 'remotedev-app/lib/components/Button';
import RecordButton from 'remotedev-app/lib/components/buttons/RecordButton';
import LockButton from 'remotedev-app/lib/components/buttons/LockButton';
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import TestGenerator from 'remotedev-app/lib/components/TestGenerator';
import SettingsIcon from 'react-icons/lib/md/settings';
import LeftIcon from 'react-icons/lib/md/border-left';
import RightIcon from 'react-icons/lib/md/border-right';
import BottomIcon from 'react-icons/lib/md/border-bottom';
import RemoteIcon from 'react-icons/lib/go/radio-tower';
import Joyride from 'react-joyride';

@enhance
class App extends Component {
  componentDidUpdate() {
    if (this.featured) return;
    this.featured = true;
    chrome.storage.local.get({ featured: null }, options => {
      if (options.featured !== 'locking') this.joyride.start();
    });
  }

  toolTipCb(status) {
    if (status.type === 'finished') {
      chrome.storage.local.set({ featured: 'locking' });
    }
  }

  openWindow = (position) => {
    chrome.runtime.sendMessage({ type: 'OPEN', position });
  };

  render() {
    const {
      monitor, position,
      dispatcherIsOpen, sliderIsOpen, options, liftedState
    } = this.props;
    const isRedux = options.lib === 'redux';
    return (
      <div style={styles.container}>
        <Joyride
          ref={node => this.joyride = node}
          steps={[{
            title: 'New features added',
            text: '<a href="https://medium.com/@zalmoxis/f0379227ff83" target="_blank">See details...</a>',
            selector: '#toolTipButton',
            position: 'top-left',
            event: 'hover',
            style: {
              backgroundColor: 'rgba(79, 90, 101, 0.7)',
              color: '#fff',
              mainColor: 'rgb(79, 90, 101)',
              width: '200px',
              beacon: {
                offsetY: 5,
                inner: '#c2eee9',
                outer: '#c2eee9'
              }
            }
          }]}
          callback={this.toolTipCb}
        />
        <div style={styles.buttonBar}>
          <MonitorSelector selected={monitor}/>
          <Instances selected={this.props.selected} />
        </div>
        <DevTools
          monitor={monitor}
          liftedState={liftedState}
          dispatch={this.props.liftedDispatch}
          testComponent={isRedux && TestGenerator}
        />
        <Notification />
        {sliderIsOpen && <div style={styles.sliderMonitor}>
          <DevTools
            monitor="SliderMonitor"
            liftedState={liftedState}
            dispatch={this.props.liftedDispatch}
          />
        </div>}
        {dispatcherIsOpen && options.connectionId &&
          <Dispatcher options={options} />
        }
        <div style={styles.buttonBar}>
          {!window.isElectron && position !== 'left' &&
          <Button
            Icon={LeftIcon}
            onClick={() => { this.openWindow('left'); }}
          />
          }
          {!window.isElectron && position !== 'right' &&
          <Button
            Icon={RightIcon}
            onClick={() => { this.openWindow('right'); }}
          />
          }
          {!window.isElectron && position !== 'bottom' &&
          <Button
            Icon={BottomIcon}
            onClick={() => { this.openWindow('bottom'); }}
          />
          }
          {isRedux &&
            <RecordButton paused={liftedState.isPaused} />
          }
          {isRedux &&
            <LockButton locked={liftedState.isLocked} />
          }
          <DispatcherButton dispatcherIsOpen={dispatcherIsOpen} />
          <SliderButton isOpen={sliderIsOpen} />
          <ImportButton />
          <ExportButton liftedState={liftedState} />
          {!window.isElectron &&
          <Button
            Icon={RemoteIcon}
            onClick={() => { this.openWindow('remote'); }}
          >Remote</Button>
          }
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

App.propTypes = {
  bgStore: PropTypes.object,
  liftedDispatch: PropTypes.func.isRequired,
  selected: PropTypes.string,
  liftedState: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  monitor: PropTypes.string,
  position: PropTypes.string,
  dispatcherIsOpen: PropTypes.bool,
  sliderIsOpen: PropTypes.bool
};

function mapStateToProps(state) {
  const instances = state.instances;
  const id = getActiveInstance(instances);
  return {
    selected: instances.selected,
    liftedState: instances.states[id],
    options: instances.options[id],
    monitor: state.monitor.selected,
    dispatcherIsOpen: state.monitor.dispatcherIsOpen,
    sliderIsOpen: state.monitor.sliderIsOpen,
    shouldSync: state.instances.sync
  };
}

function mapDispatchToProps(dispatch) {
  return { liftedDispatch: bindActionCreators(liftedDispatch, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
