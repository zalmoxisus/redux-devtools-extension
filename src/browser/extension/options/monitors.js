import React from 'react';

export const sideMonitors = [
  ['LogMonitor', 'Log Monitor'],
  ['DiffMonitor', 'Diff Monitor'],
  ['ChartMonitor', 'Chart Monitor'],
  ['InspectorMonitor', 'Inspector Monitor']
];

export const bottomMonitors = [
  ['LogMonitor', 'Log Monitor'],
  ['SliderMonitor', 'Slider Monitor'],
  ['InspectorMonitor', 'Inspector Monitor']
];

export default ({ type, defaultValue, onChange, id }) => (
  <select defaultValue={defaultValue} onChange={onChange} id={id}>{
    (type === 'bottom' ? bottomMonitors : sideMonitors).map(monitor => (
      <option key={monitor[0]} value={monitor[0]}>{monitor[1]}</option>
    ))
  }</select>
);
