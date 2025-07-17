function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFeGaussianBlur from '../../fabric/FeGaussianBlurNativeComponent';
import { extractFeGaussianBlur, extractFilter, extractIn } from '../../lib/extract/extractFilter';
import FilterPrimitive from './FilterPrimitive';
export default class FeGaussianBlur extends FilterPrimitive {
  static displayName = 'FeGaussianBlur';
  static defaultProps = {
    ...this.defaultPrimitiveProps,
    stdDeviation: 0,
    edgeMode: 'none'
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeGaussianBlur, _extends({
      ref: ref => this.refMethod(ref)
    }, extractFilter(this.props), extractIn(this.props), extractFeGaussianBlur(this.props)));
  }
}
//# sourceMappingURL=FeGaussianBlur.js.map