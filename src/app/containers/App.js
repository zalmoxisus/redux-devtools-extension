import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { liftedDispatch } from 'remotedev-app/lib/actions';
import styles from 'remotedev-app/lib/styles';
import enhance from 'remotedev-app/lib/hoc';
import DevTools from 'remotedev-app/lib/containers/DevTools';
import Dispatcher from 'remotedev-app/lib/containers/monitors/Dispatcher';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import Notification from 'remotedev-app/lib/components/Notification';
import Instances from 'remotedev-app/lib/components/Instances';
import Button from 'remotedev-app/lib/components/Button';
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

@enhance
export default class App extends Component {
  static propTypes = {
    bgStore: PropTypes.object,
    liftedDispatch: PropTypes.func.isRequired,
    selected: PropTypes.string,
    liftedState: PropTypes.object.isRequired,
    options: PropTypes.object,
    monitor: PropTypes.string,
    monitorPosition: PropTypes.string,
    dispatcherIsOpen: PropTypes.bool,
    sliderIsOpen: PropTypes.bool,
    shouldSync: PropTypes.bool,
    testTemplates: PropTypes.array,
    useCodemirror: PropTypes.bool,
    selectedTemplate: PropTypes.number
  };

  componentWillMount() {
    this.testComponent = (props) => (
      !this.props.options ? null :
        <TestGenerator
          name={this.props.options.name}
          isRedux={this.props.options.isRedux}
          testTemplates={this.props.testTemplates}
          selectedTemplate={this.props.selectedTemplate}
          useCodemirror={this.props.useCodemirror}
          {...props}
        />
    );
  }

  openWindow = (position) => {
    chrome.runtime.sendMessage({ type: 'OPEN', position });
  };

  render() {
    const {
      monitor, monitorPosition,
      dispatcherIsOpen, sliderIsOpen, options, liftedState
    } = this.props;
    return (
      <div style={styles.container}>
        <div style={styles.buttonBar}>
          <MonitorSelector selected={monitor}/>
          <Instances selected={this.props.selected} />
        </div>
        <DevTools
          monitor={monitor}
          liftedState={liftedState}
          dispatch={this.props.liftedDispatch}
          testComponent={this.testComponent}
        />
        <Notification />
        {sliderIsOpen && <div style={styles.sliderMonitor}>
          <DevTools
            monitor="SliderMonitor"
            liftedState={liftedState}
            dispatch={this.props.liftedDispatch}
          />
        </div>}
        {dispatcherIsOpen && options &&
        <Dispatcher options={options} />
        }
        <div style={styles.buttonBar}>
          {!window.isElectron && monitorPosition !== 'left' &&
          <Button
            Icon={LeftIcon}
            onClick={() => { this.openWindow('left'); }}
          />
          }
          {!window.isElectron && monitorPosition !== 'right' &&
          <Button
            Icon={RightIcon}
            onClick={() => { this.openWindow('right'); }}
          />
          }
          {!window.isElectron && monitorPosition !== 'bottom' &&
          <Button
            Icon={BottomIcon}
            onClick={() => { this.openWindow('bottom'); }}
          />
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

function mapStateToProps(state) {
  const instances = state.instances;
  const selected = instances.selected;
  const id = selected || instances.current;
  return {
    selected,
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
