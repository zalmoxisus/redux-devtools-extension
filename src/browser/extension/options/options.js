import React from 'react';

export default ({ options, saveOption, saveUrls }) => (
  <div>
    <div className="option option_type_input option_value_max-age">
      <label className="option__caption" htmlFor="maxAge">Actions history limit:</label>
      <input className="option__element" id="maxAge" type="text" value={options.maxAge} onChange={saveOption}/>
      <span className="option__comment">(the oldest removed once it's reached)</span>
    </div>
    <div className="option option_type_checkbox option_value_filter">
      <input className="option__element" id="filter" type="checkbox" checked={options.filter} onChange={saveOption}/>
      <label className="option__caption" htmlFor="filter">
        Filter spec. actions
        <span className="option__comment">(enable to show/hide the actions bellow)</span>
      </label>
    </div>
    <div className="option option_type_textarea option_value_blacklist">
      <label className="option__caption" htmlFor="blacklist">Actions to hide from DevTools (from new line):</label>
      <textarea className="option__element" onChange={saveOption} id="blacklist" value={options.blacklist}/>
    </div>
    <div className="option option_type_textarea option_value_whitelist">
      <label className="option__caption" htmlFor="whitelist">Actions to show (previous option will be ignored):</label>
      <textarea className="option__element" onChange={saveOption} id="whitelist" value={options.whitelist}/>
    </div>
    <div className="option option_type_checkbox option_value_serialize">
      <input className="option__element" id="serialize" type="checkbox" checked={options.serialize} onChange={saveOption}/>
      <label className="option__caption" htmlFor="serialize">
        States serialization
        <span className="option__comment">(required for ImmutableJS states)</span>
      </label>
    </div>
    <div className="option option_type_checkbox option_value_inject">
      <input className="option__element" id="inject" type="checkbox" checked={options.inject} onChange={saveOption}/>
      <label className="option__caption" htmlFor="inject">
        Inject in all pages
        <span className="option__comment">(disable to allow only the urls bellow)</span>
      </label>
    </div>
    <div className="option option_type_textarea option_value_urls">
      <label className="option__caption" htmlFor="urls">Pages urls to inject DevTools in (regex from new line):</label>
      <textarea className="option__element" onChange={saveUrls} id="urls" value={options.urls}/>
    </div>
    <div className="option option_type_checkbox option_value_notify-errors">
      <input className="option__element" id="notifyErrors" type="checkbox" checked={options.notifyErrors} onChange={saveOption}/>
      <label className="option__caption" htmlFor="notifyErrors">
        Show errors
        <span className="option__comment">(will notify when errors occur in the app)</span>
      </label>
    </div>
  </div>
);
