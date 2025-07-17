import React from 'react';
import FeFlood from './FeFlood';
import FeGaussianBlur from './FeGaussianBlur';
import FeMerge from './FeMerge';
import FeMergeNode from './FeMergeNode';
import FeOffset from './FeOffset';
import FilterPrimitive from './FilterPrimitive';
import FeComposite from './FeComposite';
export default class FeDropShadow extends FilterPrimitive {
  static displayName = 'FeDropShadow';
  static defaultProps = {
    ...this.defaultPrimitiveProps
  };
  render() {
    const {
      stdDeviation,
      in: in1 = 'SourceGraphic',
      dx,
      dy,
      result
    } = this.props;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FeGaussianBlur, {
      in: in1,
      stdDeviation: stdDeviation
    }), /*#__PURE__*/React.createElement(FeOffset, {
      dx: dx,
      dy: dy,
      result: "offsetblur"
    }), /*#__PURE__*/React.createElement(FeFlood, {
      floodColor: this.props.floodColor,
      floodOpacity: this.props.floodOpacity
    }), /*#__PURE__*/React.createElement(FeComposite, {
      in2: "offsetblur",
      operator: "in"
    }), /*#__PURE__*/React.createElement(FeMerge, {
      result: result
    }, /*#__PURE__*/React.createElement(FeMergeNode, null), /*#__PURE__*/React.createElement(FeMergeNode, {
      in: in1
    })));
  }
}
//# sourceMappingURL=FeDropShadow.js.map