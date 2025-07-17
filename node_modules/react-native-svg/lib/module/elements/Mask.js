function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { withoutXY } from '../lib/extract/extractProps';
import units from '../lib/units';
import Shape from './Shape';
import RNSVGMask from '../fabric/MaskNativeComponent';
import { maskType } from '../lib/maskType';
export default class Mask extends Shape {
  static displayName = 'Mask';
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
      maskUnits,
      maskContentUnits,
      children,
      style
    } = props;
    const maskProps = {
      x,
      y,
      width,
      height,
      maskUnits: maskUnits !== undefined ? units[maskUnits] : 0,
      maskContentUnits: maskContentUnits !== undefined ? units[maskContentUnits] : 1,
      maskType: maskType[(props === null || props === void 0 ? void 0 : props.maskType) || (style === null || style === void 0 ? void 0 : style.maskType) || 'luminance']
    };
    return /*#__PURE__*/React.createElement(RNSVGMask, _extends({
      ref: ref => this.refMethod(ref)
    }, withoutXY(this, props), maskProps), children);
  }
}
//# sourceMappingURL=Mask.js.map