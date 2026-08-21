// Expose Node.js 20 Web APIs that Jest's VM context doesn't inherit automatically
if (typeof File === 'undefined') {
  global.File = require('buffer').File;
}
