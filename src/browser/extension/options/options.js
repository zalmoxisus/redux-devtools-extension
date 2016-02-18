import React from 'react';
import Monitors from './monitors';

const Options = ({ options, saveOption, saveUrls }) =>
  <div>
    <div className="input">
      <label className="caption" htmlFor="leftMonitor">Left monitor:</label>
      <br/>
      <Monitors type="side" defaultValue={options.leftMonitor} id="leftMonitor" onChange={saveOption}/>
    </div>
    <div className="input">
      <label className="caption" htmlFor="rightMonitor">Right monitor:</label>
      <br/>
      <Monitors type="side" defaultValue={options.rightMonitor} id="rightMonitor" onChange={saveOption}/>
    </div>
    <div className="input">
      <label className="caption" htmlFor="bottomMonitor">Bottom monitor:</label>
      <br/>
      <Monitors type="bottom" defaultValue={options.bottomMonitor} id="bottomMonitor" onChange={saveOption}/>
    </div>
    <div className="input">
      <label className="caption" htmlFor="limit">Maximum actions:</label>
      <input id="limit" type="text" defaultValue={options.limit} onChange={saveOption}/>
      <span className="comment">(autocommit when exceeds, 0 - no limit)</span>
    </div>
    <div className="input">
      <input id="filter" type="checkbox" defaultChecked={options.filter} onChange={saveOption}/>
      <label className="caption" htmlFor="filter">
        Filter spec. actions
        <span className="comment">(enable to show/hide the actions bellow)</span>
      </label>
    </div>
    <div className="input">
      <label className="caption" htmlFor="blacklist">Actions to hide from DevTools (from new line):</label>
      <br/>
      <textarea onChange={saveOption} id="blacklist" defaultValue={options.blacklist}/>
    </div>
    <div className="input">
      <label className="caption" htmlFor="whitelist">Actions to show (previous option will be ignored):</label>
      <br/>
      <textarea onChange={saveOption} id="whitelist" defaultValue={options.whitelist}/>
    </div>
    <div className="input">
      <input id="serialize" type="checkbox" defaultChecked={options.serialize} onChange={saveOption}/>
      <label className="caption" htmlFor="serialize">
        States serialization
        <span className="comment">(required for ImmutableJS states)</span>
      </label>
    </div>
    <div className="input">
      <input id="inject" type="checkbox" defaultChecked={options.inject} onChange={saveOption}/>
      <label className="caption" htmlFor="inject">
        Inject in all pages
        <span className="comment">(disable to allow only the urls bellow)</span>
      </label>
    </div>
    <div className="input">
      <label className="caption" htmlFor="urls">Pages urls to inject DevTools in (regex from new line):</label>
      <br/>
      <textarea onChange={saveUrls} id="urls" defaultValue={options.urls}/>
    </div>
    <div className="input">
      <input id="notifyErrors" type="checkbox" defaultChecked={options.notifyErrors} onChange={saveOption}/>
      <label className="caption" htmlFor="notifyErrors">
        Show errors
        <span className="comment">(will notify when errors occur in the app)</span>
      </label>
    </div>
  </div>;

export default Options;