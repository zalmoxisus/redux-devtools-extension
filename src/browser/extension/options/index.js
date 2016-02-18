import React from 'react';
import { render } from 'react-dom';
import Options from './options';

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
      <Options options={items} saveOption={saveOption} saveUrls={saveUrls} />,
      document.getElementById('root')
    );
  });
});
