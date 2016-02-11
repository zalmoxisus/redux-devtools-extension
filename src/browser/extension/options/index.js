import React from 'react';
import { render } from 'react-dom';
import Monitors from './monitors';

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
          <label className="caption" htmlFor="leftMonitor">Left monitor:</label>
          <br/>
          <Monitors type="side" defaultValue={items.leftMonitor} id="leftMonitor" onChange={saveOption}/>
        </div>
        <div className="input">
          <label className="caption" htmlFor="rightMonitor">Right monitor:</label>
          <br/>
          <Monitors type="side" defaultValue={items.rightMonitor} id="rightMonitor" onChange={saveOption}/>
        </div>
        <div className="input">
          <label className="caption" htmlFor="bottomMonitor">Bottom monitor:</label>
          <br/>
          <Monitors type="bottom" defaultValue={items.bottomMonitor} id="bottomMonitor" onChange={saveOption}/>
        </div>
        <div className="input">
          <label className="caption" htmlFor="limit">Maximum actions:</label>
          <input id="limit" type="text" defaultValue={items.limit} onChange={saveOption}/>
          <span className="comment">(autocommit when exceeds, 0 - no limit)</span>
        </div>
        <div className="input">
          <label className="caption" htmlFor="filter">Filter spec. actions:</label>
          <input id="filter" type="checkbox" defaultChecked={items.filter} onChange={saveOption}/>
          <span className="comment">(enable to show/hide the actions bellow)</span>
        </div>
        <div className="input">
          <label className="caption" htmlFor="blacklist">Actions to hide from DevTools (from new line):</label>
          <br/>
          <textarea onChange={saveOption} id="blacklist" defaultValue={items.blacklist}/>
        </div>
        <div className="input">
          <label className="caption" htmlFor="whitelist">Actions to show (previous option will be ignored):</label>
          <br/>
          <textarea onChange={saveOption} id="whitelist" defaultValue={items.whitelist}/>
        </div>
        <div className="input">
          <label className="caption" htmlFor="serialize">States serialization:</label>
          <input id="serialize" type="checkbox" defaultChecked={items.serialize} onChange={saveOption}/>
          <span className="comment">(required for ImmutableJS states)</span>
        </div>
        <div className="input">
          <label className="caption" htmlFor="inject">Inject in all pages:</label>
          <input id="inject" type="checkbox" defaultChecked={items.inject} onChange={saveOption}/>
          <span className="comment">(disable to allow only the urls bellow)</span>
        </div>
        <div className="input">
          <label className="caption" htmlFor="urls">Pages urls to inject DevTools in (regex from new line):</label>
          <br/>
          <textarea onChange={saveUrls} id="urls" defaultValue={items.urls}/>
        </div>
        <div className="input">
          <label className="caption" htmlFor="notifyErrors">Show errors:</label>
          <input id="notifyErrors" type="checkbox" defaultChecked={items.notifyErrors} onChange={saveOption}/>
          <span className="comment">(will notify when errors occur in the app)</span>
        </div>
      </div>,
      document.getElementById('root')
    );
  });
});
