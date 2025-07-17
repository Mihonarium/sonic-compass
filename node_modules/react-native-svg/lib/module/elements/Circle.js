function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { extract } from '../lib/extract/extractProps';
import Shape from './Shape';
import RNSVGCircle from '../fabric/CircleNativeComponent';
export default class Circle extends Shape {
  static displayName = 'Circle';
  static defaultProps = {
    cx: 0,
    cy: 0,
    r: 0
  };
  render() {
    const {
      props
    } = this;
    const {
      cx,
      cy,
      r
    } = props;
    const circleProps = {
      ...extract(this, props),
      cx,
      cy,
      r
    };
    return /*#__PURE__*/React.createElement(RNSVGCircle, _extends({
      ref: ref => this.refMethod(ref)
    }, circleProps));
  }
}
//# sourceMappingURL=Circle.js.map