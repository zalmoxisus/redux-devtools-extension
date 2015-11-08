// Include this script in Chrome apps and extensions for remote debugging
// <script src="chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/inject.bundle.js"></script>

window.devToolsExtensionID = 'lmhkpmbekcpmknklioeibfkpmmfibljd';

require('./contentScript');
require('./pageScript');
