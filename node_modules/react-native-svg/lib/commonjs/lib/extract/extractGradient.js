"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extractGradient;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _reactNative = require("react-native");
var _extractOpacity = _interopRequireDefault(require("./extractOpacity"));
var _extractTransform = _interopRequireDefault(require("./extractTransform"));
var _units = _interopRequireDefault(require("../units"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const percentReg = /^([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(%?)$/;
function percentToFloat(percent) {
  if (typeof percent === 'number') {
    return percent;
  }
  if (typeof percent === 'object' && typeof percent.__getAnimatedValue === 'function') {
    return percent.__getAnimatedValue();
  }
  const matched = typeof percent === 'string' && percent.match(percentReg);
  if (!matched) {
    console.warn(`"${percent}" is not a valid number or percentage string.`);
    return 0;
  }
  return matched[2] ? +matched[1] / 100 : +matched[1];
}
const offsetComparator = (object, other) => object[0] - other[0];
function extractGradient(props, parent) {
  const {
    id,
    children,
    gradientTransform,
    transform,
    gradientUnits
  } = props;
  if (!id) {
    return null;
  }
  const stops = [];
  const childArray = children ? _react.Children.map(children, child => /*#__PURE__*/React.cloneElement(child, {
    parent
  })) : [];
  const l = childArray.length;
  for (let i = 0; i < l; i++) {
    const {
      props: {
        style,
        offset = style && style.offset,
        stopColor = style && style.stopColor || '#000',
        stopOpacity = style && style.stopOpacity
      }
    } = childArray[i];
    const offsetNumber = percentToFloat(offset || 0);
    const color = stopColor && (0, _reactNative.processColor)(stopColor);
    if (typeof color !== 'number' || isNaN(offsetNumber)) {
      console.warn(`"${stopColor}" is not a valid color or "${offset}" is not a valid offset`);
      continue;
    }
    const alpha = Math.round((0, _extractOpacity.default)(stopOpacity) * 255);
    stops.push([offsetNumber, color & 0x00ffffff | alpha << 24]);
  }
  stops.sort(offsetComparator);
  const gradient = [];
  const k = stops.length;
  for (let j = 0; j < k; j++) {
    const s = stops[j];
    gradient.push(s[0], s[1]);
  }
  return {
    name: id,
    gradient,
    children: childArray,
    gradientUnits: gradientUnits && _units.default[gradientUnits] || 0,
    gradientTransform: (0, _extractTransform.default)(gradientTransform || transform || props)
  };
}
//# sourceMappingURL=extractGradient.js.map