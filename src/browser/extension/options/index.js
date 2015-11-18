import React from 'react';
import { render } from 'react-dom';
import getOptions from './getOptions';

const saveOption = e => {
  let obj = {};
  obj[e.target.id] = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
  chrome.storage.sync.set(obj);
};

const isValidRegex = str => {
  let isValid = true;
  try {
    new RegExp(str);
  } catch (e) {
    isValid = false;
  }
  return isValid;
};

const saveUrls = e => {
  let obj = {};
  const urls = e.target.value;
  urls.split('\n').forEach(function(url) {
    if (!isValidRegex(url)) return; // TODO: show an error message
  });
  obj[e.target.id] = urls;
  chrome.storage.sync.set(obj);
};

getOptions( items => {
  render(
    <div>
      <div className="input">
        <span className="caption">Maximum actions:</span>
        <input id="limit" type="text" defaultValue={items.limit} onChange={saveOption} />
        <span className="comment">(autocommit when exceeds, 0 - no limit)</span>
      </div>
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
      <div className="input">
        <span className="caption">Inject in all pages:</span>
        <input id="inject" type="checkbox" defaultChecked={items.inject} onChange={saveOption} />
        <span className="comment">(disable to allow only the urls bellow)</span>
      </div>
      <div className="input">
        <span className="caption">Pages urls to inject DevTools in (regex from new line):</span>
        <textarea onChange={saveUrls} id="urls" defaultValue={items.urls} />
      </div>
    </div>,
    document.getElementById('root')
  );
});
