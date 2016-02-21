import React from 'react';
import Monitors from './monitors';

export default ({ options, saveOption, saveUrls }) => (
  <div>
    <div className="option option_type_select option_value_left-monitor">
      <label className="option__caption" htmlFor="leftMonitor">Left monitor:</label>
      <Monitors elementClassName="option__element" type="side" defaultValue={options.leftMonitor}
                id="leftMonitor" onChange={saveOption} />
    </div>
    <div className="option option_type_select option_value_right-monitor">
      <label className="option__caption" htmlFor="rightMonitor">Right monitor:</label>
      <Monitors elementClassName="option__element" type="side" defaultValue={options.rightMonitor}
                id="rightMonitor" onChange={saveOption} />
    </div>
    <div className="option option_type_select option_value_bottom-monitor">
      <label className="option__caption" htmlFor="bottomMonitor">Bottom monitor:</label>
      <Monitors elementClassName="option__element" type="bottom" defaultValue={options.bottomMonitor}
                id="bottomMonitor" onChange={saveOption} />
    </div>
    <div className="option option_type_input option_value_limit">
      <label className="option__caption" htmlFor="limit">Maximum actions:</label>
      <input className="option__element" id="limit" type="text" defaultValue={options.limit} onChange={saveOption}/>
      <span className="option__comment">(autocommit when exceeds, 0 - no limit)</span>
    </div>
    <div className="option option_type_checkbox option_value_filter">
      <input className="option__element" id="filter" type="checkbox" defaultChecked={options.filter} onChange={saveOption}/>
      <label className="option__caption" htmlFor="filter">
        Filter spec. actions
        <span className="option__comment">(enable to show/hide the actions bellow)</span>
      </label>
    </div>
    <div className="option option_type_textarea option_value_blacklist">
      <label className="option__caption" htmlFor="blacklist">Actions to hide from DevTools (from new line):</label>
      <textarea className="option__element" onChange={saveOption} id="blacklist" defaultValue={options.blacklist}/>
    </div>
    <div className="option option_type_textarea option_value_whitelist">
      <label className="option__caption" htmlFor="whitelist">Actions to show (previous option will be ignored):</label>
      <textarea className="option__element" onChange={saveOption} id="whitelist" defaultValue={options.whitelist}/>
    </div>
    <div className="option option_type_checkbox option_value_serialize">
      <input className="option__element" id="serialize" type="checkbox" defaultChecked={options.serialize} onChange={saveOption}/>
      <label className="option__caption" htmlFor="serialize">
        States serialization
        <span className="option__comment">(required for ImmutableJS states)</span>
      </label>
    </div>
    <div className="option option_type_checkbox option_value_inject">
      <input className="option__element" id="inject" type="checkbox" defaultChecked={options.inject} onChange={saveOption}/>
      <label className="option__caption" htmlFor="inject">
        Inject in all pages
        <span className="option__comment">(disable to allow only the urls bellow)</span>
      </label>
    </div>
    <div className="option option_type_textarea option_value_urls">
      <label className="option__caption" htmlFor="urls">Pages urls to inject DevTools in (regex from new line):</label>
      <textarea className="option__element" onChange={saveUrls} id="urls" defaultValue={options.urls}/>
    </div>
    <div className="option option_type_checkbox option_value_notify-errors">
      <input className="option__element" id="notifyErrors" type="checkbox" defaultChecked={options.notifyErrors} onChange={saveOption}/>
      <label className="option__caption" htmlFor="notifyErrors">
        Show errors
        <span className="option__comment">(will notify when errors occur in the app)</span>
      </label>
    </div>
  </div>
);