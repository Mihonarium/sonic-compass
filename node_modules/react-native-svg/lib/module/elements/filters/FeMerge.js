function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFeMerge from '../../fabric/FeMergeNativeComponent';
import { extractFeMerge, extractFilter } from '../../lib/extract/extractFilter';
import FilterPrimitive from './FilterPrimitive';
export default class FeMerge extends FilterPrimitive {
  static displayName = 'FeMerge';
  static defaultProps = {
    ...this.defaultPrimitiveProps
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeMerge, _extends({
      ref: ref => this.refMethod(ref)
    }, extractFilter(this.props), extractFeMerge(this.props, this)));
  }
}
//# sourceMappingURL=FeMerge.js.map