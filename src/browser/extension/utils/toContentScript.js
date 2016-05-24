import { stringify } from 'jsan';

/*
function stringify(obj) {
   return jsan.stringify(obj, function(key, value) {
   if (value && value.toJS) { return value.toJS(); }
   return value;
   }, null, true);
}
*/

export default function toContentScript(message, shouldStringify) {
  if (shouldStringify) {
    if (message.payload) message.payload = stringify(message.payload);
    if (message.action) message.action = stringify(message.action);
  }
  window.postMessage(message, '*');
}
