function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { extract } from '../lib/extract/extractProps';
import Shape from './Shape';
import RNSVGClipPath from '../fabric/ClipPathNativeComponent';
export default class ClipPath extends Shape {
  static displayName = 'ClipPath';
  render() {
    const {
      props
    } = this;
    return /*#__PURE__*/React.createElement(RNSVGClipPath, _extends({
      ref: this.refMethod
    }, extract(this, props)), props.children);
  }
}
//# sourceMappingURL=ClipPath.js.map