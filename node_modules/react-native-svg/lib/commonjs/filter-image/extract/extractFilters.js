"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapFilterToComponent = exports.extractFiltersCss = void 0;
var _react = _interopRequireDefault(require("react"));
var _xmlTags = require("../../xmlTags");
var _extractFiltersString = require("./extractFiltersString");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const extractFiltersCss = rawFilters => {
  if (!rawFilters) {
    return [];
  }
  if (Array.isArray(rawFilters)) {
    return rawFilters;
  }
  return (0, _extractFiltersString.parse)(rawFilters);
};
exports.extractFiltersCss = extractFiltersCss;
const mapFilterToComponent = ({
  name,
  ...props
}, index) => {
  return _xmlTags.tags[name] ? /*#__PURE__*/_react.default.createElement(_xmlTags.tags[name], {
    ...props,
    key: name + index
  }) : null;
};
exports.mapFilterToComponent = mapFilterToComponent;
//# sourceMappingURL=extractFilters.js.map