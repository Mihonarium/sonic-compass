"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _FilterNativeComponent = _interopRequireDefault(require("../../fabric/FilterNativeComponent"));
var _Shape = _interopRequireDefault(require("../Shape"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
class Filter extends _Shape.default {
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
    return /*#__PURE__*/_react.default.createElement(_FilterNativeComponent.default, _extends({
      ref: ref => this.refMethod(ref)
    }, filterProps), this.props.children);
  }
}
exports.default = Filter;
//# sourceMappingURL=Filter.js.map