function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import extractProps, { propsAndStyles } from '../lib/extract/extractProps';
import { extractFont } from '../lib/extract/extractText';
import extractTransform from '../lib/extract/extractTransform';
import Shape from './Shape';
import RNSVGGroup from '../fabric/GroupNativeComponent';
export default class G extends Shape {
  static displayName = 'G';
  setNativeProps = props => {
    var _this$root;
    const matrix = !props.matrix && extractTransform(props);
    if (matrix) {
      props.matrix = matrix;
    }
    (_this$root = this.root) === null || _this$root === void 0 || _this$root.setNativeProps(props);
  };
  render() {
    const {
      props
    } = this;
    const prop = propsAndStyles(props);
    const extractedProps = extractProps(prop, this);
    const font = extractFont(prop);
    if (hasProps(font)) {
      extractedProps.font = font;
    }
    return /*#__PURE__*/React.createElement(RNSVGGroup, _extends({
      ref: ref => this.refMethod(ref)
    }, extractedProps), props.children);
  }
}
const hasProps = obj => {
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in obj) {
    return true;
  }
  return false;
};
//# sourceMappingURL=G.js.map