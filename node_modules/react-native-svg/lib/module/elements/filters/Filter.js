function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import RNSVGFilter from '../../fabric/FilterNativeComponent';
import Shape from '../Shape';
export default class Filter extends Shape {
  static displayName = 'Filter';
  static defaultProps = {
    x: '-10%',
    y: '-10%',
    width: '120%',
    height: '120%',
    filterUnits: 'objectBoundingBox',
    primitiveUnits: 'userSpaceOnUse'
  };
  render() {
    const {
      id,
      x,
      y,
      width,
      height,
      filterUnits,
      primitiveUnits
    } = this.props;
    const filterProps = {
      name: id,
      x,
      y,
      width,
      height,
      filterUnits,
      primitiveUnits
    };
    return /*#__PURE__*/React.createElement(RNSVGFilter, _extends({
      ref: ref => this.refMethod(ref)
    }, filterProps), this.props.children);
  }
}
//# sourceMappingURL=Filter.js.map