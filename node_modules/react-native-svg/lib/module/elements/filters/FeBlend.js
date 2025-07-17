function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import { extractFeBlend, extractFilter, extractIn } from '../../lib/extract/extractFilter';
import RNSVGFeBlend from '../../fabric/FeBlendNativeComponent';
import FilterPrimitive from './FilterPrimitive';
export default class FeBlend extends FilterPrimitive {
  static displayName = 'FeBlend';
  static defaultProps = {
    ...this.defaultPrimitiveProps,
    mode: 'normal'
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeBlend, _extends({
      ref: ref => this.refMethod(ref)
    }, extractFilter(this.props), extractIn(this.props), extractFeBlend(this.props)));
  }
}
//# sourceMappingURL=FeBlend.js.map