function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFeFlood from '../../fabric/FeFloodNativeComponent';
import extractFeFlood, { extractFilter } from '../../lib/extract/extractFilter';
import FilterPrimitive from './FilterPrimitive';
export default class FeFlood extends FilterPrimitive {
  static displayName = 'FeFlood';
  static defaultProps = {
    ...this.defaultPrimitiveProps,
    floodColor: 'black',
    floodOpacity: 1
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeFlood, _extends({
      ref: ref => this.refMethod(ref)
    }, extractFilter(this.props), extractFeFlood(this.props)));
  }
}
//# sourceMappingURL=FeFlood.js.map