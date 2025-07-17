"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _extractResponder = _interopRequireDefault(require("../lib/extract/extractResponder"));
var _extractViewBox = _interopRequireDefault(require("../lib/extract/extractViewBox"));
var _Shape = _interopRequireDefault(require("./Shape"));
var _G = _interopRequireDefault(require("./G"));
var _AndroidSvgViewNativeComponent = _interopRequireDefault(require("../fabric/AndroidSvgViewNativeComponent"));
var _IOSSvgViewNativeComponent = _interopRequireDefault(require("../fabric/IOSSvgViewNativeComponent"));
var _extractOpacity = _interopRequireDefault(require("../lib/extract/extractOpacity"));
var _extractTransform = require("../lib/extract/extractTransform");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const styles = _reactNative.StyleSheet.create({
  svg: {
    backgroundColor: 'transparent',
    borderWidth: 0
  }
});
const defaultStyle = styles.svg;
class Svg extends _Shape.default {
  static displayName = 'Svg';
  static defaultProps = {
    preserveAspectRatio: 'xMidYMid meet'
  };
  measureInWindow = callback => {
    const {
      root
    } = this;
    root && root.measureInWindow(callback);
  };
  measure = callback => {
    const {
      root
    } = this;
    root && root.measure(callback);
  };
  measureLayout = (relativeToNativeNode, onSuccess, onFail) => {
    const {
      root
    } = this;
    root && root.measureLayout(relativeToNativeNode, onSuccess, onFail);
  };
  setNativeProps = props => {
    const {
      root
    } = this;
    root && root.setNativeProps(props);
  };
  toDataURL = (callback, options) => {
    if (!callback) {
      return;
    }
    const handle = (0, _reactNative.findNodeHandle)(this.root);
    const RNSVGSvgViewModule =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../fabric/NativeSvgViewModule').default;
    RNSVGSvgViewModule.toDataURL(handle, options, callback);
  };
  render() {
    const {
      style,
      opacity,
      viewBox,
      children,
      onLayout,
      preserveAspectRatio,
      ...extracted
    } = this.props;
    const stylesAndProps = {
      ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
      ...extracted
    };
    let {
      width,
      height,
      focusable,
      transform,
      // Inherited G properties
      font,
      fill,
      fillOpacity,
      fillRule,
      stroke,
      strokeWidth,
      strokeOpacity,
      strokeDasharray,
      strokeDashoffset,
      strokeLinecap,
      strokeLinejoin,
      strokeMiterlimit
    } = stylesAndProps;
    if (width === undefined && height === undefined) {
      width = height = '100%';
    }
    const props = extracted;
    props.focusable = Boolean(focusable) && focusable !== 'false';
    const rootStyles = [defaultStyle];
    if (style) {
      rootStyles.push(style);
    }
    let override = false;
    const overrideStyles = {};
    const o = opacity != null ? (0, _extractOpacity.default)(opacity) : NaN;
    if (!isNaN(o)) {
      override = true;
      overrideStyles.opacity = o;
    }
    if (width && height) {
      override = true;
      const w = parseInt(width, 10);
      const h = parseInt(height, 10);
      const doNotParseWidth = isNaN(w) || width[width.length - 1] === '%';
      const doNotParseHeight = isNaN(h) || height[height.length - 1] === '%';
      overrideStyles.width = doNotParseWidth ? width : w;
      overrideStyles.height = doNotParseHeight ? height : h;
      overrideStyles.flex = 0;
    }
    if (override) {
      rootStyles.push(overrideStyles);
    }
    props.style = rootStyles.length > 1 ? rootStyles : defaultStyle;
    if (width != null) {
      props.bbWidth = width;
    }
    if (height != null) {
      props.bbHeight = height;
    }
    (0, _extractResponder.default)(props, props, this);
    if (onLayout != null) {
      props.onLayout = onLayout;
    }
    const gStyle = Object.assign({}, _reactNative.StyleSheet.flatten(style));
    if (transform) {
      if (gStyle.transform) {
        props.transform = gStyle.transform;
        gStyle.transform = undefined;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props.transform = (0, _extractTransform.extractTransformSvgView)(props);
    }
    const RNSVGSvg = _reactNative.Platform.OS === 'android' ? _AndroidSvgViewNativeComponent.default : _IOSSvgViewNativeComponent.default;
    return /*#__PURE__*/React.createElement(RNSVGSvg, _extends({}, props, {
      ref: ref => this.refMethod(ref)
    }, (0, _extractViewBox.default)({
      viewBox,
      preserveAspectRatio
    })), /*#__PURE__*/React.createElement(_G.default, {
      children,
      style: gStyle,
      font,
      fill,
      fillOpacity,
      fillRule,
      stroke,
      strokeWidth,
      strokeOpacity,
      strokeDasharray,
      strokeDashoffset,
      strokeLinecap,
      strokeLinejoin,
      strokeMiterlimit
    }));
  }
}
exports.default = Svg;
//# sourceMappingURL=Svg.js.map