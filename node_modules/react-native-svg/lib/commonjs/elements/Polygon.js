"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Path = _interopRequireDefault(require("./Path"));
var _Shape = _interopRequireDefault(require("./Shape"));
var _extractPolyPoints = _interopRequireDefault(require("../lib/extract/extractPolyPoints"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
class Polygon extends _Shape.default {
  static displayName = 'Polygon';
  static defaultProps = {
    points: ''
  };
  setNativeProps = props => {
    const {
      points
    } = props;
    if (points) {
      props.d = `M${(0, _extractPolyPoints.default)(points)}z`;
    }
    this.root && this.root.setNativeProps(props);
  };
  render() {
    const {
      props
    } = this;
    const {
      points
    } = props;
    return /*#__PURE__*/React.createElement(_Path.default, _extends({
      ref: this.refMethod,
      d: points && `M${(0, _extractPolyPoints.default)(points)}z`
    }, props));
  }
}
exports.default = Polygon;
//# sourceMappingURL=Polygon.js.map