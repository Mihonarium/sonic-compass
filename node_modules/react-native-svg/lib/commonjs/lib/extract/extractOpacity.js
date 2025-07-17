"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extractOpacity;
function extractOpacity(opacity) {
  const value = typeof opacity === 'string' && opacity.trim().endsWith('%') ? +opacity.slice(0, -1) / 100 : +opacity;
  return isNaN(value) || value > 1 ? 1 : Math.max(value, 0);
}
//# sourceMappingURL=extractOpacity.js.map