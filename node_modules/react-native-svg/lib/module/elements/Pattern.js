function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import extractTransform from '../lib/extract/extractTransform';
import extractViewBox from '../lib/extract/extractViewBox';
import units from '../lib/units';
import Shape from './Shape';
import RNSVGPattern from '../fabric/PatternNativeComponent';
export default class Pattern extends Shape {
  static displayName = 'Pattern';
  static defaultProps = {
    x: '0%',
    y: '0%',
    width: '100%',
    height: '100%'
  };
  render() {
    const {
      props
    } = this;
    const {
      patternTransform,
      transform,
      id,
      x,
      y,
      width,
      height,
      patternUnits,
      patternContentUnits,
      children,
      viewBox,
      preserveAspectRatio
    } = props;
    const matrix = extractTransform(patternTransform || transform || props);
    const patternProps = {
      x,
      y,
      width,
      height,
      name: id,
      matrix,
      patternTransform: matrix,
      patternUnits: patternUnits && units[patternUnits] || 0,
      patternContentUnits: patternContentUnits ? units[patternContentUnits] : 1
    };
    return /*#__PURE__*/React.createElement(RNSVGPattern, _extends({
      ref: ref => this.refMethod(ref)
    }, patternProps, extractViewBox({
      viewBox,
      preserveAspectRatio
    })), children);
  }
}
//# sourceMappingURL=Pattern.js.map