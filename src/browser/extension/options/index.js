import React from 'react';
import { render } from 'react-dom';

chrome.runtime.getBackgroundPage( background => {
  const syncOptions = background.syncOptions;

  const saveOption = e => {
    let value;
    if (e.target.type === 'checkbox') value = e.target.checked;
    else if (e.target.type === 'input') value = Number(e.target.value);
    else value = e.target.value;
    syncOptions.save(e.target.id, value);
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
    const urls = e.target.value;
    urls.split('\n').forEach(function(url) {
      if (!isValidRegex(url)) return; // TODO: show an error message
    });
    syncOptions.save(e.target.id, urls);
  };

  syncOptions.get(items => {
    render(
      <div>
        <div className="input">
          <span className="caption">Maximum actions:</span>
          <input id="limit" type="text" defaultValue={items.limit} onChange={saveOption}/>
          <span className="comment">(autocommit when exceeds, 0 - no limit)</span>
        </div>
        <div className="input">
          <span className="caption">Filter spec. actions:</span>
          <input id="filter" type="checkbox" defaultChecked={items.filter} onChange={saveOption}/>
          <span className="comment">(enable to show/hide the actions bellow)</span>
        </div>
        <div className="input">
          <span className="caption">Actions to hide from DevTools (from new line):</span>
          <textarea onChange={saveOption} id="blacklist" defaultValue={items.blacklist}/>
        </div>
        <div className="input">
          <span className="caption">Actions to show (previous option will be ignored):</span>
          <textarea onChange={saveOption} id="whitelist" defaultValue={items.whitelist}/>
        </div>
        <div className="input">
          <span className="caption">Maximum delay:</span>
          <input id="timeout" type="text" defaultValue={items.timeout} onChange={saveOption}/>
          <span className="comment">(seconds: bigger - better performance)</span>
        </div>
        <div className="input">
          <span className="caption">Inject in all pages:</span>
          <input id="inject" type="checkbox" defaultChecked={items.inject} onChange={saveOption}/>
          <span className="comment">(disable to allow only the urls bellow)</span>
        </div>
        <div className="input">
          <span className="caption">Pages urls to inject DevTools in (regex from new line):</span>
          <textarea onChange={saveUrls} id="urls" defaultValue={items.urls}/>
        </div>
        <div className="input">
          <span className="caption">Show errors:</span>
          <input id="notifyErrors" type="checkbox" defaultChecked={items.notifyErrors} onChange={saveOption}/>
          <span className="comment">(will notify when errors occur in the app)</span>
        </div>
      </div>,
      document.getElementById('root')
    );
  });
});
