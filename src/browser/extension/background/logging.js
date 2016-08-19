export function getReport(id, instance) {
  chrome.storage.local.get(['s:hostname', 's:port', 's:secure'], options => {
    if (!options['s:hostname'] || !options['s:port']) return;
    const url = `${options['s:secure'] ? 'https' : 'http'}://${options['s:hostname']}:${options['s:port']}`;

    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ op: 'get', id })
    }).then(response => {
      return response.json();
    }).then(json => {
      if (!json.payload) return;
      window.store.liftedStore.importState(json.payload, instance);
    }).catch(function(err) {
      console.warn(err);
    });
  });
}
