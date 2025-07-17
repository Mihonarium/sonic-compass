function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { extract } from '../lib/extract/extractProps';
import Shape from './Shape';
import RNSVGLine from '../fabric/LineNativeComponent';
export default class Line extends Shape {
  static displayName = 'Line';
  static defaultProps = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
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
    const lineProps = {
      ...extract(this, props),
      x1,
      y1,
      x2,
      y2
    };
    return /*#__PURE__*/React.createElement(RNSVGLine, _extends({
      ref: ref => this.refMethod(ref)
    }, lineProps));
  }
}
//# sourceMappingURL=Line.js.map