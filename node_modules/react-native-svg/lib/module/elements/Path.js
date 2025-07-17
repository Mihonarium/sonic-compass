function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { extract } from '../lib/extract/extractProps';
import Shape from './Shape';
import RNSVGPath from '../fabric/PathNativeComponent';
export default class Path extends Shape {
  static displayName = 'Path';
  render() {
    const {
      props
    } = this;
    const {
      d
    } = props;
    const pathProps = {
      ...extract(this, props),
      d
    };
    return /*#__PURE__*/React.createElement(RNSVGPath, _extends({
      ref: ref => this.refMethod(ref)
    }, pathProps));
  }
}
//# sourceMappingURL=Path.js.map