"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepare = void 0;
var _ = require(".");
var _resolve = require("../../lib/resolve");
var _resolveAssetUri2 = require("../../lib/resolveAssetUri");
/**
 * `react-native-svg` supports additional props that aren't defined in the spec.
 * This function replaces them in a spec conforming manner.
 *
 * @param {WebShape} self Instance given to us.
 * @param {Object?} props Optional overridden props given to us.
 * @returns {Object} Cleaned props object.
 * @private
 */
const prepare = (self, props = self.props) => {
  const {
    transform,
    origin,
    originX,
    originY,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    style,
    forwardedRef,
    gradientTransform,
    patternTransform,
    onPress,
    ...rest
  } = props;
  const clean = {
    ...((0, _.hasTouchableProperty)(props) ? {
      onStartShouldSetResponder: self.touchableHandleStartShouldSetResponder,
      onResponderTerminationRequest: self.touchableHandleResponderTerminationRequest,
      onResponderGrant: self.touchableHandleResponderGrant,
      onResponderMove: self.touchableHandleResponderMove,
      onResponderRelease: self.touchableHandleResponderRelease,
      onResponderTerminate: self.touchableHandleResponderTerminate
    } : null),
    ...rest
  };
  if (origin != null) {
    clean['transform-origin'] = origin.toString().replace(',', ' ');
  } else if (originX != null || originY != null) {
    clean['transform-origin'] = `${originX || 0} ${originY || 0}`;
  }

  // we do it like this because setting transform as undefined causes error in web
  const parsedTransform = (0, _.parseTransformProp)(transform, props);
  if (parsedTransform) {
    clean.transform = parsedTransform;
  }
  const parsedGradientTransform = (0, _.parseTransformProp)(gradientTransform);
  if (parsedGradientTransform) {
    clean.gradientTransform = parsedGradientTransform;
  }
  const parsedPatternTransform = (0, _.parseTransformProp)(patternTransform);
  if (parsedPatternTransform) {
    clean.patternTransform = parsedPatternTransform;
  }
  clean.ref = el => {
    self.elementRef.current = el;
    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      forwardedRef.current = el;
    }
  };
  const styles = {};
  if (fontFamily != null) {
    styles.fontFamily = fontFamily;
  }
  if (fontSize != null) {
    styles.fontSize = fontSize;
  }
  if (fontWeight != null) {
    styles.fontWeight = fontWeight;
  }
  if (fontStyle != null) {
    styles.fontStyle = fontStyle;
  }
  clean.style = (0, _resolve.resolve)(style, styles);
  if (onPress !== null) {
    clean.onClick = props.onPress;
  }
  if (props.href !== null && props.href !== undefined) {
    var _resolveAssetUri;
    clean.href = (_resolveAssetUri = (0, _resolveAssetUri2.resolveAssetUri)(props.href)) === null || _resolveAssetUri === void 0 ? void 0 : _resolveAssetUri.uri;
  }
  return clean;
};
exports.prepare = prepare;
//# sourceMappingURL=prepare.js.map