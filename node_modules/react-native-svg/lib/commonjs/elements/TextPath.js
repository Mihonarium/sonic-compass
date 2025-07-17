"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _extractTransform = _interopRequireDefault(require("../lib/extract/extractTransform"));
var _extractProps = require("../lib/extract/extractProps");
var _extractText = _interopRequireDefault(require("../lib/extract/extractText"));
var _util = require("../lib/util");
var _Shape = _interopRequireDefault(require("./Shape"));
var _TSpan = _interopRequireDefault(require("./TSpan"));
var _TextPathNativeComponent = _interopRequireDefault(require("../fabric/TextPathNativeComponent"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class TextPath extends _Shape.default {
  static displayName = 'TextPath';
  setNativeProps = props => {
    const matrix = !props.matrix && (0, _extractTransform.default)(props);
    if (matrix) {
      props.matrix = matrix;
    }
    Object.assign(props, (0, _util.pickNotNil)((0, _extractText.default)(props, true)));
    this.root && this.root.setNativeProps(props);
  };
  render() {
    const {
      children,
      xlinkHref,
      href = xlinkHref,
      startOffset = 0,
      method,
      spacing,
      side,
      alignmentBaseline,
      midLine,
      ...prop
    } = this.props;
    const matched = href && href.match(_util.idPattern);
    const match = matched && matched[1];
    if (match) {
      const props = (0, _extractProps.withoutXY)(this, prop);
      Object.assign(props, (0, _extractText.default)({
        children
      }, true), {
        href: match,
        startOffset,
        method,
        spacing,
        side,
        alignmentBaseline,
        midLine
      });
      props.ref = this.refMethod;
      return /*#__PURE__*/React.createElement(_TextPathNativeComponent.default, props);
    }
    console.warn('Invalid `href` prop for `TextPath` element, expected a href like "#id", but got: "' + href + '"');
    return /*#__PURE__*/React.createElement(_TSpan.default, {
      ref: this.refMethod
    }, children);
  }
}
exports.default = TextPath;
//# sourceMappingURL=TextPath.js.map