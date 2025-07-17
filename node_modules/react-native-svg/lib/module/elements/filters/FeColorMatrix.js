function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFeColorMatrix from '../../fabric/FeColorMatrixNativeComponent';
import { extractFeColorMatrix, extractFilter, extractIn } from '../../lib/extract/extractFilter';
import FilterPrimitive from './FilterPrimitive';
export default class FeColorMatrix extends FilterPrimitive {
  static displayName = 'FeColorMatrix';
  static defaultProps = {
    ...this.defaultPrimitiveProps,
    type: 'matrix',
    values: ''
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeColorMatrix, _extends({
      ref: ref => this.refMethod(ref)
    }, extractFilter(this.props), extractIn(this.props), extractFeColorMatrix(this.props)));
  }
}
//# sourceMappingURL=FeColorMatrix.js.map