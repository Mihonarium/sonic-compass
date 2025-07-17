"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.idPattern = exports.getRandomNumber = void 0;
exports.pickNotNil = pickNotNil;
exports.warnUnimplementedFilter = void 0;
var _warnOnce = _interopRequireDefault(require("warn-once"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function pickNotNil(object) {
  const result = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key];
      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    }
  }
  return result;
}
const idPattern = exports.idPattern = /#([^)]+)'?\)?$/;
const getRandomNumber = () => Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
exports.getRandomNumber = getRandomNumber;
const warnUnimplementedFilter = () => {
  (0, _warnOnce.default)(true, `Some of the used filters are not yet supported on native platforms. Please check the USAGE.md for more info. Not implemented filters:\n`, JSON.stringify(['FeComponentTransfer', 'FeConvolveMatrix', 'FeDiffuseLighting', 'FeDisplacementMap', 'FeFuncA', 'FeFuncB', 'FeFuncG', 'FeFuncR', 'FeImage', 'FeMorphology', 'FePointLight', 'FeSpecularLighting', 'FeSpotLight', 'FeTile', 'FeTurbulence'], null, 2));
};
exports.warnUnimplementedFilter = warnUnimplementedFilter;
//# sourceMappingURL=util.js.map