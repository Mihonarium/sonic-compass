"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
class FilterPrimitive extends _react.Component {
  root = null;
  static defaultPrimitiveProps = {};
  refMethod = instance => {
    this.root = instance;
  };
  setNativeProps = props => {
    var _this$root;
    (_this$root = this.root) === null || _this$root === void 0 || _this$root.setNativeProps(props);
  };
}
exports.default = FilterPrimitive;
//# sourceMappingURL=FilterPrimitive.js.map