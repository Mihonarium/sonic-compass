function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import extractViewBox from '../lib/extract/extractViewBox';
import Shape from './Shape';
import RNSVGMarker from '../fabric/MarkerNativeComponent';
export default class Marker extends Shape {
  static displayName = 'Marker';
  static defaultProps = {
    refX: 0,
    refY: 0,
    orient: '0',
    markerWidth: 3,
    markerHeight: 3,
    markerUnits: 'strokeWidth'
  };
  render() {
    const {
      props
    } = this;
    const {
      id,
      viewBox,
      preserveAspectRatio,
      refX,
      refY,
      markerUnits,
      orient,
      markerWidth,
      markerHeight,
      children
    } = props;
    const markerProps = {
      name: id,
      refX,
      refY,
      markerUnits,
      orient: String(orient),
      markerWidth,
      markerHeight
    };
    return /*#__PURE__*/React.createElement(RNSVGMarker, _extends({
      ref: ref => this.refMethod(ref)
    }, markerProps, extractViewBox({
      viewBox,
      preserveAspectRatio
    })), children);
  }
}
//# sourceMappingURL=Marker.js.map