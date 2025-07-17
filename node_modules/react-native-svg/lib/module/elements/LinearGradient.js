function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import extractGradient from '../lib/extract/extractGradient';
import Shape from './Shape';
import RNSVGLinearGradient from '../fabric/LinearGradientNativeComponent';
export default class LinearGradient extends Shape {
  static displayName = 'LinearGradient';
  static defaultProps = {
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '0%'
  };
  render() {
    const {
      props
    } = this;
    const {
      x1,
      y1,
      x2,
      y2
    } = props;
    const linearGradientProps = {
      x1,
      y1,
      x2,
      y2
    };
    return /*#__PURE__*/React.createElement(RNSVGLinearGradient, _extends({
      ref: ref => this.refMethod(ref)
    }, linearGradientProps, extractGradient(props, this)));
  }
}
//# sourceMappingURL=LinearGradient.js.map