function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { findNodeHandle, Platform, StyleSheet } from 'react-native';
import extractResponder from '../lib/extract/extractResponder';
import extractViewBox from '../lib/extract/extractViewBox';
import Shape from './Shape';
import G from './G';
import RNSVGSvgAndroid from '../fabric/AndroidSvgViewNativeComponent';
import RNSVGSvgIOS from '../fabric/IOSSvgViewNativeComponent';
import extractOpacity from '../lib/extract/extractOpacity';
import { extractTransformSvgView } from '../lib/extract/extractTransform';
const styles = StyleSheet.create({
  svg: {
    backgroundColor: 'transparent',
    borderWidth: 0
  }
});
const defaultStyle = styles.svg;
export default class Svg extends Shape {
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
    const handle = findNodeHandle(this.root);
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
    const o = opacity != null ? extractOpacity(opacity) : NaN;
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
    extractResponder(props, props, this);
    if (onLayout != null) {
      props.onLayout = onLayout;
    }
    const gStyle = Object.assign({}, StyleSheet.flatten(style));
    if (transform) {
      if (gStyle.transform) {
        props.transform = gStyle.transform;
        gStyle.transform = undefined;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props.transform = extractTransformSvgView(props);
    }
    const RNSVGSvg = Platform.OS === 'android' ? RNSVGSvgAndroid : RNSVGSvgIOS;
    return /*#__PURE__*/React.createElement(RNSVGSvg, _extends({}, props, {
      ref: ref => this.refMethod(ref)
    }, extractViewBox({
      viewBox,
      preserveAspectRatio
    })), /*#__PURE__*/React.createElement(G, {
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
//# sourceMappingURL=Svg.js.map