function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import extractViewBox from '../lib/extract/extractViewBox';
import Shape from './Shape';
import RNSVGSymbol from '../fabric/SymbolNativeComponent';
export default class Symbol extends Shape {
  static displayName = 'Symbol';
  render() {
    const {
      props
    } = this;
    const {
      id,
      children
    } = props;
    const symbolProps = {
      name: id
    };
    return /*#__PURE__*/React.createElement(RNSVGSymbol, _extends({
      ref: ref => this.refMethod(ref)
    }, symbolProps, extractViewBox(props)), children);
  }
}
//# sourceMappingURL=Symbol.js.map