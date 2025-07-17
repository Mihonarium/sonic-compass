"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _extractText = _interopRequireDefault(require("../lib/extract/extractText"));
var _extractProps = _interopRequireWildcard(require("../lib/extract/extractProps"));
var _extractTransform = _interopRequireDefault(require("../lib/extract/extractTransform"));
var _util = require("../lib/util");
var _Shape = _interopRequireDefault(require("./Shape"));
require("./TSpan");
var _TextNativeComponent = _interopRequireDefault(require("../fabric/TextNativeComponent"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class Text extends _Shape.default {
  static displayName = 'Text';
  setNativeProps = props => {
    const matrix = props && !props.matrix && (0, _extractTransform.default)(props);
    if (matrix) {
      props.matrix = matrix;
    }
    const prop = (0, _extractProps.propsAndStyles)(props);
    Object.assign(prop, (0, _util.pickNotNil)((0, _extractText.default)(prop, true)));
    this.root && this.root.setNativeProps(prop);
  };
  render() {
    const prop = (0, _extractProps.propsAndStyles)(this.props);
    const props = (0, _extractProps.default)({
      ...prop,
      x: null,
      y: null
    }, this);
    Object.assign(props, (0, _extractText.default)(prop, true));
    props.ref = this.refMethod;
    return /*#__PURE__*/React.createElement(_TextNativeComponent.default, props);
  }
}
exports.default = Text;
//# sourceMappingURL=Text.js.map