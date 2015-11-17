import React from 'react';
import { render } from 'react-dom';
import getOptions from './getOptions';

const saveOption = e => {
  let obj = {};
  obj[e.target.id] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  chrome.storage.sync.set(obj);
}

getOptions( items => {
  render(
    <div>
      <div className="input">
        <span className="caption">Maximum delay:</span>
        <input id="timeout" type="text" defaultValue={items.timeout} onChange={saveOption} />
        <span className="comment">(seconds: bigger - better performance)</span>
      </div>
      <div className="input">
        <span className="caption">States serialization:</span>
        <input id="serialize" type="checkbox" defaultChecked={items.serialize} onChange={saveOption} />
        <span className="comment">(required for circular references)</span>
      </div>
    </div>,
    document.getElementById('root')
  );
});
