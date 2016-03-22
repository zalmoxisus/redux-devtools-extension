import React from 'react';

export const sideMonitors = [
  ['LogMonitor', 'Log Monitor'],
  ['DiffMonitor', 'Diff Monitor'],
  ['ChartMonitor', 'Chart Monitor']
];

export const bottomMonitors = [
  ['LogMonitor', 'Log Monitor'],
  ['SliderMonitor', 'Slider Monitor']
];

export default ({ elementClassName, type, value, onChange, id }) => (
  <select className={elementClassName} value={value} onChange={onChange} id={id}>{
    (type === 'bottom' ? bottomMonitors : sideMonitors).map(monitor => (
      <option key={monitor[0]} value={monitor[0]}>{monitor[1]}</option>
    ))
  }</select>
);
