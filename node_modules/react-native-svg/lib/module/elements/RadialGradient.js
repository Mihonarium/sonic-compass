function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import extractGradient from '../lib/extract/extractGradient';
import Shape from './Shape';
import RNSVGRadialGradient from '../fabric/RadialGradientNativeComponent';
export default class RadialGradient extends Shape {
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
    return /*#__PURE__*/React.createElement(RNSVGRadialGradient, _extends({
      ref: ref => this.refMethod(ref)
    }, radialGradientProps, extractGradient(props, this)));
  }
}
//# sourceMappingURL=RadialGradient.js.map