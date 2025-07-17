function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import Path from './Path';
import Shape from './Shape';
import extractPolyPoints from '../lib/extract/extractPolyPoints';
export default class Polygon extends Shape {
  static displayName = 'Polygon';
  static defaultProps = {
    points: ''
  };
  setNativeProps = props => {
    const {
      points
    } = props;
    if (points) {
      props.d = `M${extractPolyPoints(points)}z`;
    }
    this.root && this.root.setNativeProps(props);
  };
  render() {
    const {
      props
    } = this;
    const {
      points
    } = props;
    return /*#__PURE__*/React.createElement(Path, _extends({
      ref: this.refMethod,
      d: points && `M${extractPolyPoints(points)}z`
    }, props));
  }
}
//# sourceMappingURL=Polygon.js.map