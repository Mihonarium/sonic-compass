"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _extractProps = _interopRequireWildcard(require("../lib/extract/extractProps"));
var _extractText = require("../lib/extract/extractText");
var _extractTransform = _interopRequireDefault(require("../lib/extract/extractTransform"));
var _Shape = _interopRequireDefault(require("./Shape"));
var _GroupNativeComponent = _interopRequireDefault(require("../fabric/GroupNativeComponent"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
class G extends _Shape.default {
  static displayName = 'G';
  setNativeProps = props => {
    var _this$root;
    const matrix = !props.matrix && (0, _extractTransform.default)(props);
    if (matrix) {
      props.matrix = matrix;
    }
    (_this$root = this.root) === null || _this$root === void 0 || _this$root.setNativeProps(props);
  };
  render() {
    const {
      props
    } = this;
    const prop = (0, _extractProps.propsAndStyles)(props);
    const extractedProps = (0, _extractProps.default)(prop, this);
    const font = (0, _extractText.extractFont)(prop);
    if (hasProps(font)) {
      extractedProps.font = font;
    }
    return /*#__PURE__*/React.createElement(_GroupNativeComponent.default, _extends({
      ref: ref => this.refMethod(ref)
    }, extractedProps), props.children);
  }
}
exports.default = G;
const hasProps = obj => {
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in obj) {
    return true;
  }
  return false;
};
//# sourceMappingURL=G.js.map