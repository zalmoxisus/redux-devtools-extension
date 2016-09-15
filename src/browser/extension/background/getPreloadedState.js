export default function getPreloadedState(position, cb) {
  chrome.storage.local.get([
    'monitor' + position, 'slider' + position, 'dispatcher' + position,
    'test-templates', 'test-templates-sel'
  ], options => {
    cb({
      monitor: {
        selected: options['monitor' + position],
        sliderIsOpen: options['slider' + position] || false,
        dispatcherIsOpen: options['dispatcher' + position] || false,
      },
      test: {
        selected: options['test-templates-sel'] || 0,
        templates: options['test-templates']
      }
    });
  });
}
