"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _extractGradient = _interopRequireDefault(require("../lib/extract/extractGradient"));
var _Shape = _interopRequireDefault(require("./Shape"));
var _RadialGradientNativeComponent = _interopRequireDefault(require("../fabric/RadialGradientNativeComponent"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
class RadialGradient extends _Shape.default {
  static displayName = 'RadialGradient';
  static defaultProps = {
    cx: '50%',
    cy: '50%',
    r: '50%'
  };
  render() {
    const {
      props
    } = this;
    const {
      rx,
      ry,
      r,
      cx,
      cy,
      fx = cx,
      fy = cy
    } = props;
    const radialGradientProps = {
      fx,
      fy,
      rx: rx || r,
      ry: ry || r,
      cx,
      cy
    };
    return /*#__PURE__*/React.createElement(_RadialGradientNativeComponent.default, _extends({
      ref: ref => this.refMethod(ref)
    }, radialGradientProps, (0, _extractGradient.default)(props, this)));
  }
}
exports.default = RadialGradient;
//# sourceMappingURL=RadialGradient.js.map