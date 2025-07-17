function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFeOffset from '../../fabric/FeOffsetNativeComponent';
import { extractFilter, extractIn } from '../../lib/extract/extractFilter';
import FilterPrimitive from './FilterPrimitive';
export default class FeOffset extends FilterPrimitive {
  static displayName = 'FeOffset';
  static defaultProps = {
    ...this.defaultPrimitiveProps,
    dx: 0,
    dy: 0
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeOffset, _extends({
      ref: ref => this.refMethod(ref)
    }, this.props, extractFilter(this.props), extractIn(this.props)));
  }
}
//# sourceMappingURL=FeOffset.js.map