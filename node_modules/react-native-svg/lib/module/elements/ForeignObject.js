function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { withoutXY } from '../lib/extract/extractProps';
import G from './G';
import RNSVGForeignObject from '../fabric/ForeignObjectNativeComponent';
export default class ForeignObject extends G {
  static displayName = 'ForeignObject';
  static defaultProps = {
    x: '0%',
    y: '0%',
    width: '100%',
    height: '100%'
  };
  render() {
    const {
      props
    } = this;
    const {
      x,
      y,
      width,
      height,
      children
    } = props;
    const foreignObjectProps = {
      x,
      y,
      width,
      height
    };
    return /*#__PURE__*/React.createElement(RNSVGForeignObject, _extends({
      ref: ref => this.refMethod(ref)
    }, withoutXY(this, props), foreignObjectProps), children);
  }
}
//# sourceMappingURL=ForeignObject.js.map