/**
 * Polyfills for *drum roll* Internet Explorer 11
 */

import 'custom-event-polyfill';

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}
