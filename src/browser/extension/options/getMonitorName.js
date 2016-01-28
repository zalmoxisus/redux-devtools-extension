export default (type, cb) => {
  window.syncOptions.get(options => {
    switch (type) {
      case 'devtools-bottom': cb(options.bottomMonitor); break;
      case 'devtools-right': cb(options.rightMonitor); break;
      default: cb(options.leftMonitor);
    }
  });
};
