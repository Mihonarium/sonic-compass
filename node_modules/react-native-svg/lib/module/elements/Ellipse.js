function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { extract } from '../lib/extract/extractProps';
import Shape from './Shape';
import RNSVGEllipse from '../fabric/EllipseNativeComponent';
export default class Ellipse extends Shape {
  static displayName = 'Ellipse';
  static defaultProps = {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0
  };
  render() {
    const {
      props
    } = this;
    const {
      cx,
      cy,
      rx,
      ry
    } = props;
    const ellipseProps = {
      ...extract(this, props),
      cx,
      cy,
      rx,
      ry
    };
    return /*#__PURE__*/React.createElement(RNSVGEllipse, _extends({
      ref: ref => this.refMethod(ref)
    }, ellipseProps));
  }
}
//# sourceMappingURL=Ellipse.js.map