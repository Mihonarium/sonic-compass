"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _FeFlood = _interopRequireDefault(require("./FeFlood"));
var _FeGaussianBlur = _interopRequireDefault(require("./FeGaussianBlur"));
var _FeMerge = _interopRequireDefault(require("./FeMerge"));
var _FeMergeNode = _interopRequireDefault(require("./FeMergeNode"));
var _FeOffset = _interopRequireDefault(require("./FeOffset"));
var _FilterPrimitive = _interopRequireDefault(require("./FilterPrimitive"));
var _FeComposite = _interopRequireDefault(require("./FeComposite"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class FeDropShadow extends _FilterPrimitive.default {
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
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_FeGaussianBlur.default, {
      in: in1,
      stdDeviation: stdDeviation
    }), /*#__PURE__*/_react.default.createElement(_FeOffset.default, {
      dx: dx,
      dy: dy,
      result: "offsetblur"
    }), /*#__PURE__*/_react.default.createElement(_FeFlood.default, {
      floodColor: this.props.floodColor,
      floodOpacity: this.props.floodOpacity
    }), /*#__PURE__*/_react.default.createElement(_FeComposite.default, {
      in2: "offsetblur",
      operator: "in"
    }), /*#__PURE__*/_react.default.createElement(_FeMerge.default, {
      result: result
    }, /*#__PURE__*/_react.default.createElement(_FeMergeNode.default, null), /*#__PURE__*/_react.default.createElement(_FeMergeNode.default, {
      in: in1
    })));
  }
}
exports.default = FeDropShadow;
//# sourceMappingURL=FeDropShadow.js.map