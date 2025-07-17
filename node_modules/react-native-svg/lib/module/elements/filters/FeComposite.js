function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFeComposite from '../../fabric/FeCompositeNativeComponent';
import { extractFeComposite, extractFilter } from '../../lib/extract/extractFilter';
import FilterPrimitive from './FilterPrimitive';
export default class FeComposite extends FilterPrimitive {
  static displayName = 'FeComposite';
  static defaultProps = {
    ...this.defaultPrimitiveProps,
    k1: 0,
    k2: 0,
    k3: 0,
    k4: 0
  };
  render() {
    return /*#__PURE__*/React.createElement(RNSVGFeComposite, _extends({
      ref: ref => this.refMethod(ref)
    }, extractFilter(this.props), extractFeComposite(this.props)));
  }
}
//# sourceMappingURL=FeComposite.js.map